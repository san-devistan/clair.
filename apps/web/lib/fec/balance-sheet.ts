import {
  getAccountClass,
  isCustomerAccount,
  isEquityAccount,
  isFinancialDebtAccount,
  isFixedAssetAccount,
  isInventoryAccount,
  isSupplierAccount,
} from "./accounts"
import type { KpiSummary, PeriodInfo } from "./analytics"
import type {
  BalanceSheetLine,
  BalanceSheetLineKey,
  BalanceSheetRatio,
  BalanceSheetRatioStatus,
  BalanceSheetSummary,
} from "./balance-sheet-types"
import type { FecEntry } from "./types"

interface AccountBalance {
  accountNum: string
  label: string
  balance: number
  openingBalance: number
}

type BalanceAmountKey = BalanceSheetLineKey | "openingInventory"

type BalanceAmounts = Record<BalanceAmountKey, number>

interface BalancePlacement {
  key: BalanceAmountKey
  amount: number
  openingInventory?: number
}

interface BalanceMetrics {
  totalAssets: number
  totalFunding: number
  currentAssets: number
  currentLiabilities: number
  totalDebt: number
  workingCapital: number
  workingCapitalRequirement: number
  netCash: number
  averageInventory: number
  currentLiquidity: number | null
  debtToEquity: number | null
  inventoryTurnover: number | null
  cashRunway: number | null
  equityRatio: number | null
}

const BALANCE_AMOUNT_KEYS: BalanceAmountKey[] = [
  "fixedAssets",
  "inventory",
  "openingInventory",
  "customerReceivables",
  "otherReceivables",
  "cash",
  "equity",
  "financialDebt",
  "supplierPayables",
  "otherPayables",
  "negativeCash",
]

export function computeBalanceSheet(
  entries: FecEntry[],
  period: PeriodInfo,
  kpi: KpiSummary
): BalanceSheetSummary {
  const amounts = computeBalanceAmounts(entries, period, kpi.netResult)
  const metrics = computeBalanceMetrics(amounts, period, kpi)

  return buildBalanceSheetSummary(period, amounts, metrics)
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function computeAccountBalances(
  entries: FecEntry[],
  period: PeriodInfo
): AccountBalance[] {
  const map = new Map<string, AccountBalance>()
  const openingTime = period.startDate.getTime()

  for (const e of entries) {
    let account = map.get(e.compteNum)
    if (!account) {
      account = {
        accountNum: e.compteNum,
        label: e.compteLib || e.compteNum,
        balance: 0,
        openingBalance: 0,
      }
      map.set(e.compteNum, account)
    }

    const delta = e.debit - e.credit
    account.balance += delta
    if (e.ecritureDate.getTime() === openingTime)
      account.openingBalance += delta
  }

  const accounts = Array.from(map.values())
  for (const account of accounts) {
    account.balance = roundMoney(account.balance)
    account.openingBalance = roundMoney(account.openingBalance)
  }

  return accounts
}

function computeBalanceAmounts(
  entries: FecEntry[],
  period: PeriodInfo,
  netResult: number
): BalanceAmounts {
  const amounts = createBalanceAmounts()
  for (const account of computeAccountBalances(entries, period))
    applyBalanceAccount(amounts, account)
  amounts.equity += netResult
  return roundBalanceAmounts(amounts)
}

function createBalanceAmounts(): BalanceAmounts {
  return {
    fixedAssets: 0,
    inventory: 0,
    openingInventory: 0,
    customerReceivables: 0,
    otherReceivables: 0,
    cash: 0,
    equity: 0,
    financialDebt: 0,
    supplierPayables: 0,
    otherPayables: 0,
    negativeCash: 0,
  }
}

function applyBalanceAccount(amounts: BalanceAmounts, account: AccountBalance) {
  const accountClass = getAccountClass(account.accountNum)
  if (!accountClass || accountClass > 5) return

  const placement = classifyBalanceAccount(account, accountClass)
  if (!placement) return

  amounts[placement.key] += placement.amount
  if (placement.openingInventory)
    amounts.openingInventory += placement.openingInventory
}

function classifyBalanceAccount(
  account: AccountBalance,
  accountClass: number
): BalancePlacement | null {
  const { accountNum, balance, openingBalance } = account
  if (isFinancialDebtAccount(accountNum))
    return splitCreditBalance(balance, "financialDebt", "otherReceivables")
  if (isEquityAccount(accountNum)) return { key: "equity", amount: -balance }
  if (isFixedAssetAccount(accountNum))
    return { key: "fixedAssets", amount: balance }
  if (isInventoryAccount(accountNum))
    return {
      key: "inventory",
      amount: balance,
      openingInventory: openingBalance,
    }
  if (isCustomerAccount(accountNum))
    return splitDebitBalance(balance, "customerReceivables", "otherPayables")
  if (isSupplierAccount(accountNum))
    return splitCreditBalance(balance, "supplierPayables", "otherReceivables")
  if (accountClass === 4)
    return splitDebitBalance(balance, "otherReceivables", "otherPayables")
  if (accountClass === 5)
    return splitDebitBalance(balance, "cash", "negativeCash")
  return null
}

function splitDebitBalance(
  balance: number,
  debitKey: BalanceAmountKey,
  creditKey: BalanceAmountKey
): BalancePlacement {
  if (balance >= 0) return { key: debitKey, amount: balance }
  return { key: creditKey, amount: -balance }
}

function splitCreditBalance(
  balance: number,
  creditKey: BalanceAmountKey,
  debitKey: BalanceAmountKey
): BalancePlacement {
  if (balance <= 0) return { key: creditKey, amount: -balance }
  return { key: debitKey, amount: balance }
}

function roundBalanceAmounts(amounts: BalanceAmounts): BalanceAmounts {
  const rounded = createBalanceAmounts()
  for (const key of BALANCE_AMOUNT_KEYS) rounded[key] = roundMoney(amounts[key])
  return rounded
}

function computeBalanceMetrics(
  amounts: BalanceAmounts,
  period: PeriodInfo,
  kpi: KpiSummary
): BalanceMetrics {
  const totalAssets = roundMoney(
    amounts.fixedAssets +
      amounts.inventory +
      amounts.customerReceivables +
      amounts.otherReceivables +
      amounts.cash
  )
  const totalFunding = roundMoney(
    amounts.equity +
      amounts.financialDebt +
      amounts.supplierPayables +
      amounts.otherPayables +
      amounts.negativeCash
  )
  const currentAssets = roundMoney(
    amounts.inventory +
      amounts.customerReceivables +
      amounts.otherReceivables +
      amounts.cash
  )
  const currentLiabilities = roundMoney(
    amounts.supplierPayables + amounts.otherPayables + amounts.negativeCash
  )
  const totalDebt = roundMoney(
    amounts.financialDebt +
      amounts.supplierPayables +
      amounts.otherPayables +
      amounts.negativeCash
  )
  const averageInventory = averageInventoryAmount(amounts)
  const monthlyAverageExpenses =
    period.monthsCovered > 0 ? kpi.expenses / period.monthsCovered : 0

  return {
    totalAssets,
    totalFunding,
    currentAssets,
    currentLiabilities,
    totalDebt,
    workingCapital: roundMoney(
      amounts.equity + amounts.financialDebt - amounts.fixedAssets
    ),
    workingCapitalRequirement: roundMoney(
      amounts.inventory +
        amounts.customerReceivables +
        amounts.otherReceivables -
        amounts.supplierPayables -
        amounts.otherPayables
    ),
    netCash: roundMoney(amounts.cash - amounts.negativeCash),
    averageInventory,
    currentLiquidity:
      currentLiabilities > 0 ? currentAssets / currentLiabilities : null,
    debtToEquity: amounts.equity > 0 ? totalDebt / amounts.equity : null,
    inventoryTurnover:
      averageInventory > 0 ? kpi.purchases / averageInventory : null,
    cashRunway:
      monthlyAverageExpenses > 0
        ? (amounts.cash - amounts.negativeCash) / monthlyAverageExpenses
        : null,
    equityRatio: totalAssets > 0 ? amounts.equity / totalAssets : null,
  }
}

function averageInventoryAmount(amounts: BalanceAmounts): number {
  if (amounts.inventory > 0 && amounts.openingInventory > 0)
    return roundMoney((amounts.inventory + amounts.openingInventory) / 2)
  return amounts.inventory
}

function buildBalanceSheetSummary(
  period: PeriodInfo,
  amounts: BalanceAmounts,
  metrics: BalanceMetrics
): BalanceSheetSummary {
  const assets = {
    fixedAssets: amounts.fixedAssets,
    inventory: amounts.inventory,
    customerReceivables: amounts.customerReceivables,
    otherReceivables: amounts.otherReceivables,
    cash: amounts.cash,
  }
  const funding = {
    equity: amounts.equity,
    financialDebt: amounts.financialDebt,
    supplierPayables: amounts.supplierPayables,
    otherPayables: amounts.otherPayables,
    negativeCash: amounts.negativeCash,
  }

  return {
    asOf: period.endDate,
    assets,
    funding,
    assetLines: buildBalanceAssetLines(assets),
    fundingLines: buildBalanceFundingLines(funding),
    totalAssets: metrics.totalAssets,
    totalFunding: metrics.totalFunding,
    balanceGap: roundMoney(metrics.totalAssets - metrics.totalFunding),
    currentAssets: metrics.currentAssets,
    currentLiabilities: metrics.currentLiabilities,
    totalDebt: metrics.totalDebt,
    workingCapital: metrics.workingCapital,
    workingCapitalRequirement: metrics.workingCapitalRequirement,
    netCash: metrics.netCash,
    averageInventory: metrics.averageInventory,
    ratios: buildBalanceRatios(metrics, amounts),
  }
}

function buildBalanceRatios(
  metrics: BalanceMetrics,
  amounts: BalanceAmounts
): BalanceSheetRatio[] {
  return [
    {
      key: "currentLiquidity",
      label: "Liquidité générale",
      value: metrics.currentLiquidity,
      unit: "ratio",
      status: currentLiquidityStatus(metrics.currentLiquidity),
      formula: "Actifs courants / passifs courants",
    },
    {
      key: "debtToEquity",
      label: "Endettement",
      value: metrics.debtToEquity,
      unit: "ratio",
      status: debtToEquityStatus(metrics.debtToEquity, amounts.equity),
      formula: "Dettes / capitaux propres",
    },
    {
      key: "inventoryTurnover",
      label: "Rotation des stocks",
      value: metrics.inventoryTurnover,
      unit: "times",
      status: inventoryTurnoverStatus(
        metrics.inventoryTurnover,
        amounts.inventory
      ),
      formula: "Achats consommés / stock moyen estimé",
    },
    {
      key: "cashRunway",
      label: "Autonomie de trésorerie",
      value: metrics.cashRunway,
      unit: "months",
      status: cashRunwayStatus(metrics.cashRunway),
      formula: "Trésorerie nette / charges mensuelles moyennes",
    },
    {
      key: "equityRatio",
      label: "Autonomie financière",
      value: metrics.equityRatio,
      unit: "percent",
      status: equityRatioStatus(metrics.equityRatio),
      formula: "Capitaux propres / total actif",
    },
  ]
}

function buildBalanceAssetLines(
  assets: BalanceSheetSummary["assets"]
): BalanceSheetLine[] {
  return [
    {
      key: "fixedAssets",
      label: "Immobilisations",
      amount: assets.fixedAssets,
      description:
        "Investissements durables : matériel, logiciels, fonds, net d'amortissements.",
    },
    {
      key: "inventory",
      label: "Stocks",
      amount: assets.inventory,
      description:
        "Valeur comptable des marchandises, matières ou productions encore en stock.",
    },
    {
      key: "customerReceivables",
      label: "Créances clients",
      amount: assets.customerReceivables,
      description: "Factures clients émises et pas encore encaissées.",
    },
    {
      key: "otherReceivables",
      label: "Autres créances",
      amount: assets.otherReceivables,
      description: "TVA déductible, avances et autres montants récupérables.",
    },
    {
      key: "cash",
      label: "Trésorerie",
      amount: assets.cash,
      description: "Banque, caisse et placements de trésorerie au bilan.",
    },
  ]
}

function buildBalanceFundingLines(
  funding: BalanceSheetSummary["funding"]
): BalanceSheetLine[] {
  return [
    {
      key: "equity",
      label: "Capitaux propres",
      amount: funding.equity,
      description: "Capital, réserves et résultat estimé de la période.",
    },
    {
      key: "financialDebt",
      label: "Dettes financières",
      amount: funding.financialDebt,
      description: "Emprunts et dettes assimilées identifiés en comptes 16/17.",
    },
    {
      key: "negativeCash",
      label: "Trésorerie négative",
      amount: funding.negativeCash,
      description: "Découverts ou soldes bancaires créditeurs.",
    },
    {
      key: "supplierPayables",
      label: "Dettes fournisseurs",
      amount: funding.supplierPayables,
      description: "Factures fournisseurs reçues et pas encore réglées.",
    },
    {
      key: "otherPayables",
      label: "Autres dettes",
      amount: funding.otherPayables,
      description:
        "TVA collectée, dettes sociales, fiscales et autres montants à payer.",
    },
  ]
}

function currentLiquidityStatus(value: number | null): BalanceSheetRatioStatus {
  if (value === null) return "info"
  if (value < 1) return "risk"
  if (value < 1.2) return "watch"
  return "good"
}

function debtToEquityStatus(
  value: number | null,
  equity: number
): BalanceSheetRatioStatus {
  if (equity <= 0) return "risk"
  if (value === null) return "info"
  if (value > 2) return "risk"
  if (value > 1) return "watch"
  return "good"
}

function inventoryTurnoverStatus(
  value: number | null,
  inventory: number
): BalanceSheetRatioStatus {
  if (inventory <= 0 || value === null) return "info"
  if (value < 3) return "watch"
  if (value > 12) return "watch"
  return "good"
}

function cashRunwayStatus(value: number | null): BalanceSheetRatioStatus {
  if (value === null) return "info"
  if (value < 0) return "risk"
  if (value < 1) return "watch"
  return "good"
}

function equityRatioStatus(value: number | null): BalanceSheetRatioStatus {
  if (value === null) return "info"
  if (value < 0.15) return "risk"
  if (value < 0.3) return "watch"
  return "good"
}

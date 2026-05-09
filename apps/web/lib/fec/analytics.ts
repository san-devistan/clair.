import { computeAccountDetails, type AccountDetail } from "./account-details"
import {
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
  getAccountClass,
  getExpenseCategory,
  getRevenueCategory,
  isAmortizationAccount,
  isCashAccount,
  isCustomerAccount,
  isExpenseAccount,
  isExternalChargeAccount,
  isFinancialChargeAccount,
  isPayrollAccount,
  isPurchaseAccount,
  isRevenueAccount,
  isSupplierAccount,
  isTaxAccount,
  REVENUE_CATEGORIES,
  type RevenueCategory,
} from "./accounts"
import {
  type AgedBalance,
  computeAgedPayables,
  computeAgedReceivables,
} from "./aged-balance"
import { type CashProjection, computeCashProjection } from "./cash-projection"
import { computeInsights } from "./insights"
import { resolvePlanComptableEntry } from "./plan-comptable-2026"
import type { FecEntry, FecParseResult } from "./types"

export interface PeriodInfo {
  startDate: Date
  endDate: Date
  fiscalYear: number
  monthsCovered: number
}

export interface KpiSummary {
  // Compte de resultat (P&L)
  revenue: number
  expenses: number
  netResult: number
  margin: number // en %
  // Decoupage des charges
  purchases: number
  externalCharges: number
  payroll: number
  taxes: number
  financialCharges: number
  amortizations: number
  // Treso & BFR
  cashBalance: number
  customerReceivables: number
  supplierPayables: number
  // EBE = CA - achats - charges externes - personnel - impots (hors IS)
  ebe: number
  // Marge brute = CA - achats consommes
  grossMargin: number
  grossMarginRate: number
  // Seuil de rentabilite (point mort)
  // Variables = categorie "variables" du PCG (60, 611, 624)
  // Fixes = total charges - variables
  // MCV = CA - variables ; taux MCV = MCV/CA
  // Seuil = fixes / taux MCV ; marge securite = CA - seuil
  variableCosts: number
  fixedCosts: number
  contributionMargin: number
  contributionMarginRate: number // en %
  breakevenPoint: number // CA minimum pour resultat = 0
  safetyMargin: number // CA - seuil (en €)
  safetyMarginRate: number // en % du CA
}

export interface MonthlyPoint {
  month: string // YYYY-MM
  monthLabel: string
  revenue: number
  expenses: number
  result: number
  cashFlow: number
  cashBalance: number
  revenueByCategory: Record<string, number>
  expensesByCategory: Record<string, number>
}

export interface CategoryBreakdown {
  key: string
  label: string
  amount: number
  share: number
  fill?: string
}

export const UNCATEGORIZED_CATEGORY_KEY = "uncategorized"
export const UNCATEGORIZED_CATEGORY_LABEL = "Non catégorisé"

export interface TopCounterparty {
  accountNum: string
  label: string
  amount: number
  entryCount: number
  firstDate: Date
  lastDate: Date
}

export type {
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
} from "./aged-balance"
export type { CashProjection } from "./cash-projection"

export interface ActionableInsight {
  id: string
  severity: "info" | "warning" | "critical" | "positive"
  title: string
  description: string
  metric?: string
  action: string
  category:
    | "charges"
    | "ventes"
    | "tresorerie"
    | "clients"
    | "fournisseurs"
    | "marge"
}

export interface DashboardData {
  meta: FecParseResult["meta"]
  period: PeriodInfo
  kpi: KpiSummary
  monthly: MonthlyPoint[]
  expenseCategories: CategoryBreakdown[]
  revenueCategories: CategoryBreakdown[]
  topCustomers: TopCounterparty[]
  topSuppliers: TopCounterparty[]
  expenseDetails: AccountDetail[]
  revenueDetails: AccountDetail[]
  insights: ActionableInsight[]
  cashByAccount: TopCounterparty[]
  agedReceivables: AgedBalance
  agedPayables: AgedBalance
  cashProjection: CashProjection
  warnings: string[]
}

// Rampes ordonnees du plus fonce au plus clair : la categorie la plus grosse
// (idx 0 apres tri desc par montant) recoit la couleur la plus saturee.
const REVENUE_RAMP = [
  "var(--revenue-5)",
  "var(--revenue-4)",
  "var(--revenue-3)",
  "var(--revenue-2)",
  "var(--revenue-1)",
]

const EXPENSE_RAMP = [
  "var(--expense-5)",
  "var(--expense-4)",
  "var(--expense-3)",
  "var(--expense-2)",
  "var(--expense-1)",
]

const ALL_COUNTERPARTIES_LIMIT = Number.MAX_SAFE_INTEGER

function computeOfficialPlanWarnings(entries: FecEntry[]): string[] {
  const unknownAccounts = new Map<string, string>()
  for (const entry of entries) {
    if (resolvePlanComptableEntry(entry.compteNum)) continue
    if (!unknownAccounts.has(entry.compteNum))
      unknownAccounts.set(entry.compteNum, entry.compteLib)
  }

  if (unknownAccounts.size === 0) return []

  const preview = Array.from(unknownAccounts.entries())
    .slice(0, 8)
    .map(([code, label]) => (label ? `${code} (${label})` : code))
  const suffix = unknownAccounts.size > preview.length ? ", ..." : ""

  return [
    `${unknownAccounts.size} compte(s) non rattaché(s) au plan de comptes officiel 2026 : ${preview.join(", ")}${suffix}. Ces comptes sont exclus des catégories métier.`,
  ]
}

// Helpers exposes pour reattribuer les fills apres deserialisation.
// Le `fill` est de la presentation, pas de la donnee : on ne le persiste pas.
export function assignRevenueFills(
  items: CategoryBreakdown[]
): CategoryBreakdown[] {
  return items.map((it, idx) => ({
    ...it,
    fill: REVENUE_RAMP[idx % REVENUE_RAMP.length]!,
  }))
}

export function assignExpenseFills(
  items: CategoryBreakdown[]
): CategoryBreakdown[] {
  return items.map((it, idx) => ({
    ...it,
    fill: EXPENSE_RAMP[idx % EXPENSE_RAMP.length]!,
  }))
}

function categoryFillMap(
  items: CategoryBreakdown[]
): ReadonlyMap<string, string> {
  return new Map(items.map((item) => [item.key, item.fill ?? ""]))
}

function monthKey(date: Date): string {
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabel(date: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  })
  return formatter.format(date)
}

function computePeriod(entries: FecEntry[]): PeriodInfo {
  const dates = entries.map((e) => e.ecritureDate.getTime())
  const startDate = new Date(Math.min(...dates))
  const endDate = new Date(Math.max(...dates))
  const months =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth()) +
    1
  return {
    startDate,
    endDate,
    fiscalYear: endDate.getUTCFullYear(),
    monthsCovered: Math.max(1, months),
  }
}

function sumRevenue(entries: FecEntry[]): number {
  let total = 0
  for (const e of entries) {
    if (isRevenueAccount(e.compteNum)) {
      total += e.credit - e.debit
    }
  }
  return total
}

function sumExpenses(entries: FecEntry[]): number {
  let total = 0
  for (const e of entries) {
    if (isExpenseAccount(e.compteNum)) {
      total += e.debit - e.credit
    }
  }
  return total
}

function sumByPredicate(
  entries: FecEntry[],
  predicate: (e: FecEntry) => boolean
): number {
  let total = 0
  for (const e of entries) {
    if (predicate(e)) {
      total += e.debit - e.credit
    }
  }
  return total
}

function computeKpi(entries: FecEntry[]): KpiSummary {
  const revenue = sumRevenue(entries)
  const expenses = sumExpenses(entries)
  const netResult = revenue - expenses
  const margin = revenue > 0 ? (netResult / revenue) * 100 : 0

  const purchases = sumByPredicate(entries, (e) =>
    isPurchaseAccount(e.compteNum)
  )
  const externalCharges = sumByPredicate(entries, (e) =>
    isExternalChargeAccount(e.compteNum)
  )
  const payroll = sumByPredicate(entries, (e) => isPayrollAccount(e.compteNum))
  const taxes = sumByPredicate(entries, (e) => isTaxAccount(e.compteNum))
  const financialCharges = sumByPredicate(entries, (e) =>
    isFinancialChargeAccount(e.compteNum)
  )
  const amortizations = sumByPredicate(entries, (e) =>
    isAmortizationAccount(e.compteNum)
  )

  let cashBalance = 0
  let customerReceivables = 0
  let supplierPayables = 0
  for (const e of entries) {
    if (isCashAccount(e.compteNum)) {
      cashBalance += e.debit - e.credit
    }
    if (isCustomerAccount(e.compteNum)) {
      customerReceivables += e.debit - e.credit
    }
    if (isSupplierAccount(e.compteNum)) {
      supplierPayables += e.credit - e.debit
    }
  }

  const grossMargin = revenue - purchases
  const grossMarginRate = revenue > 0 ? (grossMargin / revenue) * 100 : 0
  const ebe = revenue - purchases - externalCharges - payroll - taxes

  // Seuil de rentabilite : on s'appuie sur la categorisation "variables" du PCG
  // (60 achats, 611 sous-traitance, 624 transports). Le reste des charges 6x est
  // considere comme fixe — approximation classique en absence de compta analytique.
  const variableCosts = sumByPredicate(entries, (e) => {
    const cat = getExpenseCategory(e.compteNum)
    return cat?.key === "variables"
  })
  const fixedCosts = expenses - variableCosts
  const contributionMargin = revenue - variableCosts
  const contributionMarginRate =
    revenue > 0 ? (contributionMargin / revenue) * 100 : 0
  const breakevenPoint =
    contributionMarginRate > 0 ? fixedCosts / (contributionMarginRate / 100) : 0
  const safetyMargin = breakevenPoint > 0 ? revenue - breakevenPoint : 0
  const safetyMarginRate = revenue > 0 ? (safetyMargin / revenue) * 100 : 0

  return {
    revenue,
    expenses,
    netResult,
    margin,
    purchases,
    externalCharges,
    payroll,
    taxes,
    financialCharges,
    amortizations,
    cashBalance,
    customerReceivables,
    supplierPayables,
    grossMargin,
    grossMarginRate,
    ebe,
    variableCosts,
    fixedCosts,
    contributionMargin,
    contributionMarginRate,
    breakevenPoint,
    safetyMargin,
    safetyMarginRate,
  }
}

function computeMonthly(entries: FecEntry[]): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>()
  let runningCash = 0

  // Tri par date pour calculer le solde de tresorerie cumule
  const sorted = [...entries].sort(
    (a, b) => a.ecritureDate.getTime() - b.ecritureDate.getTime()
  )

  for (const e of sorted) {
    const key = monthKey(e.ecritureDate)
    let bucket = map.get(key)
    if (!bucket) {
      bucket = {
        month: key,
        monthLabel: monthLabel(e.ecritureDate),
        revenue: 0,
        expenses: 0,
        result: 0,
        cashFlow: 0,
        cashBalance: 0,
        revenueByCategory: {},
        expensesByCategory: {},
      }
      map.set(key, bucket)
    }
    if (isRevenueAccount(e.compteNum)) {
      const amount = e.credit - e.debit
      const category = getRevenueCategory(e.compteNum)
      bucket.revenue += amount
      addMonthlyCategoryAmount(
        bucket.revenueByCategory,
        category?.key ?? UNCATEGORIZED_CATEGORY_KEY,
        amount
      )
    }
    if (isExpenseAccount(e.compteNum)) {
      const amount = e.debit - e.credit
      const category = getExpenseCategory(e.compteNum)
      bucket.expenses += amount
      addMonthlyCategoryAmount(
        bucket.expensesByCategory,
        category?.key ?? UNCATEGORIZED_CATEGORY_KEY,
        amount
      )
    }
    if (isCashAccount(e.compteNum)) {
      const delta = e.debit - e.credit
      bucket.cashFlow += delta
      runningCash += delta
      bucket.cashBalance = runningCash
    }
  }

  // Calcul du resultat et report du solde de cash sur les mois sans mouvement
  const sortedKeys = Array.from(map.keys()).sort()
  let lastBalance = 0
  for (const k of sortedKeys) {
    const point = map.get(k)!
    point.result = point.revenue - point.expenses
    if (point.cashFlow === 0) {
      point.cashBalance = lastBalance
    } else {
      lastBalance = point.cashBalance
    }
  }

  return sortedKeys.map((k) => map.get(k)!)
}

function addMonthlyCategoryAmount(
  amounts: Record<string, number>,
  categoryKey: string,
  amount: number
) {
  if (amount === 0) return
  amounts[categoryKey] = (amounts[categoryKey] ?? 0) + amount
}

interface CategoryAccumulator {
  amount: number
}

function computeExpenseBreakdown(entries: FecEntry[]): CategoryBreakdown[] {
  const totals = new Map<string, CategoryAccumulator>()
  let total = 0

  for (const e of entries) {
    const cat = getExpenseCategory(e.compteNum)
    if (!cat) continue
    const amount = e.debit - e.credit
    if (amount === 0) continue
    const acc = totals.get(cat.label) ?? { amount: 0 }
    acc.amount += amount
    totals.set(cat.label, acc)
    total += amount
  }

  if (total <= 0) return []

  const items: CategoryBreakdown[] = []
  for (const cat of EXPENSE_CATEGORIES) {
    const acc = totals.get(cat.label)
    if (!acc || acc.amount <= 0) continue
    items.push({
      key: cat.key,
      label: cat.label,
      amount: acc.amount,
      share: (acc.amount / total) * 100,
    })
  }

  items.sort((a, b) => b.amount - a.amount)
  return assignExpenseFills(items)
}

function computeRevenueBreakdown(entries: FecEntry[]): CategoryBreakdown[] {
  const totals = new Map<string, CategoryAccumulator>()
  let total = 0

  for (const e of entries) {
    const cat = getRevenueCategory(e.compteNum)
    if (!cat) continue
    const amount = e.credit - e.debit
    if (amount === 0) continue
    const acc = totals.get(cat.label) ?? { amount: 0 }
    acc.amount += amount
    totals.set(cat.label, acc)
    total += amount
  }

  if (total <= 0) return []

  const items: CategoryBreakdown[] = []
  for (const cat of REVENUE_CATEGORIES) {
    const acc = totals.get(cat.label)
    if (!acc || acc.amount <= 0) continue
    items.push({
      key: cat.key,
      label: cat.label,
      amount: acc.amount,
      share: (acc.amount / total) * 100,
    })
  }

  items.sort((a, b) => b.amount - a.amount)
  return assignRevenueFills(items)
}

function computeTopCounterparties(
  entries: FecEntry[],
  predicate: (e: FecEntry) => boolean,
  amountFn: (e: FecEntry) => number,
  limit: number
): TopCounterparty[] {
  const map = new Map<string, TopCounterparty>()
  for (const e of entries) {
    if (!predicate(e)) continue
    const key = e.compAuxNum || e.compteNum
    const label = e.compAuxLib || e.compteLib || key
    const amount = amountFn(e)
    if (amount === 0) continue
    let item = map.get(key)
    if (!item) {
      item = {
        accountNum: key,
        label,
        amount: 0,
        entryCount: 0,
        firstDate: e.ecritureDate,
        lastDate: e.ecritureDate,
      }
      map.set(key, item)
    }
    item.amount += amount
    item.entryCount += 1
    if (e.ecritureDate < item.firstDate) {
      item.firstDate = e.ecritureDate
    }
    if (e.ecritureDate > item.lastDate) {
      item.lastDate = e.ecritureDate
    }
  }
  const list = Array.from(map.values()).filter((c) => c.amount > 0)
  list.sort((a, b) => b.amount - a.amount)
  return list.slice(0, limit)
}

function computeCashByAccount(entries: FecEntry[]): TopCounterparty[] {
  const map = new Map<string, TopCounterparty>()
  for (const e of entries) {
    if (!isCashAccount(e.compteNum)) continue
    let item = map.get(e.compteNum)
    if (!item) {
      item = {
        accountNum: e.compteNum,
        label: e.compteLib || e.compteNum,
        amount: 0,
        entryCount: 0,
        firstDate: e.ecritureDate,
        lastDate: e.ecritureDate,
      }
      map.set(e.compteNum, item)
    }
    item.amount += e.debit - e.credit
    item.entryCount += 1
    if (e.ecritureDate < item.firstDate) {
      item.firstDate = e.ecritureDate
    }
    if (e.ecritureDate > item.lastDate) {
      item.lastDate = e.ecritureDate
    }
  }
  const list = Array.from(map.values())
  list.sort((a, b) => b.amount - a.amount)
  return list
}

export function buildDashboardData(parseResult: FecParseResult): DashboardData {
  const { entries, meta, warnings } = parseResult
  const planWarnings = computeOfficialPlanWarnings(entries)

  const period = computePeriod(entries)
  const kpi = computeKpi(entries)
  const monthly = computeMonthly(entries)
  const expenseCategories = computeExpenseBreakdown(entries)
  const revenueCategories = computeRevenueBreakdown(entries)
  const expenseFillByKey = categoryFillMap(expenseCategories)
  const revenueFillByKey = categoryFillMap(revenueCategories)

  // Pour les top clients/fournisseurs, on veut le VOLUME total facture sur la periode,
  // pas le solde courant. Sur un compte 411xxx, le debit correspond aux factures emises.
  // Sur un 401xxx, le credit correspond aux factures recues.
  const topCustomers = computeTopCounterparties(
    entries,
    (e) =>
      isCustomerAccount(e.compteNum) &&
      (e.compAuxNum.length > 0 || e.compteNum.length > 3),
    (e) => e.debit,
    ALL_COUNTERPARTIES_LIMIT
  )

  const topSuppliers = computeTopCounterparties(
    entries,
    (e) =>
      isSupplierAccount(e.compteNum) &&
      (e.compAuxNum.length > 0 || e.compteNum.length > 3),
    (e) => e.credit,
    ALL_COUNTERPARTIES_LIMIT
  )

  const expenseDetails = computeAccountDetails(
    entries,
    (e) => isExpenseAccount(e.compteNum),
    (e) => e.debit - e.credit,
    {
      auxiliaryPredicate: (e) => isSupplierAccount(e.compteNum),
      categoryForAccount: (accountNum) => {
        const category = getExpenseCategory(accountNum)
        if (!category) return null
        return {
          categoryKey: category.key,
          categoryLabel: category.label,
          categoryFill:
            expenseFillByKey.get(category.key) ?? "var(--muted-foreground)",
        }
      },
    }
  )

  const revenueDetails = computeAccountDetails(
    entries,
    (e) => isRevenueAccount(e.compteNum),
    (e) => e.credit - e.debit,
    {
      auxiliaryPredicate: (e) => isCustomerAccount(e.compteNum),
      categoryForAccount: (accountNum) => {
        const category = getRevenueCategory(accountNum)
        if (!category) return null
        return {
          categoryKey: category.key,
          categoryLabel: category.label,
          categoryFill:
            revenueFillByKey.get(category.key) ?? "var(--muted-foreground)",
        }
      },
    }
  )

  const cashByAccount = computeCashByAccount(entries)

  const agedReceivables = computeAgedReceivables(entries, period.endDate)
  const agedPayables = computeAgedPayables(entries, period.endDate)

  const cashProjection = computeCashProjection(entries, period.endDate, {
    currentCash: kpi.cashBalance,
    overduePayables: agedPayables.overdueAmount,
    overdueReceivables: agedReceivables.overdueAmount,
  })

  const insights = computeInsights({
    kpi,
    expenseCategories,
    topCustomers,
    topSuppliers,
    monthly,
  })

  return {
    meta,
    period,
    kpi,
    monthly,
    expenseCategories,
    revenueCategories,
    topCustomers,
    topSuppliers,
    expenseDetails,
    revenueDetails,
    insights,
    cashByAccount,
    agedReceivables,
    agedPayables,
    cashProjection,
    warnings: [...warnings, ...planWarnings],
  }
}

// Re-export des types et constantes pour les composants
export type { ExpenseCategory, RevenueCategory }
export { EXPENSE_CATEGORIES, REVENUE_CATEGORIES, getAccountClass }

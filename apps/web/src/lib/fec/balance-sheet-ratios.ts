import type {
  BalanceSheetRatio,
  BalanceSheetRatioStatus,
} from "./balance-sheet-types"

export interface BalanceMetrics {
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

interface BalanceRatioAmounts {
  equity: number
  inventory: number
}

export function buildBalanceRatios(
  metrics: BalanceMetrics,
  amounts: BalanceRatioAmounts
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

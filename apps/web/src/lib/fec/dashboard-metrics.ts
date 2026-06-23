import type {
  CashProjection,
  DashboardData,
  KpiSummary,
  MonthlyPoint,
  TopCounterparty,
} from "./analytics"

const MONTHS_PER_YEAR = 12
const DAYS_PER_YEAR = 365
const LOW_CASH_REVENUE_RATIO = 0.05

export type DashboardKpiTone = "default" | "success" | "warning" | "danger"

export interface TreasuryProjectionPoint {
  label: string
  balance: number
  flow: number
}

function annualizeAmount(amount: number, monthsCovered: number): number {
  return monthsCovered > 0 ? (amount / monthsCovered) * MONTHS_PER_YEAR : amount
}

export function computeCustomerPaymentDelay(
  data: Pick<DashboardData, "kpi" | "period">
): number {
  const annualizedRevenue = annualizeAmount(
    data.kpi.revenue,
    data.period.monthsCovered
  )
  return annualizedRevenue > 0
    ? (data.kpi.customerReceivables / annualizedRevenue) * DAYS_PER_YEAR
    : 0
}

export function computeSupplierPaymentDelay(
  data: Pick<DashboardData, "kpi" | "period">
): number {
  const annualizedExpenses = annualizeAmount(
    data.kpi.expenses,
    data.period.monthsCovered
  )
  return annualizedExpenses > 0
    ? (data.kpi.supplierPayables / annualizedExpenses) * DAYS_PER_YEAR
    : 0
}

export function computeRecentRevenueGrowth(
  monthly: MonthlyPoint[],
  monthCount = 3
): number | null {
  if (monthly.length < monthCount * 2) return null

  const current = monthly
    .slice(-monthCount)
    .reduce((sum, month) => sum + month.revenue, 0)
  const previous = monthly
    .slice(-monthCount * 2, -monthCount)
    .reduce((sum, month) => sum + month.revenue, 0)

  return previous > 0 ? ((current - previous) / previous) * 100 : 0
}

export function computeMonthlyAverage(
  total: number,
  monthCount: number
): number {
  return monthCount > 0 ? total / monthCount : 0
}

export function computeTopCounterpartyShare(
  counterparties: TopCounterparty[],
  baseAmount: number,
  count = 3
): number {
  if (counterparties.length < count || baseAmount <= 0) return 0

  const topAmount = counterparties
    .slice(0, count)
    .reduce((sum, counterparty) => sum + counterparty.amount, 0)

  return (topAmount / baseAmount) * 100
}

export function computeCounterpartyVolume(
  counterparties: TopCounterparty[]
): number {
  return counterparties.reduce(
    (sum, counterparty) => sum + counterparty.amount,
    0
  )
}

export function computeNetCashEngagement(
  cashProjection: CashProjection
): number {
  return cashProjection.totalInflows - cashProjection.totalOutflows
}

export function buildTreasuryProjectionPoint(
  cashProjection: CashProjection
): TreasuryProjectionPoint {
  return {
    label: "Prévis.",
    balance: cashProjection.projectedCash,
    flow: computeNetCashEngagement(cashProjection),
  }
}

export function getCashRiskTone(
  cashBalance: number,
  revenue: number
): Extract<DashboardKpiTone, "danger" | "warning"> | null {
  if (cashBalance < 0) return "danger"
  if (cashBalance < revenue * LOW_CASH_REVENUE_RATIO) return "warning"
  return null
}

export function getMarginTone(margin: KpiSummary["margin"]): DashboardKpiTone {
  if (margin < 0) return "danger"
  if (margin < 5) return "warning"
  return "success"
}

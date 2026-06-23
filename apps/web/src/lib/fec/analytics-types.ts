import type { AccountDetail } from "./account-details"
import type {
  AgedBalance,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
} from "./aged-balance"
import type { BalanceSheetSummary } from "./balance-sheet-types"
import type { CashProjection } from "./cash-projection"
import type { FecParseResult } from "./types"

export interface PeriodInfo {
  startDate: Date
  endDate: Date
  fiscalYear: number
  monthsCovered: number
}

export interface KpiSummary {
  revenue: number
  expenses: number
  netResult: number
  margin: number
  purchases: number
  externalCharges: number
  payroll: number
  taxes: number
  financialCharges: number
  amortizations: number
  cashBalance: number
  customerReceivables: number
  supplierPayables: number
  ebe: number
  grossMargin: number
  grossMarginRate: number
  variableCosts: number
  fixedCosts: number
  contributionMargin: number
  contributionMarginRate: number
  breakevenPoint: number
  safetyMargin: number
  safetyMarginRate: number
}

export interface MonthlyPoint {
  month: string
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
  balanceSheet: BalanceSheetSummary
  warnings: string[]
}

export type {
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
  CashProjection,
}

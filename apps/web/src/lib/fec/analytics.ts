import { computeAccountDetails } from "./account-details"
import {
  getExpenseCategory,
  getRevenueCategory,
  isCustomerAccount,
  isExpenseAccount,
  isRevenueAccount,
  isSupplierAccount,
} from "./accounts"
import { computeAgedPayables, computeAgedReceivables } from "./aged-balance"
import {
  assignExpenseFills,
  assignRevenueFills,
  categoryFillMap,
  computeExpenseBreakdown,
  computeRevenueBreakdown,
} from "./analytics-categories"
import {
  computeCashByAccount,
  computeOfficialPlanWarnings,
  computeTopCustomers,
  computeTopSuppliers,
} from "./analytics-counterparties"
import { computeKpi } from "./analytics-kpi"
import { computeMonthly, computePeriod } from "./analytics-monthly"
import type { DashboardData } from "./analytics-types"
import { computeBalanceSheet } from "./balance-sheet"
import { computeCashProjection } from "./cash-projection"
import { computeInsights } from "./insights"
import type { FecEntry, FecParseResult } from "./types"

export function buildDashboardData(parseResult: FecParseResult): DashboardData {
  const { entries, meta, warnings } = parseResult
  const period = computePeriod(entries)
  const kpi = computeKpi(entries)
  const balanceSheet = computeBalanceSheet(entries, period, kpi)
  const monthly = computeMonthly(entries)
  const expenseCategories = computeExpenseBreakdown(entries)
  const revenueCategories = computeRevenueBreakdown(entries)
  const topCustomers = computeTopCustomers(entries)
  const topSuppliers = computeTopSuppliers(entries)
  const expenseDetails = buildExpenseDetails(entries, expenseCategories)
  const revenueDetails = buildRevenueDetails(entries, revenueCategories)
  const agedReceivables = computeAgedReceivables(entries, period.endDate)
  const agedPayables = computeAgedPayables(entries, period.endDate)
  const cashProjection = computeCashProjection(entries, period.endDate, {
    currentCash: kpi.cashBalance,
    overduePayables: agedPayables.overdueAmount,
    overdueReceivables: agedReceivables.overdueAmount,
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
    insights: computeInsights({
      kpi,
      expenseCategories,
      topCustomers,
      topSuppliers,
      monthly,
    }),
    cashByAccount: computeCashByAccount(entries),
    agedReceivables,
    agedPayables,
    cashProjection,
    balanceSheet,
    warnings: [...warnings, ...computeOfficialPlanWarnings(entries)],
  }
}

function buildExpenseDetails(
  entries: FecEntry[],
  expenseCategories: DashboardData["expenseCategories"]
) {
  const expenseFillByKey = categoryFillMap(expenseCategories)

  return computeAccountDetails(
    entries,
    (entry) => isExpenseAccount(entry.compteNum),
    (entry) => entry.debit - entry.credit,
    {
      auxiliaryPredicate: (entry) => isSupplierAccount(entry.compteNum),
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
}

function buildRevenueDetails(
  entries: FecEntry[],
  revenueCategories: DashboardData["revenueCategories"]
) {
  const revenueFillByKey = categoryFillMap(revenueCategories)

  return computeAccountDetails(
    entries,
    (entry) => isRevenueAccount(entry.compteNum),
    (entry) => entry.credit - entry.debit,
    {
      auxiliaryPredicate: (entry) => isCustomerAccount(entry.compteNum),
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
}

export { assignExpenseFills, assignRevenueFills }
export {
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_CATEGORY_LABEL,
} from "./analytics-types"
export type {
  ActionableInsight,
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
  CashProjection,
  CategoryBreakdown,
  DashboardData,
  KpiSummary,
  MonthlyPoint,
  PeriodInfo,
  TopCounterparty,
} from "./analytics-types"

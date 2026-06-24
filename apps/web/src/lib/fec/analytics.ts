import { computeAccountDetails } from "./account-details"
import {
  getExpenseCategory,
  getRevenueCategory,
  isCashAccount,
  isCustomerAccount,
  isExpenseAccount,
  isRevenueAccount,
  isSupplierAccount,
} from "./accounts"
import { computeAgedPayables, computeAgedReceivables } from "./aged-balance"
import {
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
import { monthRangeDates, type MonthRange } from "./date-ranges"
import { computeInsights } from "./insights"
import type { FecEntry, FecParseResult } from "./types"

interface DashboardDataOptions {
  range?: MonthRange
}

interface DashboardEntrySelection {
  periodEntries: FecEntry[]
  asOfEntries: FecEntry[]
  openingCashBalance: number
}

export function buildDashboardDataOrNull(
  parseResult: FecParseResult,
  options: DashboardDataOptions = {}
): DashboardData | null {
  const { entries, meta, warnings } = parseResult
  const selection = selectDashboardEntries(entries, options.range)
  if (!selection) return null

  const { periodEntries, asOfEntries, openingCashBalance } = selection
  const period = computePeriod(periodEntries, options.range)
  const kpi = computeKpi(periodEntries, asOfEntries)
  const balanceSheet = computeBalanceSheet(asOfEntries, period, kpi)
  const monthly = computeMonthly(
    periodEntries,
    options.range,
    openingCashBalance
  )
  const expenseCategories = computeExpenseBreakdown(periodEntries)
  const revenueCategories = computeRevenueBreakdown(periodEntries)
  const topCustomers = computeTopCustomers(periodEntries)
  const topSuppliers = computeTopSuppliers(periodEntries)
  const expenseDetails = buildExpenseDetails(periodEntries, expenseCategories)
  const revenueDetails = buildRevenueDetails(periodEntries, revenueCategories)
  const agedReceivables = computeAgedReceivables(asOfEntries, period.endDate)
  const agedPayables = computeAgedPayables(asOfEntries, period.endDate)
  const cashProjection = computeCashProjection(asOfEntries, period.endDate, {
    currentCash: kpi.cashBalance,
    overduePayables: agedPayables.overdueAmount,
    overdueReceivables: agedReceivables.overdueAmount,
  })

  return {
    meta: {
      ...meta,
      rowCount: periodEntries.length,
      minDate: period.startDate,
      maxDate: period.endDate,
    },
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
    cashByAccount: computeCashByAccount(asOfEntries),
    agedReceivables,
    agedPayables,
    cashProjection,
    balanceSheet,
    warnings: [...warnings, ...computeOfficialPlanWarnings(periodEntries)],
  }
}

function selectDashboardEntries(
  sourceEntries: FecEntry[],
  range: MonthRange | undefined
): DashboardEntrySelection | null {
  if (!range) {
    return sourceEntries.length > 0
      ? {
          periodEntries: sourceEntries,
          asOfEntries: sourceEntries,
          openingCashBalance: 0,
        }
      : null
  }

  const { startDate, endDate } = monthRangeDates(range)
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  const periodEntries = sourceEntries.filter((entry) => {
    const entryTime = entry.ecritureDate.getTime()
    return entryTime >= startTime && entryTime <= endTime
  })

  if (periodEntries.length === 0) return null

  const asOfEntries = sourceEntries.filter(
    (entry) => entry.ecritureDate.getTime() <= endTime
  )

  return {
    periodEntries,
    asOfEntries,
    openingCashBalance: computeOpeningCashBalance(sourceEntries, startTime),
  }
}

function computeOpeningCashBalance(
  sourceEntries: FecEntry[],
  periodStartTime: number
): number {
  let balance = 0
  for (const entry of sourceEntries) {
    if (
      entry.ecritureDate.getTime() < periodStartTime &&
      isCashAccount(entry.compteNum)
    ) {
      balance += entry.debit - entry.credit
    }
  }
  return balance
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

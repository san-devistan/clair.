import {
  getExpenseCategory,
  getRevenueCategory,
  isCashAccount,
  isExpenseAccount,
  isRevenueAccount,
} from "./accounts"
import {
  type MonthlyPoint,
  type PeriodInfo,
  UNCATEGORIZED_CATEGORY_KEY,
} from "./analytics-types"
import {
  monthKeyFromDate,
  monthKeysInRange,
  monthRangeDates,
  monthStartDate,
  type MonthRange,
} from "./date-ranges"
import { formatShortDate } from "./format"
import type { FecEntry } from "./types"

export function computePeriod(
  entries: FecEntry[],
  range?: MonthRange
): PeriodInfo {
  if (range) return computePeriodFromRange(range)
  if (entries.length === 0) {
    throw new Error("Cannot compute an accounting period without entries.")
  }

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

export function computeMonthly(
  entries: FecEntry[],
  range?: MonthRange,
  openingCashBalance = 0
): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>()
  seedMonthlyPoints(map, range)

  let runningCash = openingCashBalance
  const sorted = [...entries].toSorted(
    (a, b) => a.ecritureDate.getTime() - b.ecritureDate.getTime()
  )

  for (const entry of sorted) {
    const bucket = getOrCreateMonthlyPoint(map, entry)
    addRevenueToMonthlyPoint(bucket, entry)
    addExpenseToMonthlyPoint(bucket, entry)
    runningCash = addCashToMonthlyPoint(bucket, entry, runningCash)
  }

  return finalizeMonthlyPoints(map, openingCashBalance)
}

function computePeriodFromRange(range: MonthRange): PeriodInfo {
  const { startDate, endDate } = monthRangeDates(range)
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

function seedMonthlyPoints(
  map: Map<string, MonthlyPoint>,
  range: MonthRange | undefined
) {
  if (!range) return
  for (const key of monthKeysInRange(range))
    map.set(key, createMonthlyPoint(key))
}

function getOrCreateMonthlyPoint(
  map: Map<string, MonthlyPoint>,
  entry: FecEntry
): MonthlyPoint {
  const key = monthKeyFromDate(entry.ecritureDate)
  const existing = map.get(key)
  if (existing) return existing

  const point = createMonthlyPoint(key)
  map.set(key, point)
  return point
}

function createMonthlyPoint(key: string): MonthlyPoint {
  return {
    month: key,
    monthLabel: monthLabel(key),
    revenue: 0,
    expenses: 0,
    result: 0,
    cashFlow: 0,
    cashBalance: 0,
    revenueByCategory: {},
    expensesByCategory: {},
  }
}

function addRevenueToMonthlyPoint(point: MonthlyPoint, entry: FecEntry) {
  if (!isRevenueAccount(entry.compteNum)) return

  const amount = entry.credit - entry.debit
  const category = getRevenueCategory(entry.compteNum)
  point.revenue += amount
  addMonthlyCategoryAmount(
    point.revenueByCategory,
    category?.key ?? UNCATEGORIZED_CATEGORY_KEY,
    amount
  )
}

function addExpenseToMonthlyPoint(point: MonthlyPoint, entry: FecEntry) {
  if (!isExpenseAccount(entry.compteNum)) return

  const amount = entry.debit - entry.credit
  const category = getExpenseCategory(entry.compteNum)
  point.expenses += amount
  addMonthlyCategoryAmount(
    point.expensesByCategory,
    category?.key ?? UNCATEGORIZED_CATEGORY_KEY,
    amount
  )
}

function addCashToMonthlyPoint(
  point: MonthlyPoint,
  entry: FecEntry,
  runningCash: number
): number {
  if (!isCashAccount(entry.compteNum)) return runningCash

  const delta = entry.debit - entry.credit
  point.cashFlow += delta
  point.cashBalance = runningCash + delta
  return point.cashBalance
}

function finalizeMonthlyPoints(
  map: Map<string, MonthlyPoint>,
  openingCashBalance: number
): MonthlyPoint[] {
  const sortedKeys = Array.from(map.keys()).toSorted()
  let lastBalance = openingCashBalance
  for (const key of sortedKeys) {
    const point = map.get(key)
    if (!point) continue
    point.result = point.revenue - point.expenses
    if (point.cashFlow === 0) point.cashBalance = lastBalance
    else lastBalance = point.cashBalance
  }

  return sortedKeys.flatMap((key) => {
    const point = map.get(key)
    return point ? [point] : []
  })
}

function addMonthlyCategoryAmount(
  amounts: Record<string, number>,
  categoryKey: string,
  amount: number
) {
  if (amount === 0) return
  amounts[categoryKey] = (amounts[categoryKey] ?? 0) + amount
}

function monthLabel(month: string): string {
  return formatShortDate(monthStartDate(month))
}

import {
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
  getExpenseCategory,
  getRevenueCategory,
  isExpenseAccount,
  isRevenueAccount,
  REVENUE_CATEGORIES,
  type RevenueCategory,
} from "./accounts"
import type { CategoryBreakdown } from "./analytics-types"
import type { FecEntry } from "./types"

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

interface CategoryAccumulator {
  amount: number
}

export function assignRevenueFills(
  items: CategoryBreakdown[]
): CategoryBreakdown[] {
  return assignFills(items, REVENUE_RAMP)
}

export function assignExpenseFills(
  items: CategoryBreakdown[]
): CategoryBreakdown[] {
  return assignFills(items, EXPENSE_RAMP)
}

export function categoryFillMap(
  items: CategoryBreakdown[]
): ReadonlyMap<string, string> {
  return new Map(items.map((item) => [item.key, item.fill ?? ""]))
}

export function computeExpenseBreakdown(
  entries: FecEntry[]
): CategoryBreakdown[] {
  return computeCategoryBreakdown({
    entries,
    categories: EXPENSE_CATEGORIES,
    amountForEntry: (entry) => entry.debit - entry.credit,
    categoryForAccount: getExpenseCategory,
    isAccount: isExpenseAccount,
    assignFills: assignExpenseFills,
  })
}

export function computeRevenueBreakdown(
  entries: FecEntry[]
): CategoryBreakdown[] {
  return computeCategoryBreakdown({
    entries,
    categories: REVENUE_CATEGORIES,
    amountForEntry: (entry) => entry.credit - entry.debit,
    categoryForAccount: getRevenueCategory,
    isAccount: isRevenueAccount,
    assignFills: assignRevenueFills,
  })
}

function assignFills(
  items: CategoryBreakdown[],
  ramp: readonly string[]
): CategoryBreakdown[] {
  return items.map((item, index) => ({
    ...item,
    fill: ramp[index % ramp.length],
  }))
}

function computeCategoryBreakdown({
  entries,
  categories,
  amountForEntry,
  categoryForAccount,
  isAccount,
  assignFills: applyFills,
}: {
  entries: FecEntry[]
  categories: readonly (ExpenseCategory | RevenueCategory)[]
  amountForEntry: (entry: FecEntry) => number
  categoryForAccount: (
    accountNum: string
  ) => ExpenseCategory | RevenueCategory | null
  isAccount: (accountNum: string) => boolean
  assignFills: (items: CategoryBreakdown[]) => CategoryBreakdown[]
}): CategoryBreakdown[] {
  const { totals, total } = accumulateCategoryTotals(
    entries,
    isAccount,
    categoryForAccount,
    amountForEntry
  )
  if (total <= 0) return []

  const items = buildCategoryBreakdownItems(categories, totals, total)
  return applyFills(items.toSorted((a, b) => b.amount - a.amount))
}

function accumulateCategoryTotals(
  entries: FecEntry[],
  isAccount: (accountNum: string) => boolean,
  categoryForAccount: (
    accountNum: string
  ) => ExpenseCategory | RevenueCategory | null,
  amountForEntry: (entry: FecEntry) => number
) {
  const totals = new Map<string, CategoryAccumulator>()
  let total = 0

  for (const entry of entries) {
    if (!isAccount(entry.compteNum)) continue
    const category = categoryForAccount(entry.compteNum)
    if (!category) continue
    const amount = amountForEntry(entry)
    if (amount === 0) continue
    const acc = totals.get(category.label) ?? { amount: 0 }
    acc.amount += amount
    totals.set(category.label, acc)
    total += amount
  }

  return { totals, total }
}

function buildCategoryBreakdownItems(
  categories: readonly (ExpenseCategory | RevenueCategory)[],
  totals: Map<string, CategoryAccumulator>,
  total: number
): CategoryBreakdown[] {
  const items: CategoryBreakdown[] = []
  for (const category of categories) {
    const acc = totals.get(category.label)
    if (!acc || acc.amount <= 0) continue
    items.push({
      key: category.key,
      label: category.label,
      amount: acc.amount,
      share: (acc.amount / total) * 100,
    })
  }
  return items
}

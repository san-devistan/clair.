import {
  type ChartColorMode,
  rankedExpenseBarFill,
  rankedRevenueBarFill,
} from "@/components/fec/bar-chart-style"
import {
  type CategoryBreakdown,
  type MonthlyPoint,
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_CATEGORY_LABEL,
} from "@/lib/fec/analytics"
import type { ChartConfig } from "@workspace/ui/components/chart"

export type Metric = "revenue" | "expenses" | "result"
export type StackedMetric = Exclude<Metric, "result">

export interface StackedCategory {
  key: string
  label: string
  fill: string
  primaryDataKey: string
  comparisonDataKey: string
}

interface BuildStackedCategoriesArgs {
  metric: StackedMetric
  monthly: MonthlyPoint[]
  categories: CategoryBreakdown[]
  comparison?: MonthlyPoint[]
  comparisonCategories: CategoryBreakdown[]
  colorMode: ChartColorMode
}

export const METRIC_LABEL: Record<Metric, string> = {
  revenue: "Revenus",
  expenses: "Charges",
  result: "Résultat",
}

const METRIC_COLOR: Record<Metric, string> = {
  revenue: "var(--revenue)",
  expenses: "var(--expense)",
  result: "var(--result)",
}

const COMPARISON_COLOR: Record<Metric, string> = {
  revenue: "var(--revenue-1)",
  expenses: "var(--expense-1)",
  result: "var(--result)",
}

export const COMPARISON_KEY = "comparison"

const STACK_CELL_RADIUS = 4

export function buildChartConfig(
  metric: Metric,
  stackedCategories: StackedCategory[]
): ChartConfig {
  if (stackedCategories.length === 0) {
    return {
      [metric]: { label: METRIC_LABEL[metric], color: METRIC_COLOR[metric] },
      [COMPARISON_KEY]: {
        label: "Période comparée",
        color: COMPARISON_COLOR[metric],
      },
    }
  }

  const config: ChartConfig = {}
  for (const category of stackedCategories) {
    config[category.primaryDataKey] = {
      label: category.label,
      color: category.fill,
    }
    config[category.comparisonDataKey] = {
      label: `${category.label} (comparé)`,
      color: category.fill,
    }
  }
  return config
}

export function buildStackedDatum(
  point: MonthlyPoint,
  metric: StackedMetric | null,
  categories: StackedCategory[],
  comparisonPoint?: MonthlyPoint
): Record<string, number | null> {
  if (!metric) return {}

  const datum: Record<string, number | null> = {}
  for (const category of categories) {
    datum[category.primaryDataKey] =
      categoryAmountsFor(point, metric)[category.key] ?? 0
    datum[category.comparisonDataKey] = comparisonPoint
      ? (categoryAmountsFor(comparisonPoint, metric)[category.key] ?? 0)
      : null
  }
  return datum
}

export function buildStackedCategories({
  metric,
  monthly,
  categories,
  comparison,
  comparisonCategories,
  colorMode,
}: BuildStackedCategoriesArgs): StackedCategory[] {
  const { keys, labels } = collectStackedCategoryKeys(
    metric,
    monthly,
    categories,
    comparison,
    comparisonCategories
  )
  const visibleKeys = keys.filter((key) =>
    hasCategoryAmount(key, metric, monthly, comparison)
  )

  return visibleKeys.map((key, index) => ({
    key,
    label: labels.get(key) ?? fallbackCategoryLabel(key),
    fill: stackedCategoryFill(metric, index, visibleKeys.length, colorMode),
    primaryDataKey: categoryDataKey("primary", metric, key),
    comparisonDataKey: categoryDataKey("comparison", metric, key),
  }))
}

export function stackRadiusFor(
  point: MonthlyPoint | undefined,
  metric: StackedMetric,
  categoryKey: string,
  categories: StackedCategory[]
): number | undefined {
  if (!point) return undefined

  const amounts = categoryAmountsFor(point, metric)
  if ((amounts[categoryKey] ?? 0) <= 0) return undefined

  const index = categories.findIndex((category) => category.key === categoryKey)
  for (const category of categories.slice(index + 1)) {
    if ((amounts[category.key] ?? 0) > 0) return undefined
  }

  return STACK_CELL_RADIUS
}

export function isStackedMetric(metric: Metric): metric is StackedMetric {
  return metric === "revenue" || metric === "expenses"
}

function collectStackedCategoryKeys(
  metric: StackedMetric,
  monthly: MonthlyPoint[],
  categories: CategoryBreakdown[],
  comparison: MonthlyPoint[] | undefined,
  comparisonCategories: CategoryBreakdown[]
) {
  const keys: string[] = []
  const keySet = new Set<string>()
  const labels = new Map<string, string>()
  const addCategory = (
    key: string,
    label: string = fallbackCategoryLabel(key)
  ) => {
    if (!keySet.has(key)) {
      keySet.add(key)
      keys.push(key)
    }
    if (!labels.has(key)) labels.set(key, label)
  }

  for (const category of categories) addCategory(category.key, category.label)
  for (const category of comparisonCategories) {
    addCategory(category.key, category.label)
  }
  for (const point of monthly) {
    for (const key of Object.keys(categoryAmountsFor(point, metric))) {
      addCategory(key)
    }
  }
  for (const point of comparison ?? []) {
    for (const key of Object.keys(categoryAmountsFor(point, metric))) {
      addCategory(key)
    }
  }

  return { keys, labels }
}

function hasCategoryAmount(
  key: string,
  metric: StackedMetric,
  monthly: MonthlyPoint[],
  comparison?: MonthlyPoint[]
): boolean {
  for (const point of monthly) {
    if ((categoryAmountsFor(point, metric)[key] ?? 0) !== 0) return true
  }
  for (const point of comparison ?? []) {
    if ((categoryAmountsFor(point, metric)[key] ?? 0) !== 0) return true
  }
  return false
}

function categoryAmountsFor(
  point: MonthlyPoint,
  metric: StackedMetric
): Record<string, number> {
  return metric === "revenue"
    ? point.revenueByCategory
    : point.expensesByCategory
}

function categoryDataKey(
  source: "primary" | "comparison",
  metric: StackedMetric,
  categoryKey: string
): string {
  return `${source}_${metric}_${categoryKey.replace(/[^a-zA-Z0-9_-]/g, "_")}`
}

function fallbackCategoryLabel(categoryKey: string): string {
  if (categoryKey === UNCATEGORIZED_CATEGORY_KEY) {
    return UNCATEGORIZED_CATEGORY_LABEL
  }
  return categoryKey
}

function stackedCategoryFill(
  metric: StackedMetric,
  index: number,
  total: number,
  colorMode: ChartColorMode
): string {
  if (metric === "expenses") {
    return rankedExpenseBarFill(index, total, colorMode)
  }
  return rankedRevenueBarFill(index, total, colorMode)
}

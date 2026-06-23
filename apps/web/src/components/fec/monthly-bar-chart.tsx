/* oxlint-disable eslint/max-lines */
"use client"

import {
  type ChartColorMode,
  rankedExpenseBarFill,
  rankedRevenueBarFill,
} from "@/components/fec/bar-chart-style"
import { StackedChartLegend } from "@/components/fec/stacked-chart-legend"
import {
  type CategoryBreakdown,
  type MonthlyPoint,
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_CATEGORY_LABEL,
} from "@/lib/fec/analytics"
import { formatEuroCompact } from "@/lib/fec/format"
import {
  type ChartComponents,
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"
import { useTheme } from "next-themes"
import { useMemo } from "react"

function formatEuroAxis(value: number): string {
  return formatEuroCompact(value)
}

type Metric = "revenue" | "expenses" | "result"
type StackedMetric = Exclude<Metric, "result">

interface MonthlyBarChartProps {
  monthly: MonthlyPoint[]
  metric: Metric
  categories?: CategoryBreakdown[]
  // FEC de comparaison aligne par index (mois 1 du primary <-> mois 1 du compare).
  // Choix delibere : on ne tente pas d'aligner par date pour permettre les YoY
  // sur des exercices decales.
  comparison?: MonthlyPoint[]
  comparisonCategories?: CategoryBreakdown[]
  className?: string
}

const METRIC_LABEL: Record<Metric, string> = {
  revenue: "Revenus",
  expenses: "Charges",
  result: "Résultat",
}

const METRIC_COLOR: Record<Metric, string> = {
  revenue: "var(--revenue)",
  expenses: "var(--expense)",
  result: "var(--result)",
}

// Couleur dediee a la barre de comparaison : variante claire (-1) de la
// meme famille que la metrique principale, pour respecter le code couleur
// de chaque page (bleu sur /revenus, orange sur /charges).
// Pas de variante claire pour "result" : on retombe sur la couleur primaire.
const COMPARISON_COLOR: Record<Metric, string> = {
  revenue: "var(--revenue-1)",
  expenses: "var(--expense-1)",
  result: "var(--result)",
}

const COMPARISON_KEY = "comparison"
const PRIMARY_STACK_ID = "primary"
const COMPARISON_STACK_ID = "comparison"
const STACK_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const STACK_CELL_RADIUS = 4
const EMPTY_CATEGORIES: CategoryBreakdown[] = []
const EMPTY_STACKED_CATEGORIES: StackedCategory[] = []
const MONTHLY_TOOLTIP_CONTENT = <MonthlyTooltipContent />

interface StackedCategory {
  key: string
  label: string
  fill: string
  primaryDataKey: string
  comparisonDataKey: string
}

interface TooltipPayloadItem {
  value?: unknown
  name?: unknown
  color?: string
  fill?: string
  dataKey?: unknown
  payload?: {
    monthLabel?: string
  }
}

interface MonthlyTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: unknown
}

interface TooltipRow {
  item: TooltipPayloadItem
  value: number
}

interface StackedMonthlyBarsProps {
  components: Pick<ChartComponents, "Bar" | "Cell" | "ChartLegend">
  monthly: MonthlyPoint[]
  comparison?: MonthlyPoint[]
  metric: StackedMetric
  categories: StackedCategory[]
  hasComparison: boolean
}

interface SingleMonthlyBarsProps {
  components: Pick<ChartComponents, "Bar" | "Cell">
  monthly: MonthlyPoint[]
  metric: Metric
  fillVar: string
  hasComparison: boolean
}

interface BuildStackedCategoriesArgs {
  metric: StackedMetric
  monthly: MonthlyPoint[]
  categories: CategoryBreakdown[]
  comparison?: MonthlyPoint[]
  comparisonCategories: CategoryBreakdown[]
  colorMode: ChartColorMode
}

export function MonthlyBarChart({
  monthly,
  metric,
  categories = EMPTY_CATEGORIES,
  comparison,
  comparisonCategories = EMPTY_CATEGORIES,
  className,
}: MonthlyBarChartProps) {
  const { resolvedTheme } = useTheme()
  const colorMode: ChartColorMode = resolvedTheme === "dark" ? "dark" : "light"
  const fillVar = `var(--color-${metric})`
  const hasComparison = Boolean(comparison && comparison.length > 0)
  const stackedMetric = isStackedMetric(metric) ? metric : null
  const stackedCategories = useMemo(
    () =>
      stackedMetric
        ? buildStackedCategories({
            metric: stackedMetric,
            monthly,
            categories,
            comparison,
            comparisonCategories,
            colorMode,
          })
        : EMPTY_STACKED_CATEGORIES,
    [
      categories,
      colorMode,
      comparison,
      comparisonCategories,
      monthly,
      stackedMetric,
    ]
  )
  const isStacked = stackedMetric !== null && stackedCategories.length > 0

  // On enregistre toujours `comparison` dans le ChartConfig pour conserver
  // un ordre stable des elements du chart : sinon recharts re-enregistre la
  // barre a la fin de sa liste interne lors d'un toggle, ce qui inverse
  // l'ordre visuel (vu sur recharts 3.8.0).
  const config = useMemo(
    () => buildChartConfig(metric, stackedCategories),
    [metric, stackedCategories]
  )

  const data = useMemo(
    () =>
      monthly.map((m, i) => ({
        ...m,
        [COMPARISON_KEY]: comparison?.[i]?.[metric] ?? null,
        ...buildStackedDatum(
          m,
          stackedMetric,
          stackedCategories,
          comparison?.[i]
        ),
      })),
    [comparison, metric, monthly, stackedCategories, stackedMetric]
  )

  return (
    <ChartContainer config={config} className={className}>
      {(components) => {
        const { BarChart, ChartTooltip } = components

        return (
          <BarChart data={data}>
            <ChartAxes components={components} />
            <ChartTooltip content={MONTHLY_TOOLTIP_CONTENT} />
            {isStacked && stackedMetric ? (
              <StackedMonthlyBars
                components={components}
                monthly={monthly}
                comparison={comparison}
                metric={stackedMetric}
                categories={stackedCategories}
                hasComparison={hasComparison}
              />
            ) : (
              <SingleMonthlyBars
                components={components}
                monthly={monthly}
                metric={metric}
                fillVar={fillVar}
                hasComparison={hasComparison}
              />
            )}
          </BarChart>
        )
      }}
    </ChartContainer>
  )
}

function ChartAxes({
  components,
}: {
  components: Pick<ChartComponents, "CartesianGrid" | "XAxis" | "YAxis">
}) {
  const { CartesianGrid, XAxis, YAxis } = components

  return (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis
        dataKey="monthLabel"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={20}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={formatEuroAxis}
        width={60}
      />
    </>
  )
}

function StackedMonthlyBars({
  components,
  monthly,
  comparison,
  metric,
  categories,
  hasComparison,
}: StackedMonthlyBarsProps) {
  const legendContent = useMemo(
    () => (
      <StackedChartLegend
        items={categories}
        className="flex-wrap gap-x-3 gap-y-1 text-muted-foreground"
      />
    ),
    [categories]
  )
  const { Bar, Cell, ChartLegend } = components

  return (
    <>
      {categories.map((category) => (
        <Bar
          key={category.comparisonDataKey}
          dataKey={category.comparisonDataKey}
          name={`${category.label} (comparé)`}
          stackId={COMPARISON_STACK_ID}
          fill={category.fill}
          fillOpacity={0.42}
          hide={!hasComparison}
          legendType="none"
        >
          {monthly.map((m, i) => (
            <Cell
              key={`${category.comparisonDataKey}-${m.month}`}
              radius={stackRadiusFor(
                comparison?.[i],
                metric,
                category.key,
                categories
              )}
            />
          ))}
        </Bar>
      ))}
      {categories.map((category) => (
        <Bar
          key={category.primaryDataKey}
          dataKey={category.primaryDataKey}
          name={category.label}
          stackId={PRIMARY_STACK_ID}
          fill={category.fill}
        >
          {monthly.map((m) => (
            <Cell
              key={`${category.primaryDataKey}-${m.month}`}
              radius={stackRadiusFor(m, metric, category.key, categories)}
            />
          ))}
        </Bar>
      ))}
      <ChartLegend content={legendContent} />
    </>
  )
}

function SingleMonthlyBars({
  components,
  monthly,
  metric,
  fillVar,
  hasComparison,
}: SingleMonthlyBarsProps) {
  const { Bar, Cell } = components

  return (
    <>
      {/* On rend la barre comparison meme quand inactive et on la masque
          via `hide` : recharts filtre les bars cachees du calcul de layout
          (selectAllVisibleBars dans barSelectors.js) tout en preservant
          leur ordre d'enregistrement. Avec un demontage conditionnel, le
          re-mount enregistre la barre a la fin et la fait basculer a
          droite au lieu de rester a gauche. */}
      <Bar
        dataKey={COMPARISON_KEY}
        name="FEC comparé"
        fill="var(--color-comparison)"
        radius={STACK_RADIUS}
        hide={!hasComparison}
      />
      <Bar dataKey={metric} name={METRIC_LABEL[metric]} radius={STACK_RADIUS}>
        {monthly.map((m) => {
          const value = m[metric]
          return (
            <Cell
              key={m.month}
              fill={
                metric === "result" && value < 0
                  ? "var(--result-loss)"
                  : fillVar
              }
            />
          )
        })}
      </Bar>
    </>
  )
}

function buildChartConfig(
  metric: Metric,
  stackedCategories: StackedCategory[]
): ChartConfig {
  if (stackedCategories.length === 0)
    return {
      [metric]: { label: METRIC_LABEL[metric], color: METRIC_COLOR[metric] },
      [COMPARISON_KEY]: {
        label: "FEC comparé",
        color: COMPARISON_COLOR[metric],
      },
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

function buildStackedDatum(
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

function buildStackedCategories({
  metric,
  monthly,
  categories,
  comparison,
  comparisonCategories,
  colorMode,
}: BuildStackedCategoriesArgs): StackedCategory[] {
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
  for (const category of comparisonCategories)
    addCategory(category.key, category.label)

  for (const point of monthly)
    for (const key of Object.keys(categoryAmountsFor(point, metric)))
      addCategory(key)

  for (const point of comparison ?? [])
    for (const key of Object.keys(categoryAmountsFor(point, metric)))
      addCategory(key)

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

function hasCategoryAmount(
  key: string,
  metric: StackedMetric,
  monthly: MonthlyPoint[],
  comparison?: MonthlyPoint[]
): boolean {
  for (const point of monthly)
    if ((categoryAmountsFor(point, metric)[key] ?? 0) !== 0) return true
  for (const point of comparison ?? [])
    if ((categoryAmountsFor(point, metric)[key] ?? 0) !== 0) return true
  return false
}

function stackRadiusFor(
  point: MonthlyPoint | undefined,
  metric: StackedMetric,
  categoryKey: string,
  categories: StackedCategory[]
): number | undefined {
  if (!point) return undefined

  const amounts = categoryAmountsFor(point, metric)
  if ((amounts[categoryKey] ?? 0) <= 0) return undefined

  const index = categories.findIndex((category) => category.key === categoryKey)
  for (const category of categories.slice(index + 1))
    if ((amounts[category.key] ?? 0) > 0) return undefined

  return STACK_CELL_RADIUS
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
  if (categoryKey === UNCATEGORIZED_CATEGORY_KEY)
    return UNCATEGORIZED_CATEGORY_LABEL
  return categoryKey
}

function stackedCategoryFill(
  metric: StackedMetric,
  index: number,
  total: number,
  colorMode: ChartColorMode
): string {
  if (metric === "expenses")
    return rankedExpenseBarFill(index, total, colorMode)
  return rankedRevenueBarFill(index, total, colorMode)
}

function isStackedMetric(metric: Metric): metric is StackedMetric {
  return metric === "revenue" || metric === "expenses"
}

function MonthlyTooltipContent({
  active,
  payload,
  label,
}: MonthlyTooltipContentProps) {
  if (!active || !payload?.length) return null

  const rows = buildTooltipRows(payload)
  if (rows.length === 0) return null

  const labelText = tooltipLabelText(label, rows)

  return (
    <div className="grid min-w-40 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {labelText ? <div className="font-medium">{labelText}</div> : null}
      <div className="grid gap-1.5">
        {rows.map(({ item, value }) => (
          <TooltipLine
            key={tooltipItemKey(item, value)}
            item={item}
            value={value}
          />
        ))}
      </div>
    </div>
  )
}

function buildTooltipRows(payload: TooltipPayloadItem[]): TooltipRow[] {
  const rows: TooltipRow[] = []
  for (const item of payload) {
    const value = tooltipNumericValue(item.value)
    if (value !== null) rows.push({ item, value })
  }

  if (rows.length > 0 || payload.length !== 1) return rows

  const value = tooltipNumericValue(payload[0].value, true)
  if (value !== null) rows.push({ item: payload[0], value })
  return rows
}

function tooltipLabelText(
  label: unknown,
  rows: TooltipRow[]
): string | undefined {
  return typeof label === "string" ? label : rows[0]?.item.payload?.monthLabel
}

function TooltipLine({ item, value }: TooltipRow) {
  const markerStyle = useMemo(
    () => ({ background: tooltipItemColor(item) }),
    [item]
  )

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <span className="size-2 shrink-0 rounded-[2px]" style={markerStyle} />
        <span className="truncate">{tooltipItemName(item)}</span>
      </span>
      <span className="font-mono font-medium tabular-nums">
        {formatEuroCompact(value)}
      </span>
    </div>
  )
}

function tooltipItemKey(item: TooltipPayloadItem, value: number) {
  const key = item.dataKey ?? item.name
  if (typeof key === "string" || typeof key === "number") return String(key)
  return String(value)
}

function tooltipItemName(item: TooltipPayloadItem) {
  if (typeof item.name === "string" || typeof item.name === "number")
    return String(item.name)
  return ""
}

function tooltipNumericValue(
  value: unknown,
  keepZero: boolean = false
): number | null {
  if (value === null || value === undefined) return null
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  if (!Number.isFinite(numeric)) return null
  if (!keepZero && numeric === 0) return null
  return numeric
}

function tooltipItemColor(item: TooltipPayloadItem): string {
  return item.color ?? item.fill ?? "var(--muted-foreground)"
}

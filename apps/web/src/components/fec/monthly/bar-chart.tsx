"use client"

import { type ChartColorMode } from "@/components/fec/charting/bar-style"
import { StackedChartLegend } from "@/components/fec/charting/stacked-legend"
import type { CategoryBreakdown, MonthlyPoint } from "@/lib/fec/analytics"
import { formatEuroCompact } from "@/lib/fec/format"
import {
  type ChartComponents,
  ChartContainer,
} from "@workspace/ui/components/chart"
import { useTheme } from "next-themes"
import { useMemo } from "react"

import {
  buildChartConfig,
  buildStackedCategories,
  buildStackedDatum,
  COMPARISON_KEY,
  isStackedMetric,
  METRIC_LABEL,
  type Metric,
  stackRadiusFor,
  type StackedCategory,
  type StackedMetric,
} from "./bar-chart-data"
import { MonthlyTooltipContent } from "./bar-chart-tooltip"

interface MonthlyBarChartProps {
  monthly: MonthlyPoint[]
  metric: Metric
  categories?: CategoryBreakdown[]
  // Periode de comparaison alignee par index (mois 1 primary <-> mois 1 compare).
  // Choix delibere : on ne tente pas d'aligner par date pour permettre les YoY
  // sur des exercices decales.
  comparison?: MonthlyPoint[]
  comparisonCategories?: CategoryBreakdown[]
  className?: string
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

const PRIMARY_STACK_ID = "primary"
const COMPARISON_STACK_ID = "comparison"
const STACK_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const EMPTY_CATEGORIES: CategoryBreakdown[] = []
const EMPTY_STACKED_CATEGORIES: StackedCategory[] = []
const MONTHLY_TOOLTIP_CONTENT = <MonthlyTooltipContent />

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
        tickFormatter={formatEuroCompact}
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
      <Bar
        dataKey={COMPARISON_KEY}
        name="Période comparée"
        fill="var(--color-comparison)"
        radius={STACK_RADIUS}
        hide={!hasComparison}
      />
      <Bar dataKey={metric} name={METRIC_LABEL[metric]} radius={STACK_RADIUS}>
        {monthly.map((m) => (
          <Cell
            key={m.month}
            fill={cellFillForMetric(metric, m[metric], fillVar)}
          />
        ))}
      </Bar>
    </>
  )
}

function cellFillForMetric(metric: Metric, value: number, fillVar: string) {
  return metric === "result" && value < 0 ? "var(--result-loss)" : fillVar
}

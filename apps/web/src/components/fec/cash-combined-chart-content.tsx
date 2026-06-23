"use client"

import {
  formatEuroAxis,
  tooltipFormatter,
} from "@/components/fec/cash-chart-helpers"
import type { MonthlyPoint } from "@/lib/fec/analytics"
import {
  type ChartComponents,
  ChartLegendContent,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"

const CHART_CURSOR = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
}

const ACTIVE_DOT_SMALL = { r: 3 }
const ACTIVE_DOT = { r: 4 }
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const COMPARISON_NEGATIVE_FILL =
  "color-mix(in srgb, var(--destructive) 75%, var(--background))"
const TOOLTIP_CONTENT = <ChartTooltipContent formatter={tooltipFormatter} />
const LEGEND_CONTENT = <ChartLegendContent />

export type CombinedDatum = Omit<MonthlyPoint, "cashBalance" | "cashFlow"> & {
  cashBalance: number | null
  cashFlow: number | null
  cashBalanceComparison: number | null
  cashFlowComparison: number | null
  cashBalanceForecast: number | null
  cashFlowForecast: number | null
}

function flowCells(
  Cell: ChartComponents["Cell"],
  values: Array<{ key: string; value: number }>,
  positiveFill: string,
  negativeFill: string
) {
  return values.map(({ key, value }) => (
    <Cell key={key} fill={value >= 0 ? positiveFill : negativeFill} />
  ))
}

function CombinedBalanceGradients() {
  return (
    <>
      <linearGradient
        id="cashBalanceCombinedGradient"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="var(--color-cashBalance)"
          stopOpacity={0.5}
        />
        <stop
          offset="100%"
          stopColor="var(--color-cashBalance)"
          stopOpacity={0.05}
        />
      </linearGradient>
      <linearGradient
        id="cashBalanceComparisonGradient"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="var(--color-cashBalanceComparison)"
          stopOpacity={0.2}
        />
        <stop
          offset="100%"
          stopColor="var(--color-cashBalanceComparison)"
          stopOpacity={0.02}
        />
      </linearGradient>
      <linearGradient
        id="cashBalanceForecastCombinedGradient"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop
          offset="0%"
          stopColor="var(--color-cashBalance)"
          stopOpacity={0.18}
        />
        <stop
          offset="100%"
          stopColor="var(--color-cashBalance)"
          stopOpacity={0.02}
        />
      </linearGradient>
    </>
  )
}

// Series de comparaison : conditional mount (pas always-mount + hide). Cacher
// une serie ne libere pas son slot dans le groupe de bars sur le meme xAxisId
// — du coup le bar primaire se decale a gauche du tick. Mounter conditionnellement
// resout le decalage. Trade-off : layout shift au toggle sur /tresorerie.
function CombinedComparisonSeries({
  components,
  comparisonFlow,
}: {
  components: Pick<ChartComponents, "Area" | "Bar" | "Cell">
  comparisonFlow: Array<{ key: string; value: number }>
}) {
  const { Area, Bar, Cell } = components

  return (
    <>
      <Area
        yAxisId="balance"
        type="monotone"
        dataKey="cashBalanceComparison"
        stroke="var(--color-cashBalanceComparison)"
        fill="url(#cashBalanceComparisonGradient)"
        strokeWidth={2}
        strokeDasharray="4 4"
        dot={false}
        activeDot={ACTIVE_DOT_SMALL}
        connectNulls
      />
      <Bar
        yAxisId="flow"
        dataKey="cashFlowComparison"
        radius={BAR_RADIUS}
        maxBarSize={28}
        fill="var(--chart-1)"
        fillOpacity={0.55}
      >
        {flowCells(
          Cell,
          comparisonFlow,
          "var(--chart-1)",
          COMPARISON_NEGATIVE_FILL
        )}
      </Bar>
    </>
  )
}

// Patterns SVG hachures pour la barre forecast : signal visuel "estimation /
// non confirme" reconnaissable.
function CombinedForecastBarPatterns() {
  return (
    <>
      <pattern
        id="cashFlowForecastPositivePattern"
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
      >
        <rect width="6" height="6" fill="var(--chart-2)" fillOpacity={0.18} />
        <line
          x1="0"
          y1="6"
          x2="6"
          y2="0"
          stroke="var(--chart-2)"
          strokeWidth={1.5}
        />
      </pattern>
      <pattern
        id="cashFlowForecastNegativePattern"
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
      >
        <rect
          width="6"
          height="6"
          fill="var(--destructive)"
          fillOpacity={0.18}
        />
        <line
          x1="0"
          y1="6"
          x2="6"
          y2="0"
          stroke="var(--destructive)"
          strokeWidth={1.5}
        />
      </pattern>
    </>
  )
}

// Series prevision : aire pointillee + bar a hachures diagonales (pattern fill).
// Le bar utilise un xAxisId="forecast" dedie : sans ca il serait groupe avec
// cashFlow Bar sur le meme xAxis, decalant le bar primaire a chaque tick.
function CombinedForecastSeries({
  components,
  forecastFlow,
}: {
  components: Pick<ChartComponents, "Area" | "Bar" | "Cell">
  forecastFlow: Array<{ key: string; value: number }>
}) {
  const { Area, Bar, Cell } = components

  return (
    <>
      <Area
        yAxisId="balance"
        type="monotone"
        dataKey="cashBalanceForecast"
        stroke="var(--color-cashBalance)"
        fill="url(#cashBalanceForecastCombinedGradient)"
        strokeWidth={2.5}
        strokeDasharray="6 4"
        dot={false}
        activeDot={ACTIVE_DOT}
        connectNulls={false}
      />
      <Bar
        xAxisId="forecast"
        yAxisId="flow"
        dataKey="cashFlowForecast"
        radius={BAR_RADIUS}
        maxBarSize={28}
      >
        {forecastFlow.map(({ key, value }) => (
          <Cell
            key={key}
            fill={
              value >= 0
                ? "url(#cashFlowForecastPositivePattern)"
                : "url(#cashFlowForecastNegativePattern)"
            }
          />
        ))}
      </Bar>
    </>
  )
}

function CashCombinedChartContent({
  components,
  data,
  primaryFlow,
  comparisonFlow,
  forecastFlow,
  hasComparison,
  hasProjection,
}: {
  components: Pick<
    ChartComponents,
    | "Area"
    | "Bar"
    | "CartesianGrid"
    | "Cell"
    | "ChartLegend"
    | "ChartTooltip"
    | "ComposedChart"
    | "XAxis"
    | "YAxis"
  >
  data: CombinedDatum[]
  primaryFlow: Array<{ key: string; value: number }>
  comparisonFlow: Array<{ key: string; value: number }>
  forecastFlow: Array<{ key: string; value: number }>
  hasComparison: boolean
  hasProjection: boolean
}) {
  const {
    Area,
    Bar,
    CartesianGrid,
    Cell,
    ChartLegend,
    ChartTooltip,
    ComposedChart,
    XAxis,
    YAxis,
  } = components

  return (
    <ComposedChart data={data}>
      <defs>
        <CombinedBalanceGradients />
        {hasProjection ? <CombinedForecastBarPatterns /> : null}
      </defs>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis
        dataKey="monthLabel"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={20}
      />
      {hasProjection ? (
        <XAxis dataKey="monthLabel" xAxisId="forecast" hide />
      ) : null}
      <YAxis
        yAxisId="balance"
        orientation="left"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={formatEuroAxis}
        width={60}
      />
      <YAxis
        yAxisId="flow"
        orientation="right"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={formatEuroAxis}
        width={60}
      />
      <ChartTooltip cursor={CHART_CURSOR} content={TOOLTIP_CONTENT} />
      <ChartLegend content={LEGEND_CONTENT} />
      {hasComparison ? (
        <CombinedComparisonSeries
          components={components}
          comparisonFlow={comparisonFlow}
        />
      ) : null}
      <Area
        yAxisId="balance"
        type="monotone"
        dataKey="cashBalance"
        stroke="var(--color-cashBalance)"
        fill="url(#cashBalanceCombinedGradient)"
        strokeWidth={2.5}
        dot={false}
        activeDot={ACTIVE_DOT}
      />
      <Bar
        yAxisId="flow"
        dataKey="cashFlow"
        radius={BAR_RADIUS}
        maxBarSize={28}
        fill="var(--chart-2)"
        fillOpacity={0.65}
      >
        {flowCells(Cell, primaryFlow, "var(--chart-2)", "var(--destructive)")}
      </Bar>
      {hasProjection ? (
        <CombinedForecastSeries
          components={components}
          forecastFlow={forecastFlow}
        />
      ) : null}
    </ComposedChart>
  )
}

export { CashCombinedChartContent }

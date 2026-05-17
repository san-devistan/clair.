"use client"

import type { MonthlyPoint } from "@/lib/fec/analytics"
import { formatEuroCompact, formatEuroExact } from "@/lib/fec/format"
import {
  type ChartConfig,
  Area,
  AreaChart,
  CartesianGrid,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  XAxis,
  YAxis,
} from "@workspace/ui/components/chart"

const config = {
  revenue: { label: "Revenus", color: "var(--revenue)" },
  expenses: { label: "Charges", color: "var(--expense)" },
} satisfies ChartConfig

const CHART_CURSOR = {
  stroke: "var(--border)",
  strokeDasharray: "3 3",
}

interface MonthlyTrendChartProps {
  monthly: MonthlyPoint[]
  className?: string
}

function formatEuroAxis(value: number): string {
  return formatEuroCompact(value)
}

function tooltipFormatter(value: unknown, name: unknown) {
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  const nameText =
    typeof name === "string" || typeof name === "number" ? String(name) : ""
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground capitalize">{nameText}</span>
      <span className="font-mono font-medium">
        {formatEuroExact(Number.isFinite(numeric) ? numeric : 0)}
      </span>
    </div>
  )
}

const TOOLTIP_CONTENT = <ChartTooltipContent formatter={tooltipFormatter} />
const LEGEND_CONTENT = <ChartLegendContent />

export function MonthlyTrendChart({
  monthly,
  className,
}: MonthlyTrendChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <AreaChart data={monthly}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.5}
            />
            <stop
              offset="100%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-expenses)"
              stopOpacity={0.5}
            />
            <stop
              offset="100%"
              stopColor="var(--color-expenses)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
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
        <ChartTooltip cursor={CHART_CURSOR} content={TOOLTIP_CONTENT} />
        <ChartLegend content={LEGEND_CONTENT} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="url(#revenueGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="var(--color-expenses)"
          fill="url(#expensesGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

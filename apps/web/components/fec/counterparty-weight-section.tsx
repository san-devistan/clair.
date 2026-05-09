"use client"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import { rankedBarFill } from "@/components/fec/bar-chart-style"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import type { TopCounterparty } from "@/lib/fec/analytics"
import { formatEuroCompact, formatPercent } from "@/lib/fec/format"

type CounterpartyWeightVariant = "clients" | "fournisseurs"

interface CounterpartyWeightSectionProps {
  items: TopCounterparty[]
  variant: CounterpartyWeightVariant
}

interface CounterpartyWeightRow {
  accountNum: string
  label: string
  shortLabel: string
  amount: number
  share: number
  fill: string
}

interface CounterpartyWeightLabels {
  title: string
  description: string
  emptyLabel: string
}

const CHART_MIN_HEIGHT = 320
const CHART_ROW_HEIGHT = 38

const LABELS: Record<CounterpartyWeightVariant, CounterpartyWeightLabels> = {
  clients: {
    title: "Poids des clients",
    description:
      "Classe vos principaux clients par volume facturé pour visualiser la dépendance commerciale et la concentration du portefeuille.",
    emptyLabel: "Aucun client avec du volume facturé",
  },
  fournisseurs: {
    title: "Poids des fournisseurs",
    description:
      "Classe vos principaux fournisseurs par volume facturé pour visualiser les partenaires qui pèsent le plus dans les achats.",
    emptyLabel: "Aucun fournisseur avec du volume facturé",
  },
}

const CHART_CONFIG = {
  share: {
    label: "Poids",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function CounterpartyWeightSection({
  items,
  variant,
}: CounterpartyWeightSectionProps) {
  const labels = LABELS[variant]
  const total = computeTotalAmount(items)
  const rows = buildCounterpartyRows(items, total, variant)

  return (
    <Card>
      <CardHeader>
        <ExplainedCardTitle description={labels.description}>
          {labels.title}
        </ExplainedCardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {labels.emptyLabel}
          </p>
        ) : (
          <CounterpartyWeightChart rows={rows} />
        )}
      </CardContent>
    </Card>
  )
}

function computeTotalAmount(items: TopCounterparty[]): number {
  return items.reduce((sum, item) => {
    if (item.amount <= 0) return sum
    return sum + item.amount
  }, 0)
}

function buildCounterpartyRows(
  items: TopCounterparty[],
  total: number,
  variant: CounterpartyWeightVariant
): CounterpartyWeightRow[] {
  if (total <= 0) return []

  return items
    .filter((item) => item.amount > 0)
    .map((item, index) => ({
      accountNum: item.accountNum,
      label: item.label,
      shortLabel: truncateLabel(item.label),
      amount: item.amount,
      share: (item.amount / total) * 100,
      fill: counterpartyFill(variant, index),
    }))
}

function truncateLabel(label: string): string {
  if (label.length <= 24) return label
  return `${label.slice(0, 21).trim()}...`
}

function counterpartyFill(
  variant: CounterpartyWeightVariant,
  index: number
): string {
  const base = variant === "clients" ? "var(--revenue-5)" : "var(--expense)"
  return rankedBarFill(base, index)
}

function CounterpartyWeightChart({ rows }: { rows: CounterpartyWeightRow[] }) {
  const chartHeight = Math.max(
    CHART_MIN_HEIGHT,
    rows.length * CHART_ROW_HEIGHT + 64
  )

  return (
    <div>
      <ChartContainer
        config={CHART_CONFIG}
        className="w-full"
        style={{ height: chartHeight }}
        initialDimension={{ width: 640, height: chartHeight }}
      >
        <BarChart
          accessibilityLayer
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => formatPercent(Number(value))}
          />
          <YAxis
            type="category"
            dataKey="shortLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={156}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={chartTooltipFormatter}
              />
            }
          />
          <Bar dataKey="share" radius={[0, 4, 4, 0]}>
            {rows.map((row) => (
              <Cell key={row.accountNum} fill={row.fill} />
            ))}
            <LabelList
              dataKey="share"
              position="right"
              className="fill-foreground font-mono text-[10px]"
              formatter={(value: unknown) => formatPercent(Number(value))}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

function chartTooltipFormatter(value: unknown, _name: unknown, item: unknown) {
  const row = tooltipRow(item)
  const share = Number(value)

  return (
    <div className="flex min-w-60 flex-col gap-1">
      <span className="font-medium">{row?.label ?? "Tiers"}</span>
      {row ? (
        <span className="font-mono text-[10px] text-muted-foreground">
          {row.accountNum}
        </span>
      ) : null}
      <div className="mt-1 flex items-end justify-between gap-4 font-mono font-semibold tabular-nums">
        <span>{row ? formatEuroCompact(row.amount) : "—"}</span>
        <span>{formatPercent(Number.isFinite(share) ? share : 0)}</span>
      </div>
    </div>
  )
}

function tooltipRow(item: unknown): CounterpartyWeightRow | null {
  if (typeof item !== "object" || item === null || !("payload" in item))
    return null

  const payload = (item as { payload?: unknown }).payload
  if (typeof payload !== "object" || payload === null) return null
  if (!("accountNum" in payload) || !("label" in payload)) return null

  return payload as CounterpartyWeightRow
}

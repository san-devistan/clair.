"use client"

import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useTheme } from "next-themes"
import { useMemo } from "react"

import {
  type ChartColorMode,
  rankedExpenseBarFill,
  rankedRevenueBarFill,
} from "@/components/fec/bar-chart-style"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { StackedSegmentBar } from "@/components/fec/stacked-segment-bar"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

type ResultBreakdownVariant = "both" | "revenue" | "expenses"

interface ResultBreakdownProps {
  revenueCategories?: CategoryBreakdown[]
  expenseCategories?: CategoryBreakdown[]
  revenue?: number
  expenses?: number
  netResult?: number
  variant?: ResultBreakdownVariant
  className?: string
}

interface BarSegment {
  key: string
  label: string
  amount: number
  share: number // % of bar width (= max(rev, exp))
  shareOfBucket: number // % of its own bucket
  fill: string
  isResultCap?: boolean
  isLossCap?: boolean
}

function buildRevenueSegments({
  categories,
  revenue,
  expenses,
  baseTotal,
  withLossCap,
  colorMode,
}: {
  categories: CategoryBreakdown[]
  revenue: number
  expenses: number
  baseTotal: number
  withLossCap: boolean
  colorMode: ChartColorMode
}): BarSegment[] {
  if (baseTotal <= 0) return []
  const displayCategories = categories.filter((category) => category.amount > 0)
  const segments: BarSegment[] = displayCategories.map((c, index) => ({
    key: `rev-${c.key}`,
    label: c.label,
    amount: c.amount,
    share: (c.amount / baseTotal) * 100,
    shareOfBucket: c.share,
    fill: resultCategoryFill(
      "revenue",
      index,
      displayCategories.length,
      colorMode
    ),
  }))
  if (withLossCap) {
    // Loss : on ajoute un cap rouge a droite pour egaler la longueur des charges.
    const lossAmount = expenses - revenue
    segments.push({
      key: "rev-loss-cap",
      label: "Perte nette",
      amount: lossAmount,
      share: (lossAmount / baseTotal) * 100,
      shareOfBucket: revenue > 0 ? (lossAmount / revenue) * 100 : 100,
      fill: "var(--result-loss)",
      isLossCap: true,
    })
  }
  return segments
}

function buildExpenseSegments({
  categories,
  expenses,
  netResult,
  baseTotal,
  withResultCap,
  colorMode,
}: {
  categories: CategoryBreakdown[]
  expenses: number
  netResult: number
  baseTotal: number
  withResultCap: boolean
  colorMode: ChartColorMode
}): BarSegment[] {
  if (baseTotal <= 0) return []
  const displayCategories = categories.filter((category) => category.amount > 0)
  const segments: BarSegment[] = displayCategories.map((c, index) => ({
    key: `exp-${c.key}`,
    label: c.label,
    amount: c.amount,
    share: (c.amount / baseTotal) * 100,
    shareOfBucket: c.share,
    fill: resultCategoryFill(
      "expenses",
      index,
      displayCategories.length,
      colorMode
    ),
  }))
  if (withResultCap) {
    // Profit : cap vert a droite, qui represente le resultat net.
    segments.push({
      key: "exp-result-cap",
      label: "Résultat net",
      amount: netResult,
      share: (netResult / baseTotal) * 100,
      shareOfBucket: expenses > 0 ? (netResult / expenses) * 100 : 100,
      fill: "var(--result)",
      isResultCap: true,
    })
  }
  return segments
}

export function ResultBreakdown({
  revenueCategories = [],
  expenseCategories = [],
  revenue = 0,
  expenses = 0,
  netResult = 0,
  variant = "both",
  className,
}: ResultBreakdownProps) {
  const colorMode = useChartColorMode()

  // En mode "both" les deux barres partagent la meme echelle pour etre
  // visuellement comparables. En mode mono-barre, on remplit toute la largeur
  // a partir du total propre du bucket.
  const baseTotal =
    variant === "revenue"
      ? revenue
      : variant === "expenses"
        ? expenses
        : Math.max(revenue, expenses)
  const isProfit = netResult >= 0
  const showRevenue = variant !== "expenses"
  const showExpenses = variant !== "revenue"

  const revenueSegments = useMemo<BarSegment[]>(
    () =>
      showRevenue
        ? buildRevenueSegments({
            categories: revenueCategories,
            revenue,
            expenses,
            baseTotal,
            withLossCap: variant === "both" && !isProfit,
            colorMode,
          })
        : [],
    [
      showRevenue,
      revenueCategories,
      revenue,
      expenses,
      baseTotal,
      isProfit,
      variant,
      colorMode,
    ]
  )

  const expenseSegments = useMemo<BarSegment[]>(
    () =>
      showExpenses
        ? buildExpenseSegments({
            categories: expenseCategories,
            expenses,
            netResult,
            baseTotal,
            withResultCap: variant === "both" && isProfit,
            colorMode,
          })
        : [],
    [
      showExpenses,
      expenseCategories,
      expenses,
      netResult,
      baseTotal,
      isProfit,
      variant,
      colorMode,
    ]
  )

  if (baseTotal <= 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Pas assez de données pour calculer le résultat.
      </p>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {showRevenue ? (
          <BarRow
            label="Revenus"
            total={revenue}
            accent="text-[var(--revenue)]"
            segments={revenueSegments}
          />
        ) : null}
        {showExpenses ? (
          <BarRow
            label="Charges"
            total={expenses}
            accent="text-[var(--expense)]"
            segments={expenseSegments}
          />
        ) : null}
      </div>
    </TooltipProvider>
  )
}

function useChartColorMode(): ChartColorMode {
  const { resolvedTheme } = useTheme()
  if (resolvedTheme === "dark") return "dark"
  return "light"
}

function BarRow({
  label,
  total,
  accent,
  segments,
}: {
  label: string
  total: number
  accent: string
  segments: BarSegment[]
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            accent
          )}
        >
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          <FormattedCurrency value={total} />
        </span>
      </div>
      <StackedSegmentBar
        segments={segments}
        ariaLabel={`Composition des ${label.toLowerCase()}`}
        getForceInlineLabel={isCapSegment}
        getLabelClassName={getSegmentLabelClassName}
        renderTooltip={(segment) => <ResultTooltip segment={segment} />}
      />
    </div>
  )
}

function ResultTooltip({ segment }: { segment: BarSegment }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-semibold">{segment.label}</span>
      <span className="font-mono tabular-nums opacity-80">
        {segment.shareOfBucket.toFixed(1)}% ·{" "}
        <FormattedCurrency value={segment.amount} tooltip={false} />
      </span>
    </div>
  )
}

function isCapSegment(segment: BarSegment): boolean {
  return Boolean(segment.isResultCap || segment.isLossCap)
}

function getSegmentLabelClassName(segment: BarSegment): string {
  if (isCapSegment(segment))
    return "max-w-full truncate text-xs font-bold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"

  return "max-w-full truncate text-xs font-semibold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
}

function resultCategoryFill(
  variant: ResultBreakdownVariant,
  index: number,
  total: number,
  colorMode: ChartColorMode
): string {
  if (variant === "expenses")
    return rankedExpenseBarFill(index, total, colorMode)
  return rankedRevenueBarFill(index, total, colorMode)
}

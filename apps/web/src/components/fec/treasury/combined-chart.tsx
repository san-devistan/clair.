"use client"

import type { MonthlyPoint } from "@/lib/fec/analytics"
import {
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"

import {
  CashCombinedChartContent,
  type CombinedDatum,
} from "./combined-chart-content"

// Icones custom pour les entrees forecast de la legende : la pastille par
// defaut ne sait pas representer une ligne pointillee ni des hachures. On
// les redefinit explicitement pour signaler "estime / projete".
function ForecastBalanceIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none">
      <path
        d="M1 6 H11"
        stroke="var(--color-cashBalanceForecast)"
        strokeWidth="2"
        strokeDasharray="3 2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ForecastFlowIcon() {
  return (
    <svg viewBox="0 0 12 12">
      <rect
        width="12"
        height="12"
        fill="var(--color-cashFlowForecast)"
        fillOpacity="0.2"
        rx="2"
      />
      <path
        d="M0 6 L6 0 M0 12 L12 0 M6 12 L12 6"
        stroke="var(--color-cashFlowForecast)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

const combinedConfig = {
  cashBalance: { label: "Solde", color: "var(--chart-3)" },
  cashFlow: { label: "Flux net", color: "var(--chart-2)" },
  cashBalanceComparison: { label: "Solde comparé", color: "var(--chart-1)" },
  cashFlowComparison: { label: "Flux comparé", color: "var(--chart-1)" },
  cashBalanceForecast: {
    label: "Solde prévisionnel",
    color: "var(--chart-3)",
    icon: ForecastBalanceIcon,
  },
  cashFlowForecast: {
    label: "Flux prévisionnel",
    color: "var(--chart-2)",
    icon: ForecastFlowIcon,
  },
} satisfies ChartConfig

interface CashProjectionCombinedPoint {
  label: string
  balance: number
  flow: number
}

function buildCombinedChartData(
  monthly: MonthlyPoint[],
  comparison: MonthlyPoint[] | undefined,
  projection: CashProjectionCombinedPoint | undefined
) {
  const data: CombinedDatum[] = monthly.map((m, i) => ({
    ...m,
    cashBalanceComparison: comparison?.[i]?.cashBalance ?? null,
    cashFlowComparison: comparison?.[i]?.cashFlow ?? null,
    cashBalanceForecast: null,
    cashFlowForecast: null,
  }))

  if (projection) {
    // Bridge : duplique le dernier solde sur cashBalanceForecast pour que la
    // zone pointillee se raccorde sans trou. Le bar n'a pas besoin de bridge
    // (les barres ne sont pas connectees entre elles).
    const last = data.at(-1)
    if (last) last.cashBalanceForecast = last.cashBalance
    data.push({
      month: "__forecast__",
      monthLabel: projection.label,
      revenue: 0,
      expenses: 0,
      result: 0,
      revenueByCategory: {},
      expensesByCategory: {},
      cashBalance: null,
      cashFlow: null,
      cashBalanceComparison: null,
      cashFlowComparison: null,
      cashBalanceForecast: projection.balance,
      cashFlowForecast: projection.flow,
    })
  }

  const primaryFlow = monthly.map((m) => ({ key: m.month, value: m.cashFlow }))
  const comparisonFlow = monthly.map((m, i) => ({
    key: m.month,
    value: comparison?.[i]?.cashFlow ?? 0,
  }))
  // ALIGNEMENT CRITIQUE : recharts mappe les <Cell> par INDEX a `data`. Ce
  // tableau doit donc avoir exactement la meme longueur que `data` — sinon le
  // Cell pour le point projete tombe sur la mauvaise position et le bar perd
  // sa coloration (fallback noir/transparent).
  const forecastFlow = data.map((d) => ({
    key: d.month,
    value: d.cashFlowForecast ?? 0,
  }))
  return { data, primaryFlow, comparisonFlow, forecastFlow }
}

export function CashCombinedChart({
  monthly,
  comparison,
  projection,
  className,
}: {
  monthly: MonthlyPoint[]
  // Comparaison alignee par index (m1 primary <-> m1 compare), comme MonthlyBarChart.
  comparison?: MonthlyPoint[]
  // Point projete optionnel ajoute apres le dernier mois historique. Aire
  // pointillee + bar a hachures pour signaler "non confirme".
  projection?: CashProjectionCombinedPoint
  className?: string
}) {
  const hasComparison = Boolean(comparison && comparison.length > 0)
  const { data, primaryFlow, comparisonFlow, forecastFlow } =
    buildCombinedChartData(monthly, comparison, projection)

  return (
    <ChartContainer config={combinedConfig} className={className}>
      {(components) => (
        <CashCombinedChartContent
          components={components}
          data={data}
          primaryFlow={primaryFlow}
          comparisonFlow={comparisonFlow}
          forecastFlow={forecastFlow}
          hasComparison={hasComparison}
          hasProjection={Boolean(projection)}
        />
      )}
    </ChartContainer>
  )
}

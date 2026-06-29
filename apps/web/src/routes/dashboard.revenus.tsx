"use client"

import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { KpiCard } from "@/components/fec/cards/kpi"
import { ComparisonToggle } from "@/components/fec/comparison/toggle"
import { DashboardEmptyState } from "@/components/fec/dashboard/empty-state"
import { DashboardPage } from "@/components/fec/dashboard/page"
import { MonthlyBarChart } from "@/components/fec/monthly/bar-chart"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/numbers/formatted"
import { RepartitionSection } from "@/components/fec/repartition/section"
import type { DashboardData } from "@/lib/fec/analytics"
import {
  computeMonthlyAverage,
  computeRecentRevenueGrowth,
  computeTopCounterpartyShare,
} from "@/lib/fec/dashboard-metrics"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { CircleDollarSign, TrendingUp, Users } from "lucide-react"
import { Fragment, createElement, useCallback, useState } from "react"

export const Route = createFileRoute("/dashboard/revenus")({
  component: RevenusPage,
})

const REVENUE_ACTION_CATEGORIES = ["ventes"] as const

function RevenusPage() {
  const { data, comparisonData } = useFecStore()
  const [showComparison, setShowComparison] = useState(true)
  const toggleComparison = useCallback(
    () => setShowComparison((value) => !value),
    []
  )
  if (!data) return <DashboardEmptyState />

  const { kpi, monthly, revenueCategories, revenueDetails, topCustomers } = data

  const top3ClientShare = computeTopCounterpartyShare(topCustomers, kpi.revenue)
  const growth = computeRecentRevenueGrowth(monthly) ?? 0
  const monthlyAvg = computeMonthlyAverage(kpi.revenue, monthly.length)
  const comparison = getRevenueComparison(showComparison, comparisonData)
  const revenueValue = createElement(FormattedCurrency, { value: kpi.revenue })
  const monthlyAverageValue = createElement(FormattedCurrency, {
    value: monthlyAvg,
  })
  const revenueMonthsHint = createElement(
    Fragment,
    null,
    "Sur ",
    createElement(FormattedNumber, { value: monthly.length }),
    " mois"
  )

  return (
    <DashboardPage
      title="Revenus"
      insights={data.insights}
      actionCategories={REVENUE_ACTION_CATEGORIES}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Chiffre d'affaires"
          value={revenueValue}
          icon={CircleDollarSign}
          description="Total des produits de vente comptabilisés sur la période (comptes 7xx). C'est le volume d'activité avant déduction des charges."
          hint={revenueMonthsHint}
        />
        <KpiCard
          label="CA mensuel moyen"
          value={monthlyAverageValue}
          icon={TrendingUp}
          description="Chiffre d'affaires total divisé par le nombre de mois analysés. Utile pour lire un rythme mensuel normalisé."
          hint="Moyenne sur la période"
        />
        <KpiCard
          label="Croissance 3 mois"
          value={`${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`}
          icon={TrendingUp}
          description="Compare le chiffre d'affaires des 3 derniers mois aux 3 mois précédents pour capter la tendance récente."
          tone={growthTone(growth)}
          hint="3 derniers mois vs précédents"
        />
        <KpiCard
          label="Top 3 clients"
          value={formatPercent(top3ClientShare)}
          icon={Users}
          description="Part du chiffre d'affaires concentrée sur vos trois plus gros clients. Plus elle est élevée, plus la dépendance commerciale augmente."
          tone={concentrationTone(top3ClientShare)}
          hint={
            top3ClientShare > 60 ? "Forte concentration" : "Concentration saine"
          }
        />
      </section>

      <RepartitionSection
        title="Répartition des revenus"
        description="Montre la part de chaque catégorie comptable dans votre chiffre d'affaires, avec un mode détail pour voir les comptes et auxiliaires qui composent chaque catégorie."
        categories={revenueCategories}
        details={revenueDetails}
        variant="revenue"
        emptyLabel="Aucun revenu identifié"
      />

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Suit le chiffre d'affaires mois par mois pour détecter les tendances, les saisonnalités et les anomalies.">
            Évolution mensuelle du chiffre d'affaires
          </ExplainedCardTitle>
          {comparisonData ? (
            <CardAction>
              <ComparisonToggle
                active={showComparison}
                onToggle={toggleComparison}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <MonthlyBarChart
            monthly={monthly}
            metric="revenue"
            categories={revenueCategories}
            comparison={comparison?.monthly}
            comparisonCategories={comparison?.revenueCategories}
            className="h-[320px] w-full"
          />
        </CardContent>
      </Card>
    </DashboardPage>
  )
}

function getRevenueComparison(
  showComparison: boolean,
  comparisonData: DashboardData | null
): Pick<DashboardData, "monthly" | "revenueCategories"> | undefined {
  return showComparison && comparisonData ? comparisonData : undefined
}

function growthTone(growth: number) {
  if (growth > 0) return "success"
  if (growth < -5) return "warning"
  return "default"
}

function concentrationTone(share: number) {
  return share > 60 ? "warning" : "default"
}

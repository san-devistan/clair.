"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { CircleDollarSign, TrendingUp, Users } from "lucide-react"
import { useState } from "react"

import { AccountDetailSection } from "@/components/fec/account-detail-section"
import { CategoryTable } from "@/components/fec/category-table"
import { ComparisonToggle } from "@/components/fec/comparison-toggle"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { MonthlyBarChart } from "@/components/fec/monthly-bar-chart"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"

export default function RevenusPage() {
  const { data, comparisonData } = useFecStore()
  const [showComparison, setShowComparison] = useState(true)
  if (!data) return <DashboardEmptyState />

  const { kpi, monthly, revenueCategories, revenueDetails, topCustomers } = data

  // Calcul ratio CA / customer concentration
  const top3ClientShare =
    topCustomers.length >= 3 && kpi.revenue > 0
      ? (topCustomers.slice(0, 3).reduce((s, c) => s + c.amount, 0) /
          kpi.revenue) *
        100
      : 0

  // Croissance derniers 3 mois vs 3 precedents
  const last3 = monthly.slice(-3).reduce((s, m) => s + m.revenue, 0)
  const prev3 = monthly.slice(-6, -3).reduce((s, m) => s + m.revenue, 0)
  const growth = prev3 > 0 ? ((last3 - prev3) / prev3) * 100 : 0
  const monthlyAvg = monthly.length > 0 ? kpi.revenue / monthly.length : 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Revenus
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Chiffre d'affaires"
          value={<FormattedCurrency value={kpi.revenue} />}
          icon={CircleDollarSign}
          description="Total des produits de vente comptabilisés sur la période (comptes 7xx). C'est le volume d'activité avant déduction des charges."
          hint={
            <>
              Sur <FormattedNumber value={monthly.length} /> mois
            </>
          }
        />
        <KpiCard
          label="CA mensuel moyen"
          value={<FormattedCurrency value={monthlyAvg} />}
          icon={TrendingUp}
          description="Chiffre d'affaires total divisé par le nombre de mois analysés. Utile pour lire un rythme mensuel normalisé."
          hint="Moyenne sur la période"
        />
        <KpiCard
          label="Croissance 3 mois"
          value={`${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`}
          icon={TrendingUp}
          description="Compare le chiffre d'affaires des 3 derniers mois aux 3 mois précédents pour capter la tendance récente."
          tone={growth > 0 ? "success" : growth < -5 ? "warning" : "default"}
          hint="3 derniers mois vs précédents"
        />
        <KpiCard
          label="Top 3 clients"
          value={formatPercent(top3ClientShare)}
          icon={Users}
          description="Part du chiffre d'affaires concentrée sur vos trois plus gros clients. Plus elle est élevée, plus la dépendance commerciale augmente."
          tone={top3ClientShare > 60 ? "warning" : "default"}
          hint={
            top3ClientShare > 60 ? "Forte concentration" : "Concentration saine"
          }
        />
      </section>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Montre la part de chaque catégorie comptable dans votre chiffre d'affaires pour comprendre d'où vient l'activité.">
            Composition des revenus
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResultBreakdown
            variant="revenue"
            revenueCategories={revenueCategories}
            revenue={kpi.revenue}
          />
          <CategoryTable items={revenueCategories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Suit le chiffre d'affaires mois par mois pour détecter les tendances, les saisonnalités et les anomalies.">
            Évolution mensuelle du chiffre d'affaires
          </ExplainedCardTitle>
          {comparisonData ? (
            <CardAction>
              <ComparisonToggle
                active={showComparison}
                onToggle={() => setShowComparison((v) => !v)}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <MonthlyBarChart
            monthly={monthly}
            metric="revenue"
            comparison={
              showComparison && comparisonData
                ? comparisonData.monthly
                : undefined
            }
            className="h-[320px] w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Classe les revenus par compte général et compte auxiliaire lorsqu'il existe, pour repérer les sources de chiffre d'affaires et les lignes à vérifier.">
            Détail des revenus
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent>
          <AccountDetailSection
            items={revenueDetails}
            variant="revenue"
            emptyLabel="Aucun revenu identifié"
          />
        </CardContent>
      </Card>
    </div>
  )
}

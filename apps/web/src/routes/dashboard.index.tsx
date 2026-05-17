/* oxlint-disable eslint/max-lines-per-function */
"use client"

import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { BalanceSheetOverviewCard } from "@/components/fec/balance-sheet-section"
import { BreakevenSection } from "@/components/fec/breakeven-section"
import { CashCombinedChart } from "@/components/fec/cash-combined-chart"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard, type KpiCardProps } from "@/components/fec/kpi-card"
import { MonthlyTrendChart } from "@/components/fec/monthly-trend-chart"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
import Link from "@/components/link"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
  ArrowRight,
  CircleDollarSign,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { Fragment, Suspense, createElement } from "react"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverviewPage,
})

const OVERVIEW_ACTION_CATEGORIES = ["marge"] as const
const TREASURY_DETAIL_LINK = <Link href="/dashboard/tresorerie" />
const DASHBOARD_FALLBACK = (
  <div className="flex min-h-[60svh] items-center justify-center text-sm text-muted-foreground">
    Chargement…
  </div>
)

function DashboardOverview() {
  const { data } = useFecStore()

  if (!data) return <DashboardEmptyState />

  const {
    kpi,
    monthly,
    expenseCategories,
    expenseDetails,
    revenueCategories,
    revenueDetails,
    agedReceivables,
    agedPayables,
    cashProjection,
    balanceSheet,
  } = data

  // Calcul du delta CA derniers 3 mois vs 3 precedents
  const last3Revenue = monthly.slice(-3).reduce((s, m) => s + m.revenue, 0)
  const prev3Revenue = monthly.slice(-6, -3).reduce((s, m) => s + m.revenue, 0)
  const revenueGrowth =
    prev3Revenue > 0 ? ((last3Revenue - prev3Revenue) / prev3Revenue) * 100 : 0

  const lastMonth = monthly.at(-1)
  const cashTone =
    kpi.cashBalance < 0
      ? "danger"
      : kpi.cashBalance < kpi.revenue * 0.05
        ? "warning"
        : "default"
  const marginTone =
    kpi.margin < 0 ? "danger" : kpi.margin < 5 ? "warning" : "success"
  const revenueValue = createElement(FormattedCurrency, { value: kpi.revenue })
  const expensesValue = createElement(FormattedCurrency, {
    value: kpi.expenses,
  })
  const netResultValue = createElement(FormattedCurrency, {
    value: kpi.netResult,
  })
  const cashBalanceValue = createElement(FormattedCurrency, {
    value: kpi.cashBalance,
  })
  const grossMarginValue = createElement(FormattedCurrency, {
    value: kpi.grossMargin,
  })
  const ebeValue = createElement(FormattedCurrency, { value: kpi.ebe })
  const receivablesMinusPayablesValue = createElement(FormattedCurrency, {
    value: kpi.customerReceivables - kpi.supplierPayables,
  })
  const receivablesPayablesHint = createElement(
    Fragment,
    null,
    "Clients ",
    createElement(FormattedCurrency, { value: kpi.customerReceivables }),
    " · Fournisseurs ",
    createElement(FormattedCurrency, { value: kpi.supplierPayables })
  )
  const revenueTrend = buildRevenueTrend(revenueGrowth, monthly.length)
  const treasuryProjection = buildTreasuryProjection(cashProjection)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Vue d'ensemble
        </h1>
        <ActionSummaryLink
          insights={data.insights}
          categories={OVERVIEW_ACTION_CATEGORIES}
        />
      </header>

      {/* === KPI principaux === */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={revenueValue}
            icon={CircleDollarSign}
            description="Total des produits de vente comptabilisés sur la période (comptes 7xx). C'est le volume d'activité avant déduction des charges."
            trend={revenueTrend}
            hint="3 derniers mois vs précédents"
          />
          <KpiCard
            label="Charges totales"
            value={expensesValue}
            icon={ReceiptText}
            description="Total des dépenses comptabilisées sur la période (comptes 6xx). À comparer au chiffre d'affaires pour surveiller le poids des coûts."
            hint={`${(kpi.revenue > 0 ? (kpi.expenses / kpi.revenue) * 100 : 0).toFixed(0)}% du CA`}
          />
          <KpiCard
            label="Résultat net"
            value={netResultValue}
            icon={TrendingUp}
            description="Chiffre d'affaires moins charges comptabilisées. Positif, l'activité dégage un bénéfice ; négatif, elle consomme de la marge."
            tone={marginTone}
            hint={`Marge ${formatPercent(kpi.margin)}`}
          />
          <KpiCard
            label="Trésorerie"
            value={cashBalanceValue}
            icon={Wallet}
            description="Solde cumulé des comptes de banque et de caisse à la fin de la période analysée."
            tone={cashTone}
            hint={lastMonth ? `Solde fin ${lastMonth.monthLabel}` : undefined}
          />
        </div>

        {/* KPI secondaires en 3 colonnes */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <KpiCard
            label="Marge brute"
            value={grossMarginValue}
            description="Chiffre d'affaires moins achats consommés. Elle indique ce qui reste avant charges externes, salaires et impôts."
            hint={`${formatPercent(kpi.grossMarginRate)} du CA`}
            icon={PiggyBank}
          />
          <KpiCard
            label="Excédent brut d'exploitation"
            value={ebeValue}
            description="Approximation de l'exploitation courante : CA - achats - charges externes - personnel - impôts, hors amortissements et charges financières."
            hint="CA - achats - charges externes - personnel - impôts"
          />
          <KpiCard
            label="Créances vs dettes"
            value={receivablesMinusPayablesValue}
            description="Créances clients moins dettes fournisseurs. Positif, les clients vous doivent plus que ce que vous devez aux fournisseurs."
            hint={receivablesPayablesHint}
          />
        </div>
      </section>

      <section>
        <BalanceSheetOverviewCard balanceSheet={balanceSheet} />
      </section>

      {/* === Composition du résultat === */}
      <section>
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Comparez d'où vient l'argent et où il part. Ouvrez une catégorie pour voir les comptes et auxiliaires qui la composent.">
              Composition du résultat
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <ResultBreakdown
              revenueCategories={revenueCategories}
              revenueDetails={revenueDetails}
              expenseCategories={expenseCategories}
              expenseDetails={expenseDetails}
            />
          </CardContent>
        </Card>
      </section>

      {/* === Tendance mensuelle === */}
      <section>
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Compare mois par mois les revenus et les charges pour repérer si la croissance est rentable ou absorbée par les coûts.">
              Revenus vs charges
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart monthly={monthly} className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </section>

      {/* === Seuil de rentabilité === */}
      <section>
        <BreakevenSection kpi={kpi} />
      </section>

      {/* === Balance âgée clients & fournisseurs === */}
      <section className="grid gap-4 lg:grid-cols-2">
        <AgedBalanceCard type="clients" data={agedReceivables} compact />
        <AgedBalanceCard type="fournisseurs" data={agedPayables} compact />
      </section>

      {/* === Évolution de la trésorerie (historique + projeté) === */}
      <TreasuryOverviewSection
        monthly={monthly}
        projection={treasuryProjection}
      />
    </div>
  )
}

function buildRevenueTrend(
  revenueGrowth: number,
  monthCount: number
): KpiCardProps["trend"] {
  if (monthCount < 6) return undefined
  const direction: NonNullable<KpiCardProps["trend"]>["direction"] =
    revenueGrowth > 0 ? "up" : revenueGrowth < 0 ? "down" : "neutral"
  const tone: NonNullable<KpiCardProps["trend"]>["tone"] =
    revenueGrowth > 0 ? "positive" : revenueGrowth < -3 ? "negative" : "neutral"

  return {
    direction,
    text: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
    tone,
  }
}

function buildTreasuryProjection(
  cashProjection: NonNullable<
    ReturnType<typeof useFecStore>["data"]
  >["cashProjection"]
) {
  return {
    label: "Prévis.",
    balance: cashProjection.projectedCash,
    flow: cashProjection.totalInflows - cashProjection.totalOutflows,
  }
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={DASHBOARD_FALLBACK}>
      <DashboardOverview />
    </Suspense>
  )
}

function TreasuryOverviewSection({
  monthly,
  projection,
}: {
  monthly: NonNullable<ReturnType<typeof useFecStore>["data"]>["monthly"]
  projection: ReturnType<typeof buildTreasuryProjection>
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <ExplainedCardTitle description="L'aire montre le solde cumulé fin de mois, les barres montrent le flux net mensuel, et le point pointillé projette le solde après engagements échus.">
              Évolution de la trésorerie
            </ExplainedCardTitle>
            <Button variant="ghost" size="sm" render={TREASURY_DETAIL_LINK}>
              Détail
              <ArrowRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CashCombinedChart
            monthly={monthly}
            projection={projection}
            className="h-[360px] w-full"
          />
        </CardContent>
      </Card>
    </section>
  )
}

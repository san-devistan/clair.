"use client"

import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { BalanceSheetOverviewCard } from "@/components/fec/balance-sheet-section"
import { BreakevenSection } from "@/components/fec/breakeven-section"
import { CashCombinedChart } from "@/components/fec/cash-combined-chart"
import {
  DASHBOARD_PAGE_FALLBACK,
  DashboardPage,
} from "@/components/fec/dashboard-page"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard, type KpiCardProps } from "@/components/fec/kpi-card"
import { MonthlyTrendChart } from "@/components/fec/monthly-trend-chart"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
import Link from "@/components/link"
import type { DashboardData } from "@/lib/fec/analytics"
import {
  buildTreasuryProjectionPoint,
  computeRecentRevenueGrowth,
  getCashRiskTone,
  getMarginTone,
  type TreasuryProjectionPoint,
} from "@/lib/fec/dashboard-metrics"
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

  const treasuryProjection = buildTreasuryProjectionPoint(cashProjection)

  return (
    <DashboardPage
      title="Vue d'ensemble"
      insights={data.insights}
      actionCategories={OVERVIEW_ACTION_CATEGORIES}
      className="space-y-8"
    >
      <OverviewKpiSection kpi={kpi} monthly={monthly} />

      <section>
        <BalanceSheetOverviewCard balanceSheet={balanceSheet} />
      </section>

      <ResultCompositionSection
        revenueCategories={revenueCategories}
        revenueDetails={revenueDetails}
        expenseCategories={expenseCategories}
        expenseDetails={expenseDetails}
      />

      <MonthlyTrendSection monthly={monthly} />

      <section>
        <BreakevenSection kpi={kpi} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AgedBalanceCard type="clients" data={agedReceivables} compact />
        <AgedBalanceCard type="fournisseurs" data={agedPayables} compact />
      </section>

      <TreasuryOverviewSection
        monthly={monthly}
        projection={treasuryProjection}
      />
    </DashboardPage>
  )
}

function OverviewKpiSection({
  kpi,
  monthly,
}: Pick<DashboardData, "kpi" | "monthly">) {
  return (
    <section>
      <PrimaryOverviewKpis kpi={kpi} monthly={monthly} />
      <SecondaryOverviewKpis kpi={kpi} />
    </section>
  )
}

function PrimaryOverviewKpis({
  kpi,
  monthly,
}: Pick<DashboardData, "kpi" | "monthly">) {
  const lastMonth = monthly.at(-1)
  const cashTone = getCashRiskTone(kpi.cashBalance, kpi.revenue) ?? "default"
  const marginTone = getMarginTone(kpi.margin)
  const revenueTrend = buildRevenueTrend(computeRecentRevenueGrowth(monthly))
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

  return (
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
  )
}

function SecondaryOverviewKpis({ kpi }: Pick<DashboardData, "kpi">) {
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

  return (
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
  )
}

function ResultCompositionSection({
  revenueCategories,
  revenueDetails,
  expenseCategories,
  expenseDetails,
}: Pick<
  DashboardData,
  | "revenueCategories"
  | "revenueDetails"
  | "expenseCategories"
  | "expenseDetails"
>) {
  return (
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
  )
}

function MonthlyTrendSection({ monthly }: Pick<DashboardData, "monthly">) {
  return (
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
  )
}

function buildRevenueTrend(
  revenueGrowth: number | null
): KpiCardProps["trend"] {
  if (revenueGrowth === null) return undefined

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

function DashboardOverviewPage() {
  return (
    <Suspense fallback={DASHBOARD_PAGE_FALLBACK}>
      <DashboardOverview />
    </Suspense>
  )
}

function TreasuryOverviewSection({
  monthly,
  projection,
}: {
  monthly: DashboardData["monthly"]
  projection: TreasuryProjectionPoint
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

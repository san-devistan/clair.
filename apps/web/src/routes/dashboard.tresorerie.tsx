/* oxlint-disable eslint/complexity, eslint/max-lines-per-function */
"use client"

import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import { CashCombinedChart } from "@/components/fec/cash-combined-chart"
import { CashProjectionCard } from "@/components/fec/cash-projection-card"
import { ComparisonToggle } from "@/components/fec/comparison-toggle"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { TopList } from "@/components/fec/top-list"
import type { DashboardData } from "@/lib/fec/analytics"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  Banknote,
  Landmark,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"

export const Route = createFileRoute("/dashboard/tresorerie")({
  component: TresoreriePage,
})

const TREASURY_ACTION_CATEGORIES = ["tresorerie"] as const

export default function TresoreriePage() {
  const { data, comparisonData } = useFecStore()
  if (!data) return <DashboardEmptyState />

  return <TresorerieContent data={data} comparisonData={comparisonData} />
}

function TresorerieContent({
  data,
  comparisonData,
}: {
  data: DashboardData
  comparisonData: DashboardData | null
}) {
  const [showComparison, setShowComparison] = useState(true)

  const { kpi, monthly, cashByAccount, cashProjection } = data

  // DSO / DPO approximatifs : creances / CA * 365
  const monthsCovered = data.period.monthsCovered
  const annualizedRevenue =
    monthsCovered > 0 ? (kpi.revenue / monthsCovered) * 12 : kpi.revenue
  const annualizedExpenses =
    monthsCovered > 0 ? (kpi.expenses / monthsCovered) * 12 : kpi.expenses
  const dso =
    annualizedRevenue > 0
      ? (kpi.customerReceivables / annualizedRevenue) * 365
      : 0
  const dpo =
    annualizedExpenses > 0
      ? (kpi.supplierPayables / annualizedExpenses) * 365
      : 0

  // Projection : ce qui va sortir/rentrer + ou aterrit la treso
  const netEngagement =
    cashProjection.totalInflows - cashProjection.totalOutflows
  const isImproving = netEngagement >= 0
  const projectedTone =
    cashProjection.projectedCash < 0
      ? "danger"
      : cashProjection.projectedCash < kpi.revenue * 0.05
        ? "warning"
        : "success"
  const cashBalanceValue = useMemo(
    () => <FormattedCurrency value={kpi.cashBalance} />,
    [kpi.cashBalance]
  )
  const projectedCashValue = useMemo(
    () => <FormattedCurrency value={cashProjection.projectedCash} />,
    [cashProjection.projectedCash]
  )
  const netEngagementValue = useMemo(
    () => (
      <span
        className={
          isImproving
            ? "text-emerald-600 dark:text-emerald-500"
            : "text-destructive"
        }
      >
        {netEngagement > 0 ? "+" : ""}
        <FormattedCurrency value={netEngagement} />
      </span>
    ),
    [isImproving, netEngagement]
  )
  const projection = useMemo(
    () => ({
      label: "Prévis.",
      balance: cashProjection.projectedCash,
      flow: netEngagement,
    }),
    [cashProjection.projectedCash, netEngagement]
  )
  const toggleComparison = useCallback(
    () => setShowComparison((value) => !value),
    []
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Trésorerie
        </h1>
        <ActionSummaryLink
          insights={data.insights}
          categories={TREASURY_ACTION_CATEGORIES}
        />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Solde actuel"
          value={cashBalanceValue}
          icon={Banknote}
          description="Solde cumulé des comptes de banque et de caisse à la fin de la période importée."
          tone={
            kpi.cashBalance < 0
              ? "danger"
              : kpi.cashBalance < kpi.revenue * 0.05
                ? "warning"
                : "success"
          }
          hint="Cumul fin de période"
        />
        <KpiCard
          label="Solde prévisionnel"
          value={projectedCashValue}
          icon={Wallet}
          description="Solde actuel après encaissement des créances échues et paiement des dettes échues identifiées dans le FEC."
          tone={projectedTone}
          hint="Après règlement des engagements échus"
        />
        <KpiCard
          label="Net engagé"
          value={netEngagementValue}
          icon={isImproving ? TrendingUp : TrendingDown}
          description="Encaissements clients échus moins paiements fournisseurs échus. Montre l'effet court terme des engagements déjà dus sur la trésorerie."
          hint="Encaissements échus − décaissements échus"
        />
      </section>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="L'aire montre le solde cumulé fin de mois et les barres montrent le flux net mensuel. La projection ajoute l'effet des engagements échus.">
            Évolution de la trésorerie
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
        <CardContent className="flex flex-col gap-4">
          <CashCombinedChart
            monthly={monthly}
            comparison={
              showComparison && comparisonData
                ? comparisonData.monthly
                : undefined
            }
            projection={projection}
            className="h-[360px] w-full"
          />
          <Separator />
          <CashProjectionCard data={cashProjection} />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Compare le délai moyen d'encaissement client (DSO) et le délai moyen de paiement fournisseur (DPO) pour lire la pression sur la trésorerie.">
              Délais de paiement
            </ExplainedCardTitle>
          </CardHeader>
          <PaymentDelayContent dso={dso} dpo={dpo} />
        </Card>

        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Liste les soldes par compte de banque et de caisse pour voir où se trouve la trésorerie disponible.">
              Comptes bancaires
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            {cashByAccount.length > 0 ? (
              <TopList
                items={cashByAccount}
                emptyLabel="Aucun compte de trésorerie identifié"
              />
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Landmark className="mr-2 size-4" />
                Aucun compte de trésorerie identifié
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function PaymentDelayContent({ dso, dpo }: { dso: number; dpo: number }) {
  return (
    <CardContent className="space-y-4">
      <PaymentDelayBlock
        label="DSO · Vous payent vos clients"
        value={dso}
        description={dsoDescription(dso)}
      />
      <PaymentDelayBlock
        label="DPO · Vous payez vos fournisseurs"
        value={dpo}
        description={dpoDescription(dpo)}
      />
    </CardContent>
  )
}

function PaymentDelayBlock({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          <FormattedNumber value={value} />{" "}
          <span className="text-sm text-muted-foreground">jours</span>
        </p>
      </div>
      <Separator />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function dsoDescription(dso: number) {
  if (dso > 60)
    return `Vos clients mettent en moyenne ${dso.toFixed(0)} jours à régler. Au-dessus de 60 jours, l'encaissement pèse fortement sur la trésorerie.`
  if (dso > 45)
    return "Délai intermédiaire : l'encaissement reste correct, mais le cash reste dehors plus longtemps."
  return "Délai sain. Vos clients règlent rapidement."
}

function dpoDescription(dpo: number) {
  if (dpo < 30)
    return "Paiement rapide : le cash sort tôt par rapport au cycle fournisseur."
  if (dpo > 60)
    return "Vous payez tard. Attention au risque de litige et aux pénalités de retard légales (loi LME)."
  return "Délai standard. Bon équilibre entre relation fournisseur et trésorerie."
}

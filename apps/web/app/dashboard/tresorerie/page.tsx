"use client"

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
import { useState } from "react"

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
import { useFecStore } from "@/lib/fec/store"

export default function TresoreriePage() {
  const { data, comparisonData } = useFecStore()
  const [showComparison, setShowComparison] = useState(true)
  if (!data) return <DashboardEmptyState />

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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Trésorerie
        </h1>
        <ActionSummaryLink
          insights={data.insights}
          categories={["tresorerie"]}
        />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Solde actuel"
          value={<FormattedCurrency value={kpi.cashBalance} />}
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
          value={<FormattedCurrency value={cashProjection.projectedCash} />}
          icon={Wallet}
          description="Solde actuel après encaissement des créances échues et paiement des dettes échues identifiées dans le FEC."
          tone={projectedTone}
          hint="Après règlement des engagements échus"
        />
        <KpiCard
          label="Net engagé"
          value={
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
          }
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
                onToggle={() => setShowComparison((v) => !v)}
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
            projection={{
              label: "Prévis.",
              balance: cashProjection.projectedCash,
              flow: netEngagement,
            }}
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
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  DSO · Vous payent vos clients
                </p>
                <p className="font-heading text-2xl font-bold tabular-nums">
                  <FormattedNumber value={dso} />{" "}
                  <span className="text-sm text-muted-foreground">jours</span>
                </p>
              </div>
              <Separator />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {dso > 60
                  ? `Vos clients mettent en moyenne ${dso.toFixed(0)} jours à régler. Au-dessus de 60 jours, l'encaissement pèse fortement sur la trésorerie.`
                  : dso > 45
                    ? "Délai intermédiaire : l'encaissement reste correct, mais le cash reste dehors plus longtemps."
                    : "Délai sain. Vos clients règlent rapidement."}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  DPO · Vous payez vos fournisseurs
                </p>
                <p className="font-heading text-2xl font-bold tabular-nums">
                  <FormattedNumber value={dpo} />{" "}
                  <span className="text-sm text-muted-foreground">jours</span>
                </p>
              </div>
              <Separator />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {dpo < 30
                  ? "Paiement rapide : le cash sort tôt par rapport au cycle fournisseur."
                  : dpo > 60
                    ? `Vous payez tard. Attention au risque de litige et aux pénalités de retard légales (loi LME).`
                    : "Délai standard. Bon équilibre entre relation fournisseur et trésorerie."}
              </p>
            </div>
          </CardContent>
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

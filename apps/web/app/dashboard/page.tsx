"use client"

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
import Link from "next/link"
import { Suspense } from "react"

import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { BreakevenSection } from "@/components/fec/breakeven-section"
import { CashCombinedChart } from "@/components/fec/cash-combined-chart"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { MonthlyTrendChart } from "@/components/fec/monthly-trend-chart"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"

function DashboardOverview() {
  const { data } = useFecStore()

  if (!data) return <DashboardEmptyState />

  const {
    kpi,
    monthly,
    expenseCategories,
    revenueCategories,
    agedReceivables,
    agedPayables,
    cashProjection,
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-4 pb-8 md:px-6">
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Vue d'ensemble
        </h1>
      </header>

      {/* === KPI principaux === */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={<FormattedCurrency value={kpi.revenue} />}
            icon={CircleDollarSign}
            description="Total des produits de vente comptabilisés sur la période (comptes 7xx). C'est le volume d'activité avant déduction des charges."
            trend={
              monthly.length >= 6
                ? {
                    direction:
                      revenueGrowth > 0
                        ? "up"
                        : revenueGrowth < 0
                          ? "down"
                          : "neutral",
                    text: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
                    tone:
                      revenueGrowth > 0
                        ? "positive"
                        : revenueGrowth < -3
                          ? "negative"
                          : "neutral",
                  }
                : undefined
            }
            hint="3 derniers mois vs précédents"
          />
          <KpiCard
            label="Charges totales"
            value={<FormattedCurrency value={kpi.expenses} />}
            icon={ReceiptText}
            description="Total des dépenses comptabilisées sur la période (comptes 6xx). À comparer au chiffre d'affaires pour surveiller le poids des coûts."
            hint={`${(kpi.revenue > 0 ? (kpi.expenses / kpi.revenue) * 100 : 0).toFixed(0)}% du CA`}
          />
          <KpiCard
            label="Résultat net"
            value={<FormattedCurrency value={kpi.netResult} />}
            icon={TrendingUp}
            description="Chiffre d'affaires moins charges comptabilisées. Positif, l'activité dégage un bénéfice ; négatif, elle consomme de la marge."
            tone={marginTone}
            hint={`Marge ${formatPercent(kpi.margin)}`}
          />
          <KpiCard
            label="Trésorerie"
            value={<FormattedCurrency value={kpi.cashBalance} />}
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
            value={<FormattedCurrency value={kpi.grossMargin} />}
            description="Chiffre d'affaires moins achats consommés. Elle indique ce qui reste avant charges externes, salaires et impôts."
            hint={`${formatPercent(kpi.grossMarginRate)} du CA`}
            icon={PiggyBank}
          />
          <KpiCard
            label="Excédent brut d'exploitation"
            value={<FormattedCurrency value={kpi.ebe} />}
            description="Approximation de l'exploitation courante : CA - achats - charges externes - personnel - impôts, hors amortissements et charges financières."
            hint="CA - achats - charges externes - personnel - impôts"
          />
          <KpiCard
            label="Créances vs dettes"
            value={
              <FormattedCurrency
                value={kpi.customerReceivables - kpi.supplierPayables}
              />
            }
            description="Créances clients moins dettes fournisseurs. Positif, les clients vous doivent plus que ce que vous devez aux fournisseurs."
            hint={
              <>
                Clients <FormattedCurrency value={kpi.customerReceivables} /> ·
                Fournisseurs <FormattedCurrency value={kpi.supplierPayables} />
              </>
            }
          />
        </div>
      </section>

      {/* === Composition du résultat === */}
      <section>
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Comparez d'où vient l'argent et où il part. Le bloc vert au sommet des charges représente ce qu'il reste — votre résultat net.">
              Composition du résultat
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <ResultBreakdown
              revenueCategories={revenueCategories}
              expenseCategories={expenseCategories}
              revenue={kpi.revenue}
              expenses={kpi.expenses}
              netResult={kpi.netResult}
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
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <ExplainedCardTitle description="L'aire montre le solde cumulé fin de mois, les barres montrent le flux net mensuel, et le point pointillé projette le solde après engagements échus.">
                  Évolution de la trésorerie
                </ExplainedCardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/dashboard/tresorerie" />}
              >
                Détail
                <ArrowRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CashCombinedChart
              monthly={monthly}
              projection={{
                label: "Prévis.",
                balance: cashProjection.projectedCash,
                flow:
                  cashProjection.totalInflows - cashProjection.totalOutflows,
              }}
              className="h-[360px] w-full"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function DashboardOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60svh] items-center justify-center text-sm text-muted-foreground">
          Chargement…
        </div>
      }
    >
      <DashboardOverview />
    </Suspense>
  )
}

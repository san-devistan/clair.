"use client"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Landmark, Scale, ShieldCheck, WalletCards } from "lucide-react"

import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import { BalanceSheetRatioGrid } from "@/components/fec/balance-sheet-ratios"
import {
  BalanceSheetAsOf,
  BalanceSheetLineTable,
  BalanceSheetVisual,
} from "@/components/fec/balance-sheet-section"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"

export default function BilanPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { balanceSheet } = data
  const equityRatio =
    balanceSheet.ratios.find((ratio) => ratio.key === "equityRatio")?.value ??
    null
  const currentLiquidity =
    balanceSheet.ratios.find((ratio) => ratio.key === "currentLiquidity")
      ?.value ?? null
  const equityTone =
    balanceSheet.funding.equity < 0
      ? "danger"
      : equityRatio !== null && equityRatio < 0.3
        ? "warning"
        : "success"
  const cashTone =
    balanceSheet.netCash < 0
      ? "danger"
      : currentLiquidity !== null && currentLiquidity < 1.2
        ? "warning"
        : "success"

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Bilan
          </h1>
          <BalanceSheetAsOf balanceSheet={balanceSheet} />
        </div>
        <ActionSummaryLink
          insights={data.insights}
          categories={["tresorerie", "clients", "fournisseurs", "marge"]}
        />
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total actif"
          value={<FormattedCurrency value={balanceSheet.totalAssets} />}
          icon={Scale}
          description="Valeur totale des moyens détenus par l'entreprise : immobilisations, stocks, créances et trésorerie."
          hint="Ce que l'entreprise possède"
        />
        <KpiCard
          label="Capitaux propres"
          value={<FormattedCurrency value={balanceSheet.funding.equity} />}
          icon={ShieldCheck}
          description="Capital, réserves et résultat estimé de la période. Des capitaux propres négatifs signalent une fragilité structurelle."
          tone={equityTone}
          hint={
            equityRatio !== null
              ? `${formatPercent(equityRatio * 100)} du total actif`
              : undefined
          }
        />
        <KpiCard
          label="Dettes totales"
          value={<FormattedCurrency value={balanceSheet.totalDebt} />}
          icon={Landmark}
          description="Dettes financières, fournisseurs, fiscales, sociales et trésorerie négative identifiées dans le bilan."
          hint="Dette financière + dettes d'exploitation"
        />
        <KpiCard
          label="Trésorerie nette"
          value={<FormattedCurrency value={balanceSheet.netCash} />}
          icon={WalletCards}
          description="Trésorerie positive moins éventuelle trésorerie négative. À lire avec le BFR pour comprendre la pression de cash."
          tone={cashTone}
          hint="Fonds de roulement − BFR"
        />
      </section>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Le bloc Actif montre ce que l'entreprise possède. Le bloc Passif montre comment cet actif est financé : capitaux propres, dettes et découvert éventuel.">
            Actif / Passif
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent>
          <BalanceSheetVisual balanceSheet={balanceSheet} />
        </CardContent>
      </Card>

      <BalanceSheetRatioGrid balanceSheet={balanceSheet} />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Détail des grands postes de l'actif, calculés à partir des soldes des comptes 2 à 5.">
              Détail de l'actif
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <BalanceSheetLineTable
              title="Actif"
              lines={balanceSheet.assetLines}
              total={balanceSheet.totalAssets}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Détail des ressources qui financent l'actif : capitaux propres, dettes financières, fournisseurs et autres dettes.">
              Détail du passif
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <BalanceSheetLineTable
              title="Passif"
              lines={balanceSheet.fundingLines}
              total={balanceSheet.totalFunding}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

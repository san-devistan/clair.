"use client"

import { BalanceSheetRatioGrid } from "@/components/fec/balance-sheet/ratios"
import {
  BalanceSheetAsOf,
  BalanceSheetLineTable,
  BalanceSheetVisual,
} from "@/components/fec/balance-sheet/section"
import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { KpiCard } from "@/components/fec/cards/kpi"
import { DashboardEmptyState } from "@/components/fec/dashboard/empty-state"
import { DashboardPage } from "@/components/fec/dashboard/page"
import { FormattedCurrency } from "@/components/fec/numbers/formatted"
import type { BalanceSheetSummary } from "@/lib/fec/balance-sheet-types"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Landmark, Scale, ShieldCheck, WalletCards } from "lucide-react"
import { createElement } from "react"

export const Route = createFileRoute("/dashboard/bilan")({
  component: BilanPage,
})

const BALANCE_ACTION_CATEGORIES = [
  "tresorerie",
  "clients",
  "fournisseurs",
  "marge",
] as const

function BilanPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { balanceSheet } = data
  const equityRatio = balanceRatio(balanceSheet, "equityRatio")
  const currentLiquidity = balanceRatio(balanceSheet, "currentLiquidity")
  const equityTone = equityKpiTone(balanceSheet, equityRatio)
  const cashTone = cashKpiTone(balanceSheet, currentLiquidity)
  const assetsValue = createElement(FormattedCurrency, {
    value: balanceSheet.totalAssets,
  })
  const equityValue = createElement(FormattedCurrency, {
    value: balanceSheet.funding.equity,
  })
  const debtValue = createElement(FormattedCurrency, {
    value: balanceSheet.totalDebt,
  })
  const netCashValue = createElement(FormattedCurrency, {
    value: balanceSheet.netCash,
  })
  const titleMeta = createElement(BalanceSheetAsOf, { balanceSheet })

  return (
    <DashboardPage
      title="Bilan"
      titleMeta={titleMeta}
      insights={data.insights}
      actionCategories={BALANCE_ACTION_CATEGORIES}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total actif"
          value={assetsValue}
          icon={Scale}
          description="Valeur totale des moyens détenus par l'entreprise : immobilisations, stocks, créances et trésorerie."
          hint="Ce que l'entreprise possède"
        />
        <KpiCard
          label="Capitaux propres"
          value={equityValue}
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
          value={debtValue}
          icon={Landmark}
          description="Dettes financières, fournisseurs, fiscales, sociales et trésorerie négative identifiées dans le bilan."
          hint="Dette financière + dettes d'exploitation"
        />
        <KpiCard
          label="Trésorerie nette"
          value={netCashValue}
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
    </DashboardPage>
  )
}

function balanceRatio(balanceSheet: BalanceSheetSummary, key: string) {
  return balanceSheet.ratios.find((ratio) => ratio.key === key)?.value ?? null
}

function equityKpiTone(
  balanceSheet: BalanceSheetSummary,
  equityRatio: number | null
) {
  if (balanceSheet.funding.equity < 0) return "danger"
  if (equityRatio !== null && equityRatio < 0.3) return "warning"
  return "success"
}

function cashKpiTone(
  balanceSheet: BalanceSheetSummary,
  currentLiquidity: number | null
) {
  if (balanceSheet.netCash < 0) return "danger"
  if (currentLiquidity !== null && currentLiquidity < 1.2) return "warning"
  return "success"
}

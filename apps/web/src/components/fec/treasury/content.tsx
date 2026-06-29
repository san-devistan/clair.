import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { KpiCard } from "@/components/fec/cards/kpi"
import { ComparisonToggle } from "@/components/fec/comparison/toggle"
import { DashboardPage } from "@/components/fec/dashboard/page"
import { TopList } from "@/components/fec/lists/top"
import { FormattedCurrency } from "@/components/fec/numbers/formatted"
import type { DashboardData } from "@/lib/fec/analytics"
import {
  buildTreasuryProjectionPoint,
  computeCustomerPaymentDelay,
  computeNetCashEngagement,
  computeSupplierPaymentDelay,
  getCashRiskTone,
} from "@/lib/fec/dashboard-metrics"
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
import { createElement, useCallback, useState } from "react"

import { CashCombinedChart } from "./combined-chart"
import { PaymentDelayContent } from "./payment-delay-content"
import { CashProjectionCard } from "./projection-card"

const TREASURY_ACTION_CATEGORIES = ["tresorerie"] as const

function TresorerieContent({
  data,
  comparisonData,
}: {
  data: DashboardData
  comparisonData: DashboardData | null
}) {
  const [showComparison, setShowComparison] = useState(true)

  const { kpi, monthly, cashByAccount, cashProjection } = data

  const dso = computeCustomerPaymentDelay(data)
  const dpo = computeSupplierPaymentDelay(data)

  const netEngagement = computeNetCashEngagement(cashProjection)
  const isImproving = netEngagement >= 0
  const projectedTone =
    getCashRiskTone(cashProjection.projectedCash, kpi.revenue) ?? "success"
  const cashBalanceValue = createElement(FormattedCurrency, {
    value: kpi.cashBalance,
  })
  const projectedCashValue = createElement(FormattedCurrency, {
    value: cashProjection.projectedCash,
  })
  const netEngagementValue = createElement(
    "span",
    {
      className: isImproving
        ? "text-emerald-600 dark:text-emerald-500"
        : "text-destructive",
    },
    netEngagement > 0 ? "+" : "",
    createElement(FormattedCurrency, { value: netEngagement })
  )
  const projection = buildTreasuryProjectionPoint(cashProjection)
  const toggleComparison = useCallback(
    () => setShowComparison((value) => !value),
    []
  )

  return (
    <DashboardPage
      title="Trésorerie"
      insights={data.insights}
      actionCategories={TREASURY_ACTION_CATEGORIES}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Solde actuel"
          value={cashBalanceValue}
          icon={Banknote}
          description="Solde cumulé des comptes de banque et de caisse à la fin de la période importée."
          tone={getCashRiskTone(kpi.cashBalance, kpi.revenue) ?? "success"}
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
    </DashboardPage>
  )
}

export { TresorerieContent }

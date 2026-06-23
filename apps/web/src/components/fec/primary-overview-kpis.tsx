import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard, type KpiCardProps } from "@/components/fec/kpi-card"
import type { DashboardData } from "@/lib/fec/analytics"
import {
  computeRecentRevenueGrowth,
  getCashRiskTone,
  getMarginTone,
} from "@/lib/fec/dashboard-metrics"
import { formatPercent } from "@/lib/fec/format"
import { CircleDollarSign, ReceiptText, TrendingUp, Wallet } from "lucide-react"
import { createElement } from "react"

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

export { PrimaryOverviewKpis }

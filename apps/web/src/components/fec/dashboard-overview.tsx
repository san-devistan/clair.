import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { BalanceSheetOverviewCard } from "@/components/fec/balance-sheet-section"
import { BreakevenSection } from "@/components/fec/breakeven-section"
import { DashboardPage } from "@/components/fec/dashboard-page"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { MonthlyTrendSection } from "@/components/fec/monthly-trend-section"
import { OverviewKpiSection } from "@/components/fec/overview-kpi-section"
import { ResultCompositionSection } from "@/components/fec/result-composition-section"
import { TreasuryOverviewSection } from "@/components/fec/treasury-overview-section"
import { buildTreasuryProjectionPoint } from "@/lib/fec/dashboard-metrics"
import { useFecStore } from "@/lib/fec/store"

const OVERVIEW_ACTION_CATEGORIES = ["marge"] as const

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

export { DashboardOverview }

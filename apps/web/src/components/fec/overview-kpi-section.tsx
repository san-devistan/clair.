import { PrimaryOverviewKpis } from "@/components/fec/primary-overview-kpis"
import { SecondaryOverviewKpis } from "@/components/fec/secondary-overview-kpis"
import type { DashboardData } from "@/lib/fec/analytics"

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

export { OverviewKpiSection }

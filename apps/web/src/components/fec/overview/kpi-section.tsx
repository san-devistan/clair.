import type { DashboardData } from "@/lib/fec/analytics"

import { PrimaryOverviewKpis } from "./primary-kpis"
import { SecondaryOverviewKpis } from "./secondary-kpis"

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

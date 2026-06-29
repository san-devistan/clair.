import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import Link from "@/components/link"
import type { DashboardData } from "@/lib/fec/analytics"
import type { TreasuryProjectionPoint } from "@/lib/fec/dashboard-metrics"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { ArrowRight } from "lucide-react"

import { CashCombinedChart } from "./combined-chart"

const TREASURY_DETAIL_LINK = <Link href="/dashboard/tresorerie" />

function TreasuryOverviewSection({
  monthly,
  projection,
}: {
  monthly: DashboardData["monthly"]
  projection: TreasuryProjectionPoint
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <ExplainedCardTitle description="L'aire montre le solde cumulé fin de mois, les barres montrent le flux net mensuel, et le point pointillé projette le solde après engagements échus.">
              Évolution de la trésorerie
            </ExplainedCardTitle>
            <Button variant="ghost" size="sm" render={TREASURY_DETAIL_LINK}>
              Détail
              <ArrowRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CashCombinedChart
            monthly={monthly}
            projection={projection}
            className="h-[360px] w-full"
          />
        </CardContent>
      </Card>
    </section>
  )
}

export { TreasuryOverviewSection }

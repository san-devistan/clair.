import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { useDashboardHref } from "@/components/fec/dashboard/mode"
import Link from "@/components/link"
import type { DashboardData } from "@/lib/fec/analytics"
import type { TreasuryProjectionPoint } from "@/lib/fec/dashboard-metrics"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"

import { CashCombinedChart } from "./combined-chart"

function TreasuryOverviewSection({
  monthly,
  projection,
}: {
  monthly: DashboardData["monthly"]
  projection: TreasuryProjectionPoint
}) {
  const treasuryHref = useDashboardHref("/tresorerie")
  const treasuryDetailLink = useMemo(
    () => <Link href={treasuryHref} />,
    [treasuryHref]
  )

  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <ExplainedCardTitle description="L'aire montre le solde cumulé fin de mois, les barres montrent le flux net mensuel, et le point pointillé projette le solde après engagements échus.">
              Évolution de la trésorerie
            </ExplainedCardTitle>
            <Button variant="ghost" size="sm" render={treasuryDetailLink}>
              Détail
              <ArrowRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-chart-lg w-full">
            <CashCombinedChart
              monthly={monthly}
              projection={projection}
              className="size-full"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export { TreasuryOverviewSection }

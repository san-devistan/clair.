import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { MonthlyTrendChart } from "@/components/fec/monthly-trend-chart"
import type { DashboardData } from "@/lib/fec/analytics"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"

function MonthlyTrendSection({ monthly }: Pick<DashboardData, "monthly">) {
  return (
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
  )
}

export { MonthlyTrendSection }

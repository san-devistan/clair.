import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
import type { DashboardData } from "@/lib/fec/analytics"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"

function ResultCompositionSection({
  revenueCategories,
  revenueDetails,
  expenseCategories,
  expenseDetails,
}: Pick<
  DashboardData,
  | "revenueCategories"
  | "revenueDetails"
  | "expenseCategories"
  | "expenseDetails"
>) {
  return (
    <section>
      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Comparez d'où vient l'argent et où il part. Ouvrez une catégorie pour voir les comptes et auxiliaires qui la composent.">
            Composition du résultat
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent>
          <ResultBreakdown
            revenueCategories={revenueCategories}
            revenueDetails={revenueDetails}
            expenseCategories={expenseCategories}
            expenseDetails={expenseDetails}
          />
        </CardContent>
      </Card>
    </section>
  )
}

export { ResultCompositionSection }

"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Briefcase, Building2, Receipt, ReceiptText } from "lucide-react"
import { useState } from "react"

import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import { ComparisonToggle } from "@/components/fec/comparison-toggle"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { MonthlyBarChart } from "@/components/fec/monthly-bar-chart"
import { RepartitionSection } from "@/components/fec/repartition-section"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"

export default function ChargesPage() {
  const { data, comparisonData } = useFecStore()
  const [showComparison, setShowComparison] = useState(true)
  if (!data) return <DashboardEmptyState />

  const { kpi, monthly, expenseCategories, expenseDetails } = data

  const expenseRatio = kpi.revenue > 0 ? (kpi.expenses / kpi.revenue) * 100 : 0
  const payrollRatio = kpi.revenue > 0 ? (kpi.payroll / kpi.revenue) * 100 : 0
  const externalRatio =
    kpi.revenue > 0 ? (kpi.externalCharges / kpi.revenue) * 100 : 0
  const monthlyAvgExpenses =
    monthly.length > 0 ? kpi.expenses / monthly.length : 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Charges
        </h1>
        <ActionSummaryLink insights={data.insights} categories={["charges"]} />
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Charges totales"
          value={<FormattedCurrency value={kpi.expenses} />}
          icon={ReceiptText}
          description="Total des dépenses comptabilisées sur la période (comptes 6xx). À comparer au chiffre d'affaires pour surveiller le poids des coûts."
          hint={`${expenseRatio.toFixed(0)}% du CA`}
        />
        <KpiCard
          label="Charges mensuelles moy."
          value={<FormattedCurrency value={monthlyAvgExpenses} />}
          icon={Receipt}
          description="Charges totales divisées par le nombre de mois analysés. Sert à estimer le niveau de dépenses mensuel récurrent."
          hint="Moyenne sur la période"
        />
        <KpiCard
          label="Salaires + charges sociales"
          value={<FormattedCurrency value={kpi.payroll} />}
          icon={Briefcase}
          description="Montant des comptes de personnel et cotisations sociales. À suivre en part du CA pour mesurer le poids de l'équipe."
          hint={`${formatPercent(payrollRatio)} du CA`}
          tone={payrollRatio > 60 ? "warning" : "default"}
        />
        <KpiCard
          label="Services extérieurs"
          value={<FormattedCurrency value={kpi.externalCharges} />}
          icon={Building2}
          description="Prestations, loyers, sous-traitance, énergie, télécoms et autres charges externes comptabilisées sur la période."
          hint={`${formatPercent(externalRatio)} du CA`}
        />
      </section>

      <RepartitionSection
        title="Répartition des charges"
        description="Montre la part de chaque catégorie comptable dans vos dépenses, avec un mode détail pour voir les comptes et auxiliaires qui composent chaque catégorie."
        categories={expenseCategories}
        details={expenseDetails}
        variant="expenses"
        emptyLabel="Aucune charge identifiée"
      />

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Compare les charges mois par mois pour détecter les pics, les postes saisonniers et les dépenses qui deviennent récurrentes.">
            Évolution mensuelle des charges
          </ExplainedCardTitle>
          {comparisonData ? (
            <CardAction>
              <ComparisonToggle
                active={showComparison}
                onToggle={() => setShowComparison((v) => !v)}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <MonthlyBarChart
            monthly={monthly}
            metric="expenses"
            categories={expenseCategories}
            comparison={
              showComparison && comparisonData
                ? comparisonData.monthly
                : undefined
            }
            comparisonCategories={
              showComparison && comparisonData
                ? comparisonData.expenseCategories
                : undefined
            }
            className="h-[320px] w-full"
          />
        </CardContent>
      </Card>
    </div>
  )
}

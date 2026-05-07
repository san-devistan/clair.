"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Briefcase, Building2, Receipt, ReceiptText } from "lucide-react"
import { useState } from "react"

import { AccountDetailSection } from "@/components/fec/account-detail-section"
import { CategoryTable } from "@/components/fec/category-table"
import { ComparisonToggle } from "@/components/fec/comparison-toggle"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { MonthlyBarChart } from "@/components/fec/monthly-bar-chart"
import { ResultBreakdown } from "@/components/fec/result-breakdown"
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
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Charges
        </h1>
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
          description="Prestations, loyers, sous-traitance, énergie, télécoms et autres charges externes. Ce sont souvent des contrats renégociables."
          hint={`${formatPercent(externalRatio)} du CA`}
        />
      </section>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Montre la part de chaque catégorie comptable dans vos dépenses pour identifier les coûts qui pèsent vraiment sur la marge.">
            Composition des charges
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResultBreakdown
            variant="expenses"
            expenseCategories={expenseCategories}
            expenses={kpi.expenses}
          />
          <CategoryTable items={expenseCategories} />
        </CardContent>
      </Card>

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
            comparison={
              showComparison && comparisonData
                ? comparisonData.monthly
                : undefined
            }
            className="h-[320px] w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Classe les charges par compte général et compte auxiliaire lorsqu'il existe, pour repérer les dépenses principales et les lignes à vérifier.">
            Détail des charges
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent>
          <AccountDetailSection
            items={expenseDetails}
            variant="expenses"
            emptyLabel="Aucune charge identifiée"
          />
        </CardContent>
      </Card>

      {expenseCategories.length > 0 ? (
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Suggestions concrètes calculées à partir de votre structure de charges, pour repérer les économies ou négociations prioritaires.">
              Pistes d'optimisation
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {payrollRatio > 60 ? (
              <div className="rounded-lg border-l-2 border-amber-500 bg-amber-500/5 p-3">
                <p className="font-medium">Charges de personnel élevées</p>
                <p className="mt-0.5 text-muted-foreground">
                  Plus de 60% du CA part en salaires et charges. Avant
                  d'envisager une réduction d'effectif, optimisez la
                  productivité (outils, processus) et vérifiez les aides à
                  l'embauche/formation.
                </p>
              </div>
            ) : null}
            {externalRatio > 30 ? (
              <div className="rounded-lg border-l-2 border-blue-500 bg-blue-500/5 p-3">
                <p className="font-medium">Services extérieurs importants</p>
                <p className="mt-0.5 text-muted-foreground">
                  Les loyers, télécom, énergie, sous-traitance pèsent{" "}
                  {externalRatio.toFixed(0)}% du CA. Renégociez ces contrats
                  annuellement, mettez les fournisseurs en concurrence.
                </p>
              </div>
            ) : null}
            {kpi.financialCharges > kpi.revenue * 0.02 ? (
              <div className="rounded-lg border-l-2 border-amber-500 bg-amber-500/5 p-3">
                <p className="font-medium">
                  Charges financières non négligeables
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Vos intérêts et frais bancaires représentent{" "}
                  {((kpi.financialCharges / kpi.revenue) * 100).toFixed(1)}% du
                  CA. Comparez les conditions de votre banque, renégociez les
                  taux ou consolidez les emprunts.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

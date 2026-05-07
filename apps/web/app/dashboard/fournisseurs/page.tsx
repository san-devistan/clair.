"use client"

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { CalendarClock, ChartLine, HandCoins, Truck } from "lucide-react"

import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { CounterpartyTable } from "@/components/fec/counterparty-table"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { formatPercent } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"

export default function FournisseursPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { kpi, topSuppliers, agedPayables } = data

  const totalSupplierVolume = topSuppliers.reduce((s, c) => s + c.amount, 0)
  const top1Share =
    topSuppliers.length > 0 && totalSupplierVolume > 0
      ? (topSuppliers[0]!.amount / totalSupplierVolume) * 100
      : 0

  const monthsCovered = data.period.monthsCovered
  const annualizedExpenses =
    monthsCovered > 0 ? (kpi.expenses / monthsCovered) * 12 : kpi.expenses
  const dpo =
    annualizedExpenses > 0
      ? (kpi.supplierPayables / annualizedExpenses) * 365
      : 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Fournisseurs
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Fournisseurs identifiés"
          value={<FormattedNumber value={topSuppliers.length} />}
          icon={Truck}
          description="Nombre de comptes fournisseurs auxiliaires avec du volume sur la période. Sert à voir la diversité de vos partenaires."
          hint="Comptes auxiliaires actifs"
        />
        <KpiCard
          label="Top fournisseur"
          value={formatPercent(top1Share)}
          icon={ChartLine}
          description="Part du volume fournisseur portée par le plus gros fournisseur. Utile pour repérer un partenaire critique ou un levier de négociation."
          hint={topSuppliers[0]?.label ?? "—"}
        />
        <KpiCard
          label="Dettes fournisseurs"
          value={<FormattedCurrency value={kpi.supplierPayables} />}
          icon={HandCoins}
          description="Montant restant dû aux fournisseurs à la fin de la période, calculé à partir des comptes 40."
          hint="Solde à payer"
        />
        <KpiCard
          label="Délai paiement (DPO)"
          value={
            <>
              <FormattedNumber value={dpo} /> j
            </>
          }
          icon={CalendarClock}
          description="Estimation du délai moyen de paiement : dettes fournisseurs rapportées aux charges annualisées. Indique combien de temps vous conservez le cash avant paiement."
          hint={
            dpo < 30
              ? "Vous payez vite"
              : dpo > 60
                ? "Risque de litige"
                : "Délai standard"
          }
        />
      </section>

      <AgedBalanceCard type="fournisseurs" data={agedPayables} />

      <Card>
        <CardHeader>
          <ExplainedCardTitle description="Tableau d'action cash trié par retard puis par montant à payer, à partir des comptes auxiliaires fournisseurs (401xxx). Les comptes soldés sont masqués.">
            Tableau de bord fournisseurs
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent>
          <CounterpartyTable aging={agedPayables} variant="suppliers" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/[0.04] to-transparent">
        <CardHeader>
          <ExplainedCardTitle description="Plus un fournisseur pèse dans vos achats, plus vous avez d'arguments pour négocier tarifs, délais ou conditions.">
            Vos leviers de négociation
          </ExplainedCardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-heading text-sm font-bold text-primary">
              01 · Demander 3 devis
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pour vos 2-3 plus gros postes, sollicitez systématiquement la
              concurrence chaque année. Vous obtiendrez 5-15% de remise.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-heading text-sm font-bold text-primary">
              02 · Allonger les délais
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Passer de 30 à 60 jours sur vos plus gros fournisseurs vous
              redonne instantanément du cash. Négociable si vous payez
              régulièrement.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-heading text-sm font-bold text-primary">
              03 · Consolider
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Si plusieurs fournisseurs vous fournissent le même type de
              service, regroupez chez le moins cher. Volume = pouvoir de
              négociation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

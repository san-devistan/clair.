"use client"

import { CalendarClock, CircleDollarSign, HandCoins, Truck } from "lucide-react"

import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { CounterpartyWeightSection } from "@/components/fec/counterparty-weight-section"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import { useFecStore } from "@/lib/fec/store"

export default function FournisseursPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { kpi, topSuppliers, agedPayables } = data

  const totalSupplierVolume = topSuppliers.reduce((s, c) => s + c.amount, 0)
  const monthsCovered = data.period.monthsCovered
  const annualizedExpenses =
    monthsCovered > 0 ? (kpi.expenses / monthsCovered) * 12 : kpi.expenses
  const dpo =
    annualizedExpenses > 0
      ? (kpi.supplierPayables / annualizedExpenses) * 365
      : 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Fournisseurs
        </h1>
        <ActionSummaryLink
          insights={data.insights}
          categories={["fournisseurs"]}
        />
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Dettes fournisseurs"
          value={<FormattedCurrency value={kpi.supplierPayables} />}
          icon={HandCoins}
          description="Montant restant dû aux fournisseurs à la fin de la période, calculé à partir des comptes 40."
          hint="Solde à payer"
        />
        <KpiCard
          label="Délai de paiement"
          value={
            <>
              <FormattedNumber value={dpo} /> j
            </>
          }
          icon={CalendarClock}
          description="Estimation du délai moyen de paiement : dettes fournisseurs rapportées aux charges annualisées. Indique combien de temps vous conservez le cash avant paiement."
          hint="DPO moyen"
        />
        <KpiCard
          label="Volume fournisseur"
          value={<FormattedCurrency value={totalSupplierVolume} />}
          icon={CircleDollarSign}
          description="Volume total facturé par les fournisseurs identifiés sur la période. Sert à mesurer le poids de vos partenaires."
          hint="Volume facturé"
        />
        <KpiCard
          label="Nombre de fournisseurs"
          value={<FormattedNumber value={topSuppliers.length} />}
          icon={Truck}
          description="Nombre de comptes fournisseurs auxiliaires avec du volume sur la période. Sert à voir la diversité de vos partenaires."
          hint="Tiers actifs"
        />
      </section>

      <AgedBalanceCard type="fournisseurs" data={agedPayables} />

      <CounterpartyWeightSection items={topSuppliers} variant="fournisseurs" />
    </div>
  )
}

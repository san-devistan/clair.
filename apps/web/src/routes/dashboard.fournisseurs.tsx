"use client"

import { AgedBalanceCard } from "@/components/fec/aged-balance-card"
import { CounterpartyWeightSection } from "@/components/fec/counterparty-weight-section"
import { DashboardPage } from "@/components/fec/dashboard-page"
import { DashboardEmptyState } from "@/components/fec/empty-state"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import {
  computeCounterpartyVolume,
  computeSupplierPaymentDelay,
} from "@/lib/fec/dashboard-metrics"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import { CalendarClock, CircleDollarSign, HandCoins, Truck } from "lucide-react"
import { Fragment, createElement } from "react"

export const Route = createFileRoute("/dashboard/fournisseurs")({
  component: FournisseursPage,
})

const SUPPLIER_ACTION_CATEGORIES = ["fournisseurs"] as const

function FournisseursPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { kpi, topSuppliers, agedPayables } = data

  const totalSupplierVolume = computeCounterpartyVolume(topSuppliers)
  const dpo = computeSupplierPaymentDelay(data)
  const payablesValue = createElement(FormattedCurrency, {
    value: kpi.supplierPayables,
  })
  const dpoValue = createElement(
    Fragment,
    null,
    createElement(FormattedNumber, { value: dpo }),
    " j"
  )
  const supplierVolumeValue = createElement(FormattedCurrency, {
    value: totalSupplierVolume,
  })
  const supplierCountValue = createElement(FormattedNumber, {
    value: topSuppliers.length,
  })

  return (
    <DashboardPage
      title="Fournisseurs"
      insights={data.insights}
      actionCategories={SUPPLIER_ACTION_CATEGORIES}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Dettes fournisseurs"
          value={payablesValue}
          icon={HandCoins}
          description="Montant restant dû aux fournisseurs à la fin de la période, calculé à partir des comptes 40."
          hint="Solde à payer"
        />
        <KpiCard
          label="Délai de paiement"
          value={dpoValue}
          icon={CalendarClock}
          description="Estimation du délai moyen de paiement : dettes fournisseurs rapportées aux charges annualisées. Indique combien de temps vous conservez le cash avant paiement."
          hint="DPO moyen"
        />
        <KpiCard
          label="Volume fournisseur"
          value={supplierVolumeValue}
          icon={CircleDollarSign}
          description="Volume total facturé par les fournisseurs identifiés sur la période. Sert à mesurer le poids de vos partenaires."
          hint="Volume facturé"
        />
        <KpiCard
          label="Nombre de fournisseurs"
          value={supplierCountValue}
          icon={Truck}
          description="Nombre de comptes fournisseurs auxiliaires avec du volume sur la période. Sert à voir la diversité de vos partenaires."
          hint="Tiers actifs"
        />
      </section>

      <AgedBalanceCard type="fournisseurs" data={agedPayables} />

      <CounterpartyWeightSection items={topSuppliers} variant="fournisseurs" />
    </DashboardPage>
  )
}

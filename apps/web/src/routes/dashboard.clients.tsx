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
  computeCustomerPaymentDelay,
} from "@/lib/fec/dashboard-metrics"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import { CalendarClock, CircleDollarSign, HandCoins, Users } from "lucide-react"
import { Fragment, createElement } from "react"

export const Route = createFileRoute("/dashboard/clients")({
  component: ClientsPage,
})

const CLIENT_ACTION_CATEGORIES = ["clients"] as const

function ClientsPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { kpi, topCustomers, agedReceivables } = data

  const totalCustomerVolume = computeCounterpartyVolume(topCustomers)
  const dso = computeCustomerPaymentDelay(data)
  const receivablesValue = createElement(FormattedCurrency, {
    value: kpi.customerReceivables,
  })
  const dsoValue = createElement(
    Fragment,
    null,
    createElement(FormattedNumber, { value: dso }),
    " j"
  )
  const customerVolumeValue = createElement(FormattedCurrency, {
    value: totalCustomerVolume,
  })
  const customerCountValue = createElement(FormattedNumber, {
    value: topCustomers.length,
  })

  return (
    <DashboardPage
      title="Clients"
      insights={data.insights}
      actionCategories={CLIENT_ACTION_CATEGORIES}
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Créances clients"
          value={receivablesValue}
          icon={HandCoins}
          description="Montant total restant dû par les clients à la fin de la période, calculé à partir des comptes clients."
          hint="Solde à encaisser"
        />
        <KpiCard
          label="Délai de paiement"
          value={dsoValue}
          icon={CalendarClock}
          tone={dso > 60 ? "warning" : "default"}
          description="Estimation du délai moyen d'encaissement : créances clients rapportées au CA annualisé. Plus il est haut, plus le cash reste dehors."
          hint="DSO moyen"
        />
        <KpiCard
          label="Volume client"
          value={customerVolumeValue}
          icon={CircleDollarSign}
          description="Volume total facturé aux clients identifiés sur la période. Sert à mesurer le poids commercial du portefeuille."
          hint="Volume facturé"
        />
        <KpiCard
          label="Nombre de clients"
          value={customerCountValue}
          icon={Users}
          description="Nombre de comptes clients auxiliaires avec du volume sur la période. Sert à mesurer la largeur du portefeuille."
          hint="Tiers actifs"
        />
      </section>

      <AgedBalanceCard type="clients" data={agedReceivables} />

      <CounterpartyWeightSection items={topCustomers} variant="clients" />
    </DashboardPage>
  )
}

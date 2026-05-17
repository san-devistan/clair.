"use client"

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
import { createFileRoute } from "@tanstack/react-router"
import { CalendarClock, CircleDollarSign, HandCoins, Users } from "lucide-react"
import { Fragment, createElement } from "react"

export const Route = createFileRoute("/dashboard/clients")({
  component: ClientsPage,
})

const CLIENT_ACTION_CATEGORIES = ["clients"] as const

export default function ClientsPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const { kpi, topCustomers, agedReceivables } = data

  const totalCustomerVolume = topCustomers.reduce((s, c) => s + c.amount, 0)

  // DSO
  const monthsCovered = data.period.monthsCovered
  const annualizedRevenue =
    monthsCovered > 0 ? (kpi.revenue / monthsCovered) * 12 : kpi.revenue
  const dso =
    annualizedRevenue > 0
      ? (kpi.customerReceivables / annualizedRevenue) * 365
      : 0
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Clients
        </h1>
        <ActionSummaryLink
          insights={data.insights}
          categories={CLIENT_ACTION_CATEGORIES}
        />
      </header>

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
    </div>
  )
}

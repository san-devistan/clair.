import { FormattedCurrency } from "@/components/fec/formatted-number"
import { KpiCard } from "@/components/fec/kpi-card"
import type { DashboardData } from "@/lib/fec/analytics"
import { formatPercent } from "@/lib/fec/format"
import { PiggyBank } from "lucide-react"
import { Fragment, createElement } from "react"

function SecondaryOverviewKpis({ kpi }: Pick<DashboardData, "kpi">) {
  const grossMarginValue = createElement(FormattedCurrency, {
    value: kpi.grossMargin,
  })
  const ebeValue = createElement(FormattedCurrency, { value: kpi.ebe })
  const receivablesMinusPayablesValue = createElement(FormattedCurrency, {
    value: kpi.customerReceivables - kpi.supplierPayables,
  })
  const receivablesPayablesHint = createElement(
    Fragment,
    null,
    "Clients ",
    createElement(FormattedCurrency, { value: kpi.customerReceivables }),
    " · Fournisseurs ",
    createElement(FormattedCurrency, { value: kpi.supplierPayables })
  )

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <KpiCard
        label="Marge brute"
        value={grossMarginValue}
        description="Chiffre d'affaires moins achats consommés. Elle indique ce qui reste avant charges externes, salaires et impôts."
        hint={`${formatPercent(kpi.grossMarginRate)} du CA`}
        icon={PiggyBank}
      />
      <KpiCard
        label="Excédent brut d'exploitation"
        value={ebeValue}
        description="Approximation de l'exploitation courante : CA - achats - charges externes - personnel - impôts, hors amortissements et charges financières."
        hint="CA - achats - charges externes - personnel - impôts"
      />
      <KpiCard
        label="Créances vs dettes"
        value={receivablesMinusPayablesValue}
        description="Créances clients moins dettes fournisseurs. Positif, les clients vous doivent plus que ce que vous devez aux fournisseurs."
        hint={receivablesPayablesHint}
      />
    </div>
  )
}

export { SecondaryOverviewKpis }

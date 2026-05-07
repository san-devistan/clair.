import type {
  ActionableInsight,
  CategoryBreakdown,
  KpiSummary,
  MonthlyPoint,
  TopCounterparty,
} from "./analytics"
import { formatEuro } from "./format"

interface InsightInputs {
  kpi: KpiSummary
  expenseCategories: CategoryBreakdown[]
  topCustomers: TopCounterparty[]
  topSuppliers: TopCounterparty[]
  monthly: MonthlyPoint[]
}

export function computeInsights({
  kpi,
  expenseCategories,
  topCustomers,
  topSuppliers,
  monthly,
}: InsightInputs): ActionableInsight[] {
  return [
    ...computeMarginInsights(kpi),
    ...computeExpenseCategoryInsights(expenseCategories),
    ...compactInsights([
      computeClientConcentrationInsight(topCustomers),
      computeSupplierLeverageInsight(topSuppliers),
      computeCashInsight(kpi),
      computeRevenueTrendInsight(monthly),
      computeReceivablesInsight(kpi),
    ]),
  ]
}

function computeMarginInsights(kpi: KpiSummary): ActionableInsight[] {
  if (kpi.margin < 5 && kpi.revenue > 0)
    return [
      {
        id: "low-margin",
        severity: kpi.margin < 0 ? "critical" : "warning",
        title:
          kpi.margin < 0
            ? "Votre activite est deficitaire sur la periode"
            : "Marge nette tres faible",
        description:
          kpi.margin < 0
            ? `Vous depensez plus que vous ne gagnez. Resultat net : ${formatEuro(kpi.netResult)}.`
            : `Votre marge nette est de ${kpi.margin.toFixed(1)}% du chiffre d'affaires.`,
        metric: `${kpi.margin.toFixed(1)}%`,
        action:
          "Identifiez les 2-3 postes de charges les plus lourds et fixez-vous un objectif de reduction de 10%.",
        category: "marge",
      },
    ]

  if (kpi.margin >= 15)
    return [
      {
        id: "good-margin",
        severity: "positive",
        title: "Excellente marge nette",
        description: `Votre rentabilite est superieure a la moyenne (${kpi.margin.toFixed(1)}%).`,
        action: "Reinvestissez ce surplus dans l'acquisition client ou la R&D.",
        category: "marge",
      },
    ]

  return []
}

function computeExpenseCategoryInsights(
  expenseCategories: CategoryBreakdown[]
): ActionableInsight[] {
  const top = expenseCategories[0]
  if (!top || top.share < 40) return []

  return [
    {
      id: `top-expense-${top.key}`,
      severity: "warning",
      title: `${top.label} represente ${top.share.toFixed(0)}% de vos charges`,
      description: `${formatEuro(top.amount)} sur la periode. Une reduction de 10% degagerait ${formatEuro(top.amount * 0.1)} de marge.`,
      action: actionForExpenseCategory(top.key),
      category: "charges",
    },
  ]
}

function actionForExpenseCategory(key: string): string {
  if (key === "fixes")
    return "Renegociez vos contrats fixes : loyer, telecoms, assurances, abonnements."
  if (key === "rh")
    return "Optimisez l'organisation du travail avant d'envisager des reductions d'effectifs."
  if (key === "variables")
    return "Renegociez vos achats : un volume groupe permet souvent 5-10% d'economies."
  if (key === "acquisitions")
    return "Mesurez le ROI de chaque depense d'acquisition avant de la reconduire."
  return "Auditez ce poste avec votre comptable pour identifier les economies possibles."
}

function computeClientConcentrationInsight(
  topCustomers: TopCounterparty[]
): ActionableInsight | null {
  if (topCustomers.length < 3) return null

  const totalCustomerVolume = topCustomers.reduce((s, c) => s + c.amount, 0)
  const top3Share =
    totalCustomerVolume > 0
      ? (topCustomers.slice(0, 3).reduce((s, c) => s + c.amount, 0) /
          totalCustomerVolume) *
        100
      : 0
  if (top3Share < 60) return null

  return {
    id: "client-concentration",
    severity: "warning",
    title: "Forte concentration de votre chiffre d'affaires",
    description: `Vos 3 plus gros clients pesent ${top3Share.toFixed(0)}% du volume client. Si l'un d'eux part, votre activite est fragilisee.`,
    action:
      "Lancez une action commerciale pour gagner 5 a 10 nouveaux clients d'ici 6 mois.",
    category: "clients",
  }
}

function computeSupplierLeverageInsight(
  topSuppliers: TopCounterparty[]
): ActionableInsight | null {
  if (topSuppliers.length < 3) return null

  const totalSupplier = topSuppliers.reduce((s, c) => s + c.amount, 0)
  const top1 = topSuppliers[0]
  if (!top1 || totalSupplier <= 0) return null
  if ((top1.amount / totalSupplier) * 100 < 30) return null

  return {
    id: "supplier-leverage",
    severity: "info",
    title: "Levier de negociation fournisseur",
    description: `${top1.label} represente une part importante de vos achats (${formatEuro(top1.amount)}). Vous avez du poids.`,
    action:
      "Demandez 3 devis concurrents et negociez 5 a 10% de remise sur volume.",
    category: "fournisseurs",
  }
}

function computeCashInsight(kpi: KpiSummary): ActionableInsight | null {
  if (kpi.cashBalance < 0)
    return {
      id: "negative-cash",
      severity: "critical",
      title: "Tresorerie negative",
      description: `Votre solde bancaire cumule sur la periode est de ${formatEuro(kpi.cashBalance)}.`,
      action:
        "Accelerez le recouvrement clients (relances), ou negociez un decouvert / un PGE avec votre banque.",
      category: "tresorerie",
    }

  if (kpi.revenue <= 0 || kpi.cashBalance >= kpi.revenue * 0.05) return null

  return {
    id: "low-cash",
    severity: "warning",
    title: "Tresorerie tendue",
    description:
      "Votre tresorerie represente moins d'un mois de chiffre d'affaires.",
    action:
      "Visez un matelas de 3 mois de charges fixes pour absorber les imprevus. Activez les relances clients.",
    category: "tresorerie",
  }
}

function computeRevenueTrendInsight(
  monthly: MonthlyPoint[]
): ActionableInsight | null {
  if (monthly.length < 6) return null

  const last3 = monthly.slice(-3).reduce((s, m) => s + m.revenue, 0)
  const prev3 = monthly.slice(-6, -3).reduce((s, m) => s + m.revenue, 0)
  if (prev3 <= 0) return null

  const growth = ((last3 - prev3) / prev3) * 100
  if (growth <= -10) return buildRevenueDeclineInsight(growth)
  if (growth >= 15) return buildRevenueGrowthInsight(growth)
  return null
}

function buildRevenueDeclineInsight(growth: number): ActionableInsight {
  return {
    id: "revenue-decline",
    severity: "warning",
    title: "Chiffre d'affaires en baisse",
    description: `Vos ventes des 3 derniers mois sont en recul de ${Math.abs(growth).toFixed(0)}% par rapport au trimestre precedent.`,
    action:
      "Lancez une campagne d'acquisition (ads, demarchage, partenariats) ou activez votre base existante (offre fidelite).",
    category: "ventes",
  }
}

function buildRevenueGrowthInsight(growth: number): ActionableInsight {
  return {
    id: "revenue-growth",
    severity: "positive",
    title: "Croissance forte du chiffre d'affaires",
    description: `+${growth.toFixed(0)}% sur les 3 derniers mois. Excellente dynamique.`,
    action:
      "Capitalisez : verrouillez les contrats clients, recrutez si necessaire, anticipez les besoins de tresorerie.",
    category: "ventes",
  }
}

function computeReceivablesInsight(kpi: KpiSummary): ActionableInsight | null {
  if (kpi.revenue <= 0 || kpi.customerReceivables <= kpi.revenue * 0.25)
    return null

  const dso = (kpi.customerReceivables / kpi.revenue) * 365
  return {
    id: "high-dso",
    severity: "warning",
    title: "Delai de paiement clients eleve",
    description: `Vos clients vous doivent ${formatEuro(kpi.customerReceivables)}, soit environ ${dso.toFixed(0)} jours de chiffre d'affaires.`,
    action:
      "Mettez en place des relances automatiques a J+15, J+30, J+45. Considerez l'affacturage si necessaire.",
    category: "clients",
  }
}

function compactInsights(
  insights: Array<ActionableInsight | null>
): ActionableInsight[] {
  const result: ActionableInsight[] = []
  for (const insight of insights) if (insight) result.push(insight)
  return result
}

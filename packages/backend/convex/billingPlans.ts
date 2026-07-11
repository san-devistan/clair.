export const PAID_PLAN_IDS = ["equipe", "pro", "enterprise"] as const

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number]
export type BillingPlanId = "free" | PaidPlanId

export type PlanCatalogItem = {
  id: PaidPlanId
  name: string
  amountCents: number | null
  currency: "eur"
  interval: "month"
  includedOrganizations: number
  includedMembersPerOrganization: number
  pricingModel: "flat" | "base-plus-addons"
}

export const PLAN_CATALOG: PlanCatalogItem[] = [
  {
    id: "equipe",
    name: "Equipe",
    amountCents: 3999,
    currency: "eur",
    interval: "month",
    includedOrganizations: 1,
    includedMembersPerOrganization: 3,
    pricingModel: "flat",
  },
  {
    id: "pro",
    name: "Pro",
    amountCents: 9999,
    currency: "eur",
    interval: "month",
    includedOrganizations: 3,
    includedMembersPerOrganization: 10,
    pricingModel: "flat",
  },
  {
    id: "enterprise",
    name: "Entreprise",
    amountCents: null,
    currency: "eur",
    interval: "month",
    includedOrganizations: 5,
    includedMembersPerOrganization: 20,
    pricingModel: "base-plus-addons",
  },
]

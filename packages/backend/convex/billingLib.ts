import type { GenericCtx } from "@convex-dev/better-auth/utils"
import type { DataModel } from "@workspace/backend/dataModel"
import { ConvexError } from "convex/values"

import { components } from "./_generated/api"
import { env } from "./_generated/server"

export const PAID_PLAN_IDS = ["equipe", "pro", "enterprise"] as const

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number]
export type BillingPlanId = "free" | PaidPlanId

type AuthModel = "member" | "invitation" | "organization"
type AuthWhere = Array<{
  connector?: "AND" | "OR"
  field: string
  mode?: "sensitive" | "insensitive"
  operator?:
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "eq"
    | "in"
    | "not_in"
    | "ne"
    | "contains"
    | "starts_with"
    | "ends_with"
  value: string | number | boolean | Array<string> | Array<number> | null
}>

type AuthRecord = Record<string, unknown>

type StripeSubscriptionRecord = {
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: string
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  priceId: string
  quantity?: number
  metadata?: unknown
}

export type BillingEntitlements = {
  planId: BillingPlanId
  organizationLimit: number
  membersPerOrganization: number
  subscription: {
    stripeSubscriptionId: string
    status: string
    currentPeriodEnd: number
    cancelAtPeriodEnd: boolean
  } | null
}

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

const FREE_ENTITLEMENTS: BillingEntitlements = {
  planId: "free",
  organizationLimit: 0,
  membersPerOrganization: 1,
  subscription: null,
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"])

const PLAN_RANK: Record<BillingPlanId, number> = {
  free: 0,
  equipe: 1,
  pro: 2,
  enterprise: 3,
}

export function isPaidPlanId(value: string): value is PaidPlanId {
  return value === "equipe" || value === "pro" || value === "enterprise"
}

export async function getBillingEntitlementsForUser(
  ctx: GenericCtx<DataModel>,
  userId: string
): Promise<BillingEntitlements> {
  const subscriptions = await listUserSubscriptions(ctx, userId)
  const activeSubscriptions = subscriptions.filter((subscription) =>
    ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
  )

  if (activeSubscriptions.length === 0) {
    return FREE_ENTITLEMENTS
  }

  return getHighestRankedEntitlement(
    activeSubscriptions.map(getEntitlementsForSubscription)
  )
}

export async function hasReachedOwnedOrganizationLimit(
  ctx: GenericCtx<DataModel>,
  userId: string
) {
  const [entitlements, ownedCount] = await Promise.all([
    getBillingEntitlementsForUser(ctx, userId),
    countOwnedOrganizations(ctx, userId),
  ])

  return ownedCount >= entitlements.organizationLimit
}

export async function getOrganizationMemberLimit(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const owner = await getOrganizationOwner(ctx, organizationId)
  if (!owner) {
    return FREE_ENTITLEMENTS.membersPerOrganization
  }

  const entitlements = await getBillingEntitlementsForUser(
    ctx,
    getString(owner.userId)
  )

  return entitlements.membersPerOrganization
}

export async function assertOrganizationCanAcceptAnotherMember(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const [limit, memberCount, pendingInvitationCount] = await Promise.all([
    getOrganizationMemberLimit(ctx, organizationId),
    countOrganizationMembers(ctx, organizationId),
    countPendingInvitations(ctx, organizationId),
  ])

  if (memberCount + pendingInvitationCount >= limit) {
    throw new ConvexError(
      "La limite de membres de cette entreprise est atteinte."
    )
  }
}

export async function findAuthMany(
  ctx: GenericCtx<DataModel>,
  model: AuthModel,
  where: AuthWhere,
  limit = 200
) {
  const rows: unknown = await ctx.runQuery(
    components.betterAuth.adapter.findMany,
    {
      model,
      where,
      limit,
      paginationOpts: { cursor: null, numItems: limit },
    }
  )

  return Array.isArray(rows) ? rows.filter(isRecord) : []
}

function getEntitlementsForSubscription(
  subscription: StripeSubscriptionRecord
): BillingEntitlements {
  const metadata = getMetadata(subscription.metadata)
  const planId = resolvePlanId(metadata.plan, subscription.priceId)

  return {
    ...getPlanLimits(planId, metadata),
    subscription: {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
  }
}

function getHighestRankedEntitlement(entitlements: BillingEntitlements[]) {
  let highest = FREE_ENTITLEMENTS

  for (const entitlement of entitlements) {
    if (PLAN_RANK[entitlement.planId] > PLAN_RANK[highest.planId]) {
      highest = entitlement
    }
  }

  return highest
}

function getPlanLimits(
  planId: PaidPlanId,
  metadata: Record<string, string>
): Omit<BillingEntitlements, "subscription"> {
  if (planId === "enterprise") {
    return {
      planId,
      organizationLimit:
        5 + getNonNegativeInteger(metadata.enterpriseExtraOrganizationCount),
      membersPerOrganization:
        20 +
        getNonNegativeInteger(metadata.enterpriseExtraMembersPerOrganization),
    }
  }

  if (planId === "pro") {
    return {
      planId,
      organizationLimit: 3,
      membersPerOrganization: 10,
    }
  }

  return {
    planId,
    organizationLimit: 1,
    membersPerOrganization: 3,
  }
}

async function countOwnedOrganizations(
  ctx: GenericCtx<DataModel>,
  userId: string
) {
  const memberships = await findAuthMany(ctx, "member", [
    { field: "userId", value: userId },
  ])

  return memberships.filter((membership) =>
    roleIncludes(getString(membership.role), "owner")
  ).length
}

async function getOrganizationOwner(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const members = await findAuthMany(ctx, "member", [
    { field: "organizationId", value: organizationId },
  ])

  return members.find((member) => roleIncludes(getString(member.role), "owner"))
}

async function countOrganizationMembers(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const members = await findAuthMany(ctx, "member", [
    { field: "organizationId", value: organizationId },
  ])

  return members.length
}

async function countPendingInvitations(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const invitations = await findAuthMany(ctx, "invitation", [
    { field: "organizationId", value: organizationId },
    { connector: "AND", field: "status", value: "pending" },
  ])

  return invitations.length
}

async function listUserSubscriptions(
  ctx: GenericCtx<DataModel>,
  userId: string
) {
  const rows: unknown = await ctx.runQuery(
    components.stripe.public.listSubscriptionsByUserId,
    { userId }
  )

  return Array.isArray(rows) ? rows.filter(isStripeSubscriptionRecord) : []
}

function resolvePlanId(metadataPlan: string | undefined, priceId: string) {
  if (metadataPlan && isPaidPlanId(metadataPlan)) {
    return metadataPlan
  }

  if (priceId === env.STRIPE_PRO_PRICE_ID) {
    return "pro"
  }

  if (priceId === env.STRIPE_ENTERPRISE_BASE_PRICE_ID) {
    return "enterprise"
  }

  return "equipe"
}

function getMetadata(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  )
}

function getNonNegativeInteger(value: string | undefined) {
  if (!value) {
    return 0
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

function isStripeSubscriptionRecord(
  value: unknown
): value is StripeSubscriptionRecord {
  return (
    isRecord(value) &&
    typeof value.stripeSubscriptionId === "string" &&
    typeof value.stripeCustomerId === "string" &&
    typeof value.status === "string" &&
    typeof value.currentPeriodEnd === "number" &&
    typeof value.cancelAtPeriodEnd === "boolean" &&
    typeof value.priceId === "string"
  )
}

function roleIncludes(role: string, expectedRole: string) {
  return role
    .split(",")
    .map((value) => value.trim())
    .includes(expectedRole)
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function isRecord(value: unknown): value is AuthRecord {
  return typeof value === "object" && value !== null
}

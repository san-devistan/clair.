import type { GenericCtx } from "@convex-dev/better-auth/utils"
import type { DataModel } from "@workspace/backend/dataModel"
import { ConvexError } from "convex/values"

import { components } from "./_generated/api"
import { env } from "./_generated/server"
import {
  PAID_PLAN_IDS,
  type BillingPlanId,
  type PaidPlanId,
} from "./billingPlans"

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

export type OrganizationOwnershipUsage = {
  entitlements: BillingEntitlements
  ownedOrganizationCount: number
  canCreateOrganization: boolean
}

export type OrganizationMemberUsage = {
  memberLimit: number
  memberCount: number
  pendingInvitationCount: number
  usedMemberSlots: number
  canInviteMember: boolean
}

export function getBillingUserId(user: Record<string, unknown>) {
  return getString(user._id) || getString(user.id)
}

export function getAuthModelUserIds(user: Record<string, unknown>) {
  return uniqueStrings([getString(user.id), getString(user._id)])
}

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
  return PAID_PLAN_IDS.some((planId) => planId === value)
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

export async function getOrganizationOwnershipUsage(
  ctx: GenericCtx<DataModel>,
  billingUserId: string,
  memberUserIds: string | string[] = billingUserId
): Promise<OrganizationOwnershipUsage> {
  const [entitlements, ownedCount] = await Promise.all([
    getBillingEntitlementsForUser(ctx, billingUserId),
    countOwnedOrganizations(ctx, memberUserIds),
  ])

  return {
    entitlements,
    ownedOrganizationCount: ownedCount,
    canCreateOrganization: ownedCount < entitlements.organizationLimit,
  }
}

export async function hasReachedOwnedOrganizationLimit(
  ctx: GenericCtx<DataModel>,
  userId: string
) {
  const usage = await getOrganizationOwnershipUsage(ctx, userId)
  return !usage.canCreateOrganization
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

export async function getOrganizationMemberUsage(
  ctx: GenericCtx<DataModel>,
  organizationId: string
): Promise<OrganizationMemberUsage> {
  const [limit, memberCount, pendingInvitationCount] = await Promise.all([
    getOrganizationMemberLimit(ctx, organizationId),
    countOrganizationMembers(ctx, organizationId),
    countPendingInvitations(ctx, organizationId),
  ])
  const usedMemberSlots = memberCount + pendingInvitationCount

  return {
    memberLimit: limit,
    memberCount,
    pendingInvitationCount,
    usedMemberSlots,
    canInviteMember: usedMemberSlots < limit,
  }
}

export async function assertOrganizationCanAcceptAnotherMember(
  ctx: GenericCtx<DataModel>,
  organizationId: string
) {
  const usage = await getOrganizationMemberUsage(ctx, organizationId)

  if (!usage.canInviteMember) {
    throw new ConvexError(
      "La limite de membres de cette entreprise est atteinte."
    )
  }
}

export async function assertOrganizationCanAcceptAnotherMemberForBillingUser(
  ctx: GenericCtx<DataModel>,
  organizationId: string,
  billingUserId: string
) {
  const [entitlements, memberCount, pendingInvitationCount] = await Promise.all(
    [
      getBillingEntitlementsForUser(ctx, billingUserId),
      countOrganizationMembers(ctx, organizationId),
      countPendingInvitations(ctx, organizationId),
    ]
  )

  if (
    memberCount + pendingInvitationCount >=
    entitlements.membersPerOrganization
  ) {
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

export async function countOwnedOrganizations(
  ctx: GenericCtx<DataModel>,
  userIds: string | string[]
) {
  const memberships = await listMembershipsByUserIds(ctx, userIds)
  const organizationIds = uniqueStrings(
    memberships.map((membership) => getString(membership.organizationId))
  )

  return organizationIds.length
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

async function listMembershipsByUserIds(
  ctx: GenericCtx<DataModel>,
  userIds: string | string[]
) {
  const ids = uniqueStrings(Array.isArray(userIds) ? userIds : [userIds])
  const memberships = await Promise.all(
    ids.map((userId) =>
      findAuthMany(ctx, "member", [{ field: "userId", value: userId }])
    )
  )

  return dedupeAuthRecords(memberships.flat())
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function dedupeAuthRecords(records: AuthRecord[]) {
  const seen = new Set<string>()
  return records.filter((record) => {
    const id = getString(record.id) || getString(record._id)
    if (!id) {
      return true
    }
    if (seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

function isRecord(value: unknown): value is AuthRecord {
  return typeof value === "object" && value !== null
}

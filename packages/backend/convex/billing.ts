import { v } from "convex/values"

import { query } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"
import {
  findAuthMany,
  getAuthModelUserIds,
  getBillingUserId,
  getBillingEntitlementsForUser,
  getOrganizationMemberUsage,
  getOrganizationOwnershipUsage,
} from "./billingLib"
import { PLAN_CATALOG } from "./billingPlans"

export const listPlans = query({
  args: {},
  handler: () => PLAN_CATALOG,
})

export const getCurrentEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      return null
    }

    return await getBillingEntitlementsForUser(ctx, getBillingUserId(user))
  },
})

export const getCurrentUsage = query({
  args: { organizationId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      return null
    }

    const billingUserId = getBillingUserId(user)
    const memberUserIds = await getCurrentAuthModelUserIds(ctx, user)
    const ownershipUsage = await getOrganizationOwnershipUsage(
      ctx,
      billingUserId,
      memberUserIds
    )
    const activeOrganization = args.organizationId
      ? await getReadableOrganizationUsage(
          ctx,
          memberUserIds,
          args.organizationId
        )
      : null

    return {
      ...ownershipUsage,
      activeOrganization,
    }
  },
})

async function getReadableOrganizationUsage(
  ctx: Parameters<typeof isOrganizationMember>[0],
  userIds: string[],
  organizationId: string
) {
  const isMember = await isOrganizationMember(ctx, userIds, organizationId)
  if (!isMember) {
    return null
  }

  return {
    organizationId,
    ...(await getOrganizationMemberUsage(ctx, organizationId)),
  }
}

async function isOrganizationMember(
  ctx: Parameters<typeof findAuthMany>[0],
  userIds: string[],
  organizationId: string
) {
  const memberships = await Promise.all(
    userIds.map((userId) =>
      findAuthMany(
        ctx,
        "member",
        [
          { field: "organizationId", value: organizationId },
          { connector: "AND", field: "userId", value: userId },
        ],
        1
      )
    )
  )

  return memberships.some((rows) => rows.length > 0)
}

async function getCurrentAuthModelUserIds(
  ctx: Parameters<typeof authComponent.getAuth>[1],
  user: Record<string, unknown>
) {
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
  const session = await auth.api.getSession({ headers })

  return uniqueStrings([
    ...getAuthModelUserIds(user),
    getStringFromRecord(session?.user, "id"),
  ])
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getStringFromRecord(value: unknown, key: string) {
  if (typeof value !== "object" || value === null) {
    return ""
  }

  const field: unknown = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof field === "string" ? field : ""
}

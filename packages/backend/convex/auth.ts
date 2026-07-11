import { ConvexError, v } from "convex/values"

import { components } from "./_generated/api"
import { mutation, query } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"
import {
  assertOrganizationCanAcceptAnotherMember,
  assertOrganizationCanAcceptAnotherMemberForBillingUser,
  findAuthMany,
  getAuthModelUserIds,
  getBillingUserId,
  getBillingEntitlementsForUser,
  getOrganizationOwnershipUsage,
} from "./billingLib"

const assignableMemberRole = v.union(v.literal("admin"), v.literal("member"))
const onboardingIntent = v.union(
  v.literal("login"),
  v.literal("create-organization")
)
const DEFAULT_ORGANIZATION_NAME = "Mon Entreprise"
const DEFAULT_ORGANIZATION_SLUG = "mon-entreprise"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return (await authComponent.safeGetAuthUser(ctx)) ?? null
  },
})

export const getEmailAuthStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    if (!email) {
      return { exists: false }
    }

    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    })

    return { exists: Boolean(getUserId(user)) }
  },
})

export const getOnboardingStatus = query({
  args: { intent: v.optional(onboardingIntent) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      return { status: "unauthenticated" }
    }

    const memberships = await listUserMemberships(
      ctx,
      getAuthModelUserIds(user)
    )
    const activeOrganizationId = getActiveOrganizationId(memberships)

    if (args.intent !== "create-organization" && activeOrganizationId) {
      return {
        status: "ready",
        activeOrganizationId,
      }
    }

    const entitlements = await getBillingEntitlementsForUser(
      ctx,
      getBillingUserId(user)
    )
    const ownedOrganizationCount = countOwnedMemberships(memberships)
    const canCreateOrganization =
      entitlements.organizationLimit > ownedOrganizationCount

    return {
      status: canCreateOrganization ? "can-create-organization" : "needs-plan",
      activeOrganizationId,
      ownedOrganizationCount,
      organizationLimit: entitlements.organizationLimit,
      planId: entitlements.planId,
    }
  },
})

export const completeAuthOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const acceptedInvitations = await acceptPendingInvitationsForUser(
      ctx,
      auth,
      headers,
      user.email
    )
    const memberships = await listUserMemberships(
      ctx,
      getAuthModelUserIds(user)
    )

    if (memberships.length > 0) {
      return {
        status: "ready",
        acceptedInvitations,
        createdOrganizationId: null,
        activeOrganizationId: getActiveOrganizationId(memberships),
      }
    }

    const entitlements = await getBillingEntitlementsForUser(
      ctx,
      getBillingUserId(user)
    )
    const ownedOrganizationCount = countOwnedMemberships(memberships)

    if (entitlements.organizationLimit <= ownedOrganizationCount) {
      return {
        status: "needs-plan",
        acceptedInvitations,
        createdOrganizationId: null,
        activeOrganizationId: null,
      }
    }

    const organization = await createDefaultOrganization(
      auth,
      headers,
      getBillingUserId(user)
    )

    return {
      status: "ready",
      acceptedInvitations,
      createdOrganizationId: organization.id,
      activeOrganizationId: organization.id,
    }
  },
})

export const createDefaultOrganizationForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
    }

    const memberships = await listUserMemberships(
      ctx,
      getAuthModelUserIds(user)
    )
    const entitlements = await getBillingEntitlementsForUser(
      ctx,
      getBillingUserId(user)
    )
    const ownedOrganizationCount = countOwnedMemberships(memberships)

    if (entitlements.organizationLimit <= ownedOrganizationCount) {
      return {
        status: "needs-plan",
        createdOrganizationId: null,
        activeOrganizationId: getActiveOrganizationId(memberships),
      }
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const organization = await createDefaultOrganization(
      auth,
      headers,
      getBillingUserId(user)
    )

    return { status: "ready", activeOrganizationId: organization.id }
  },
})

export const createOrganizationForCurrentUser = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
    }

    const name = args.name.trim()
    const slug = makeSlug(args.slug)
    if (!name || !slug) {
      throw new ConvexError("Le nom de l'organisation est requis.")
    }

    const usage = await getOrganizationOwnershipUsage(
      ctx,
      getBillingUserId(user),
      getAuthModelUserIds(user)
    )
    if (!usage.canCreateOrganization) {
      throw new ConvexError(
        "La limite d'entreprises de votre plan est atteinte."
      )
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const organization = await auth.api.createOrganization({
      body: { name, slug },
      headers,
    })

    return {
      status: "ready",
      createdOrganizationId: organization.id,
      activeOrganizationId: organization.id,
    }
  },
})

export const addMemberByEmail = mutation({
  args: {
    email: v.string(),
    role: assignableMemberRole,
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
    }

    const email = normalizeEmail(args.email)
    if (!email) {
      throw new ConvexError("Email is required")
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const permission = await auth.api.hasPermission({
      body: {
        organizationId: args.organizationId,
        permissions: { member: ["create"] },
      },
      headers,
    })

    if (!permission.success) {
      throw new ConvexError("Unauthorized")
    }

    await assertOrganizationCanAcceptAnotherMember(ctx, args.organizationId)
    await assertOrganizationCanAcceptAnotherMemberForBillingUser(
      ctx,
      args.organizationId,
      getBillingUserId(user)
    )

    const invitee = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    })

    const userId = getUserId(invitee)

    if (!userId) {
      const invitation = await auth.api.createInvitation({
        body: {
          email,
          role: args.role,
          organizationId: args.organizationId,
          resend: true,
        },
        headers,
      })

      return { status: "invitation-created", invitationId: invitation.id }
    }

    const member = await auth.api.addMember({
      body: {
        userId,
        role: args.role,
        organizationId: args.organizationId,
      },
      headers,
    })

    return { status: "member-added", memberId: member.id }
  },
})

export const { getAuthUser } = authComponent.clientApi()

async function acceptPendingInvitationsForUser(
  ctx: Parameters<typeof listPendingInvitationsByEmail>[0],
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  email: string
) {
  const invitations = await listPendingInvitationsByEmail(ctx, email)
  const invitationIds = invitations
    .map((invitation) => getString(invitation.id))
    .filter(Boolean)

  await Promise.all(
    invitationIds.map((invitationId) =>
      auth.api.acceptInvitation({
        body: { invitationId },
        headers,
      })
    )
  )

  return invitationIds.length
}

async function listPendingInvitationsByEmail(
  ctx: Parameters<typeof findAuthMany>[0],
  email: string
) {
  return await findAuthMany(ctx, "invitation", [
    { field: "email", value: normalizeEmail(email) },
    { connector: "AND", field: "status", value: "pending" },
  ])
}

async function listUserMemberships(
  ctx: Parameters<typeof findAuthMany>[0],
  userIds: string | string[]
) {
  const ids = Array.isArray(userIds) ? userIds : [userIds]
  const memberships = await Promise.all(
    ids.map((userId) =>
      findAuthMany(ctx, "member", [{ field: "userId", value: userId }])
    )
  )

  return memberships.flat()
}

async function createDefaultOrganization(
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  userId: string
) {
  return await createDefaultOrganizationWithSlug(
    auth,
    headers,
    getDefaultOrganizationSlugCandidates(userId),
    null
  )
}

async function createDefaultOrganizationWithSlug(
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  slugs: string[],
  lastCollision: unknown
): ReturnType<ReturnType<typeof createAuth>["api"]["createOrganization"]> {
  const [slug, ...remainingSlugs] = slugs
  if (!slug) {
    throw (
      lastCollision ??
      new ConvexError("Unable to create a unique organization slug")
    )
  }

  try {
    return await auth.api.createOrganization({
      body: {
        name: DEFAULT_ORGANIZATION_NAME,
        slug,
      },
      headers,
    })
  } catch (error) {
    if (!isOrganizationAlreadyExistsError(error)) {
      throw error
    }

    return await createDefaultOrganizationWithSlug(
      auth,
      headers,
      remainingSlugs,
      error
    )
  }
}

function getDefaultOrganizationSlugCandidates(userId: string) {
  const userSlug = makeSlug(userId).slice(0, 24)
  const baseSlug = userSlug
    ? `${DEFAULT_ORGANIZATION_SLUG}-${userSlug}`
    : DEFAULT_ORGANIZATION_SLUG
  return Array.from({ length: 20 }, (_, index) =>
    index === 0 ? baseSlug : `${baseSlug}-${index + 1}`
  )
}

function isOrganizationAlreadyExistsError(error: unknown) {
  return getStringFromRecord(error, "message") === "Organization already exists"
}

function getActiveOrganizationId(memberships: Array<Record<string, unknown>>) {
  return getString(memberships[0]?.organizationId) || null
}

function countOwnedMemberships(memberships: Array<Record<string, unknown>>) {
  return memberships.filter((membership) =>
    roleIncludes(getString(membership.role), "owner")
  ).length
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

function getStringFromRecord(value: unknown, key: string) {
  if (typeof value !== "object" || value === null) {
    return ""
  }

  const field: unknown = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof field === "string" ? field : ""
}

function getUserId(user: unknown) {
  if (typeof user !== "object" || user === null) {
    return ""
  }

  if ("id" in user && typeof user.id === "string") {
    return user.id
  }

  if ("_id" in user && typeof user._id === "string") {
    return user._id
  }

  return ""
}

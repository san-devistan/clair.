import { ConvexError, v } from "convex/values"

import { components } from "./_generated/api"
import { mutation, query } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"
import {
  assertOrganizationCanAcceptAnotherMember,
  findAuthMany,
  getBillingEntitlementsForUser,
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
      where: [{ field: "email", mode: "insensitive", value: email }],
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

    const memberships = await listUserMemberships(ctx, user._id)
    const activeOrganizationId = getActiveOrganizationId(memberships)

    if (args.intent !== "create-organization" && activeOrganizationId) {
      return {
        status: "ready",
        activeOrganizationId,
      }
    }

    const entitlements = await getBillingEntitlementsForUser(ctx, user._id)
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
    const memberships = await listUserMemberships(ctx, user._id)

    if (memberships.length > 0) {
      return {
        status: "ready",
        acceptedInvitations,
        createdOrganizationId: null,
        activeOrganizationId: getActiveOrganizationId(memberships),
      }
    }

    const entitlements = await getBillingEntitlementsForUser(ctx, user._id)
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
      ctx,
      auth,
      headers,
      user._id
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

    const memberships = await listUserMemberships(ctx, user._id)
    const entitlements = await getBillingEntitlementsForUser(ctx, user._id)
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
      ctx,
      auth,
      headers,
      user._id
    )

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

    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", mode: "insensitive", value: email }],
    })

    const userId = getUserId(user)

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
    { field: "email", mode: "insensitive", value: normalizeEmail(email) },
    { connector: "AND", field: "status", value: "pending" },
  ])
}

async function listUserMemberships(
  ctx: Parameters<typeof findAuthMany>[0],
  userId: string
) {
  return await findAuthMany(ctx, "member", [{ field: "userId", value: userId }])
}

async function createDefaultOrganization(
  ctx: Parameters<typeof findAuthMany>[0],
  auth: ReturnType<typeof createAuth>,
  headers: Headers,
  userId: string
) {
  return await auth.api.createOrganization({
    body: {
      name: DEFAULT_ORGANIZATION_NAME,
      slug: await getDefaultOrganizationSlug(ctx, userId),
    },
    headers,
  })
}

async function getDefaultOrganizationSlug(
  ctx: Parameters<typeof findAuthMany>[0],
  userId: string
) {
  const userSlug = makeSlug(userId).slice(0, 24)
  const baseSlug = userSlug
    ? `${DEFAULT_ORGANIZATION_SLUG}-${userSlug}`
    : DEFAULT_ORGANIZATION_SLUG
  const candidateSlugs = Array.from({ length: 10 }, (_, index) =>
    index === 0 ? baseSlug : `${baseSlug}-${index + 1}`
  )

  const availability = await Promise.all(
    candidateSlugs.map(async (slug) => ({
      slug,
      exists:
        (
          await findAuthMany(
            ctx,
            "organization",
            [{ field: "slug", value: slug }],
            1
          )
        ).length > 0,
    }))
  )

  const available = availability.find((candidate) => !candidate.exists)
  if (available) {
    return available.slug
  }

  throw new ConvexError("Unable to create a unique organization slug")
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

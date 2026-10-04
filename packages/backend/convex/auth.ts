import { ConvexError, v } from "convex/values"

import { components } from "./_generated/api"
import { mutation, query } from "./_generated/server"
import {
  acceptPendingInvitationsForUser,
  countOwnedMemberships,
  createDefaultOrganization,
  getActiveOrganizationId,
  getUserId,
  listUserMemberships,
  makeSlug,
  normalizeEmail,
} from "./authOnboarding"
import { authComponent, createAuth } from "./betterAuth/auth"
import {
  assertOrganizationCanAcceptAnotherMember,
  assertOrganizationCanAcceptAnotherMemberForBillingUser,
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

    const user: unknown = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "user",
        where: [{ field: "email", value: email }],
      }
    )

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

    const invitee: unknown = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "user",
        where: [{ field: "email", value: email }],
      }
    )

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

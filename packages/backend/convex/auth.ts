import { ConvexError, v } from "convex/values"

import { components } from "./_generated/api"
import { mutation, query } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"

const assignableMemberRole = v.union(v.literal("admin"), v.literal("member"))

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
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

    return { exists: Boolean(user && typeof user.id === "string") }
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

    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    })

    if (!user || typeof user.id !== "string") {
      throw new ConvexError("No existing user found for this email")
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

    return await auth.api.addMember({
      body: {
        userId: user.id,
        role: args.role,
        organizationId: args.organizationId,
      },
      headers,
    })
  },
})

export const { getAuthUser } = authComponent.clientApi()

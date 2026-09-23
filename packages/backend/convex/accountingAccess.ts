import { ConvexError, v } from "convex/values"

import { internalQuery } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"

export const getCurrentOrganizationAccess = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const canRead = await auth.api.hasPermission({
      body: {
        organizationId: args.organizationId,
        permissions: { member: ["create"] },
      },
      headers,
    })
    if (!canRead.success) {
      throw new ConvexError("Unauthorized")
    }

    const canManage = await auth.api.hasPermission({
      body: {
        organizationId: args.organizationId,
        permissions: { member: ["create"] },
      },
      headers,
    })

    return {
      userId: getAuthUserId(user),
      userName: getString(user.name),
      userEmail: getString(user.email),
      role: "",
      canManageAccountingSource: canManage.success,
    }
  },
})

export const requireCurrentAccountingSourceManager = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      throw new ConvexError("Authentication required")
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
      throw new ConvexError("Seuls les admins peuvent gérer la source.")
    }

    return {
      userId: getAuthUserId(user),
      userName: getString(user.name),
      userEmail: getString(user.email),
      role: "",
    }
  },
})

function getAuthUserId(user: Record<string, unknown>) {
  return getString(user.id) || getString(user._id)
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

import { ConvexError, v } from "convex/values"

import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"

const OAUTH_STATE_LOOKUP_LIMIT = 1
const SOURCE_LOOKUP_LIMIT = 10

export const createOAuthState = internalMutation({
  args: {
    state: v.string(),
    organizationId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    returnPath: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("sageOAuthStates", {
      ...args,
      createdAt: now,
    })

    return { status: "created" }
  },
})

export const consumeOAuthState = internalMutation({
  args: {
    state: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const row = await findOAuthState(ctx, args.state)
    if (!row) {
      throw new ConvexError("Session Sage Active expirée. Réessayez.")
    }

    await ctx.db.delete(row._id)

    if (row.expiresAt < args.now) {
      throw new ConvexError("Session Sage Active expirée. Réessayez.")
    }

    return {
      organizationId: row.organizationId,
      returnPath: row.returnPath,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
    }
  },
})

export const getSageActiveSourceForSync = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const source = await findCurrentSageActiveSource(ctx, args.organizationId)
    if (!source) {
      throw new ConvexError("Aucune source Sage Active connectée.")
    }

    return source
  },
})

export const upsertSourceAfterOAuth = internalMutation({
  args: {
    organizationId: v.string(),
    connectedByUserId: v.string(),
    connectedByUserName: v.string(),
    connectedByUserEmail: v.string(),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.optional(v.string()),
    scopes: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const existing = await findCurrentSageActiveSource(ctx, args.organizationId)
    const sourcePatch = {
      connectedByUserEmail: args.connectedByUserEmail,
      connectedByUserId: args.connectedByUserId,
      connectedByUserName: args.connectedByUserName,
      displayName: "Sage Active",
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      lastSyncError: undefined,
      lastSyncStatus: "never" as const,
      lastSyncStep: undefined,
      provider: "sage_active" as const,
      scopes: args.scopes,
      status: "setup_pending" as const,
      tokenExpiresAt: args.tokenExpiresAt,
      updatedAt: now,
    }

    if (existing) {
      await ctx.db.patch(existing._id, sourcePatch)
      return { sourceId: existing._id }
    }

    const sourceId = await ctx.db.insert("accountingSources", {
      ...sourcePatch,
      createdAt: now,
      organizationId: args.organizationId,
    })

    return { sourceId }
  },
})

export const markSyncing = internalMutation({
  args: {
    organizationId: v.string(),
    sourceId: v.id("accountingSources"),
    step: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.patch(args.sourceId, {
      lastSyncError: undefined,
      lastSyncStatus: "syncing",
      lastSyncStep: args.step,
      status: "syncing",
      updatedAt: now,
    })
    const runId = await ctx.db.insert("accountingSyncRuns", {
      currentStep: args.step,
      organizationId: args.organizationId,
      provider: "sage_active",
      sourceId: args.sourceId,
      startedAt: now,
      status: "syncing",
    })

    return { runId }
  },
})

export const markSyncFailed = internalMutation({
  args: {
    runId: v.id("accountingSyncRuns"),
    sourceId: v.id("accountingSources"),
    step: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.patch(args.sourceId, {
      lastSyncError: args.error,
      lastSyncStatus: "error",
      lastSyncStep: args.step,
      status: "error",
      updatedAt: now,
    })
    await ctx.db.patch(args.runId, {
      currentStep: args.step,
      error: args.error,
      finishedAt: now,
      status: "error",
    })

    return { status: "error" }
  },
})

async function findOAuthState(ctx: MutationCtx, state: string) {
  return (
    (
      await ctx.db
        .query("sageOAuthStates")
        .withIndex("by_state", (q) => q.eq("state", state))
        .take(OAUTH_STATE_LOOKUP_LIMIT)
    )[0] ?? null
  )
}

async function findCurrentSageActiveSource(
  ctx: QueryCtx | MutationCtx,
  organizationId: string
) {
  const sources = await ctx.db
    .query("accountingSources")
    .withIndex("by_organizationId_and_provider", (q) =>
      q.eq("organizationId", organizationId).eq("provider", "sage_active")
    )
    .order("desc")
    .take(SOURCE_LOOKUP_LIMIT)

  return sources.find((source) => source.status !== "deletion_pending") ?? null
}

import { ConvexError, v } from "convex/values"

import { internal } from "./_generated/api"
import { mutation, query, type QueryCtx } from "./_generated/server"
import { sageActiveSetupStatus } from "./sageActiveConfig"

const SOURCE_LIST_LIMIT = 10
type AccountingSourceStatus =
  | "setup_pending"
  | "syncing"
  | "synced"
  | "error"
  | "disconnected"
  | "reauthorization_required"
  | "deletion_pending"

type OrganizationAccess = {
  userId: string
  userName: string
  userEmail: string
  role: string
  canManageAccountingSource: boolean
}

type SanitizedAccountingSource = {
  id: string
  provider: "sage_active" | "manual_fec"
  status: AccountingSourceStatus
  displayName: string
  providerCompanyId: string | null
  providerCompanyName: string | null
  connectedByUserId: string | null
  connectedByUserName: string | null
  connectedByUserEmail: string | null
  lastSyncAt: number | null
  lastSyncStatus: "never" | "syncing" | "success" | "error"
  lastSyncStep: string | null
  lastSyncError: string | null
  updatedAt: number
}

type AccountingSourceQueryResult = {
  source: SanitizedAccountingSource | null
  canManage: boolean
  sageActiveSetup: ReturnType<typeof sageActiveSetupStatus>
}

export const getActive = query({
  args: { organizationId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<AccountingSourceQueryResult | null> => {
    if (!args.organizationId) {
      return null
    }

    const access: OrganizationAccess = await ctx.runQuery(
      internal.accountingAccess.getCurrentOrganizationAccess,
      { organizationId: args.organizationId }
    )
    const source = await getCurrentSource(ctx, args.organizationId)

    return {
      source: source
        ? {
            id: source._id,
            provider: source.provider,
            status: source.status,
            displayName: source.displayName,
            providerCompanyId: source.providerCompanyId ?? null,
            providerCompanyName: source.providerCompanyName ?? null,
            connectedByUserId: source.connectedByUserId ?? null,
            connectedByUserName: source.connectedByUserName ?? null,
            connectedByUserEmail: access.canManageAccountingSource
              ? (source.connectedByUserEmail ?? null)
              : null,
            lastSyncAt: source.lastSyncAt ?? null,
            lastSyncStatus: source.lastSyncStatus,
            lastSyncStep: source.lastSyncStep ?? null,
            lastSyncError: source.lastSyncError ?? null,
            updatedAt: source.updatedAt,
          }
        : null,
      canManage: access.canManageAccountingSource,
      sageActiveSetup: sageActiveSetupStatus(),
    }
  },
})

export const disconnectSageActive = mutation({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const access = await ctx.runQuery(
      internal.accountingAccess.requireCurrentAccountingSourceManager,
      { organizationId: args.organizationId }
    )
    const source = await getCurrentSource(ctx, args.organizationId)

    if (!source) {
      throw new ConvexError("Aucune source Sage Active à déconnecter.")
    }

    const now = Date.now()
    await ctx.db.patch(source._id, {
      connectedByUserId: access.userId,
      connectedByUserName: access.userName,
      connectedByUserEmail: access.userEmail,
      disconnectedAt: now,
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      lastSyncError: undefined,
      status: "disconnected",
      tokenExpiresAt: undefined,
      updatedAt: now,
    })

    return { status: "disconnected" }
  },
})

async function getCurrentSource(ctx: QueryCtx, organizationId: string) {
  const sources = await ctx.db
    .query("accountingSources")
    .withIndex("by_organizationId_and_provider", (q) =>
      q.eq("organizationId", organizationId).eq("provider", "sage_active")
    )
    .order("desc")
    .take(SOURCE_LIST_LIMIT)

  return sources.find((source) => source.status !== "deletion_pending") ?? null
}

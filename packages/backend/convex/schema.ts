import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const accountingSourceProvider = v.union(
  v.literal("sage_active"),
  v.literal("manual_fec")
)

const accountingSourceStatus = v.union(
  v.literal("setup_pending"),
  v.literal("syncing"),
  v.literal("synced"),
  v.literal("error"),
  v.literal("disconnected"),
  v.literal("reauthorization_required"),
  v.literal("deletion_pending")
)

const syncStatus = v.union(
  v.literal("never"),
  v.literal("syncing"),
  v.literal("success"),
  v.literal("error")
)

export default defineSchema({
  accountingSources: defineTable({
    organizationId: v.string(),
    provider: accountingSourceProvider,
    status: accountingSourceStatus,
    displayName: v.string(),
    providerCompanyId: v.optional(v.string()),
    providerCompanyName: v.optional(v.string()),
    connectedByUserId: v.optional(v.string()),
    connectedByUserName: v.optional(v.string()),
    connectedByUserEmail: v.optional(v.string()),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
    lastSyncStatus: syncStatus,
    lastSyncStep: v.optional(v.string()),
    lastSyncError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    disconnectedAt: v.optional(v.number()),
    deletionRequestedAt: v.optional(v.number()),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_and_provider", ["organizationId", "provider"])
    .index("by_status", ["status"]),

  sageOAuthStates: defineTable({
    state: v.string(),
    organizationId: v.string(),
    userId: v.string(),
    userName: v.string(),
    userEmail: v.string(),
    returnPath: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_expiresAt", ["expiresAt"]),

  accountingSyncRuns: defineTable({
    organizationId: v.string(),
    sourceId: v.id("accountingSources"),
    provider: accountingSourceProvider,
    status: syncStatus,
    currentStep: v.string(),
    error: v.optional(v.string()),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_organizationId_and_startedAt", ["organizationId", "startedAt"])
    .index("by_sourceId_and_startedAt", ["sourceId", "startedAt"]),
})

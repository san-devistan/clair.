"use node"

import { ConvexError, v } from "convex/values"
import { createCipheriv, createHash, randomBytes } from "node:crypto"

import { internal } from "./_generated/api"
import { action, internalAction } from "./_generated/server"
import {
  requireSageActiveOAuthCallbackConfig,
  requireSageActiveOAuthStartConfig,
  requireSageActiveSyncConfig,
} from "./sageActiveConfig"

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000
const TOKEN_ENCRYPTION_VERSION = "v1"
const SYNC_STEP_SETUP = "Configuration de la source"

type OAuthTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

type OAuthState = {
  organizationId: string
  returnPath: string
  userId: string
  userName: string
  userEmail: string
}

export const beginConnection = action({
  args: {
    organizationId: v.string(),
    returnPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await ctx.runQuery(
      internal.accountingAccess.requireCurrentAccountingSourceManager,
      { organizationId: args.organizationId }
    )
    const config = requireSageActiveOAuthStartConfig()
    const state = randomToken()
    const returnPath = normalizeReturnPath(args.returnPath ?? "/dashboard")

    await ctx.runMutation(internal.sageActiveStore.createOAuthState, {
      expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
      organizationId: args.organizationId,
      returnPath,
      state,
      userId: access.userId,
      userEmail: access.userEmail,
      userName: access.userName,
    })

    const authorizationUrl = new URL(config.authorizationUrl)
    authorizationUrl.searchParams.set("response_type", "code")
    authorizationUrl.searchParams.set("client_id", config.clientId)
    authorizationUrl.searchParams.set("redirect_uri", config.redirectUri)
    authorizationUrl.searchParams.set("scope", config.scopes)
    authorizationUrl.searchParams.set("state", state)

    return {
      authUrl: authorizationUrl.toString(),
      redirectUri: config.redirectUri,
    }
  },
})

export const completeOAuthCallback = internalAction({
  args: {
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args): Promise<{ redirectPath: string }> => {
    const config = requireSageActiveOAuthCallbackConfig()
    const oauthState: OAuthState = await ctx.runMutation(
      internal.sageActiveStore.consumeOAuthState,
      { now: Date.now(), state: args.state }
    )
    const token = await exchangeCodeForToken({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      code: args.code,
      redirectUri: config.redirectUri,
      tokenUrl: config.tokenUrl,
    })
    const encryptedRefreshToken = token.refresh_token
      ? encryptSecret(token.refresh_token, config.tokenEncryptionKey)
      : undefined

    await ctx.runMutation(internal.sageActiveStore.upsertSourceAfterOAuth, {
      connectedByUserEmail: oauthState.userEmail,
      connectedByUserId: oauthState.userId,
      connectedByUserName: oauthState.userName,
      encryptedAccessToken: encryptSecret(
        token.access_token,
        config.tokenEncryptionKey
      ),
      encryptedRefreshToken,
      organizationId: oauthState.organizationId,
      scopes: token.scope,
      tokenExpiresAt: token.expires_in
        ? Date.now() + token.expires_in * 1000
        : undefined,
    })

    return {
      redirectPath: withSearch(oauthState.returnPath, "sage", "connected"),
    }
  },
})

export const syncNow = action({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    await ctx.runQuery(
      internal.accountingAccess.requireCurrentAccountingSourceManager,
      { organizationId: args.organizationId }
    )
    requireSageActiveSyncConfig()

    const source = await ctx.runQuery(
      internal.sageActiveStore.getSageActiveSourceForSync,
      { organizationId: args.organizationId }
    )

    const { runId } = await ctx.runMutation(
      internal.sageActiveStore.markSyncing,
      {
        organizationId: args.organizationId,
        sourceId: source._id,
        step: SYNC_STEP_SETUP,
      }
    )

    const error =
      source.providerCompanyId && source.encryptedAccessToken
        ? "La connexion Sage Active est prête, mais le mapping des écritures Sage vers le modèle comptable normalisé doit encore être activé."
        : "La connexion Sage Active est reçue. Sélectionnez l'entreprise Sage Active avant de lancer la première synchronisation."

    await ctx.runMutation(internal.sageActiveStore.markSyncFailed, {
      error,
      runId,
      sourceId: source._id,
      step: SYNC_STEP_SETUP,
    })

    throw new ConvexError(error)
  },
})

async function exchangeCodeForToken({
  clientId,
  clientSecret,
  code,
  redirectUri,
  tokenUrl,
}: {
  clientId: string
  clientSecret: string
  code: string
  redirectUri: string
  tokenUrl: string
}): Promise<OAuthTokenResponse> {
  const response = await fetch(tokenUrl, {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  })

  if (!response.ok) {
    throw new ConvexError("Sage Active a refusé l'échange OAuth.")
  }

  const payload: unknown = await response.json()
  if (!isOAuthTokenResponse(payload)) {
    throw new ConvexError("Réponse OAuth Sage Active invalide.")
  }

  return payload
}

function isOAuthTokenResponse(value: unknown): value is OAuthTokenResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.access_token === "string" &&
    (value.refresh_token === undefined ||
      typeof value.refresh_token === "string") &&
    (value.expires_in === undefined || typeof value.expires_in === "number") &&
    (value.scope === undefined || typeof value.scope === "string")
  )
}

function encryptSecret(value: string, keyMaterial: string) {
  const key = encryptionKey(keyMaterial)
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [
    TOKEN_ENCRYPTION_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":")
}

function encryptionKey(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ConvexError("Clé de chiffrement Sage Active manquante.")
  }

  return createHash("sha256").update(trimmed).digest()
}

function randomToken() {
  return randomBytes(32).toString("base64url")
}

function normalizeReturnPath(path: string) {
  return path.startsWith("/") ? path : "/dashboard"
}

function withSearch(path: string, key: string, value: string) {
  const url = new URL(path, "https://clair.local")
  url.searchParams.set(key, value)
  return `${url.pathname}${url.search}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

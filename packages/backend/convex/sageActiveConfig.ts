import { ConvexError } from "convex/values"

import { env } from "./_generated/server"

const DEFAULT_SCOPES = "openid profile email"

type SageActiveConfig = {
  authorizationUrl: string
  tokenUrl: string
  apiUrl: string | null
  clientId: string
  clientSecret: string
  apiKey: string | null
  redirectUri: string
  scopes: string
  tokenEncryptionKey: string
}

const REQUIRED_FOR_OAUTH_START = [
  "SAGE_ACTIVE_AUTHORIZATION_URL",
  "SAGE_ACTIVE_CLIENT_ID",
  "SAGE_ACTIVE_REDIRECT_URI",
] as const

const REQUIRED_FOR_OAUTH_CALLBACK = [
  ...REQUIRED_FOR_OAUTH_START,
  "SAGE_ACTIVE_TOKEN_URL",
  "SAGE_ACTIVE_CLIENT_SECRET",
  "SAGE_ACTIVE_TOKEN_ENCRYPTION_KEY",
] as const

const REQUIRED_FOR_SYNC = [
  ...REQUIRED_FOR_OAUTH_CALLBACK,
  "SAGE_ACTIVE_API_URL",
  "SAGE_ACTIVE_API_KEY",
] as const

export function sageActiveSetupStatus() {
  const missingForOAuth = missingEnv(REQUIRED_FOR_OAUTH_START)
  const missingForSync = missingEnv(REQUIRED_FOR_SYNC)

  return {
    canStartOAuth: missingForOAuth.length === 0,
    canSync: missingForSync.length === 0,
    missingForOAuth,
    missingForSync,
    redirectUri: env.SAGE_ACTIVE_REDIRECT_URI ?? null,
  }
}

export function requireSageActiveOAuthStartConfig() {
  assertConfigured(REQUIRED_FOR_OAUTH_START)

  return {
    authorizationUrl: requireEnv("SAGE_ACTIVE_AUTHORIZATION_URL"),
    clientId: requireEnv("SAGE_ACTIVE_CLIENT_ID"),
    redirectUri: requireEnv("SAGE_ACTIVE_REDIRECT_URI"),
    scopes: env.SAGE_ACTIVE_SCOPES?.trim() || DEFAULT_SCOPES,
  }
}

export function requireSageActiveOAuthCallbackConfig(): SageActiveConfig {
  assertConfigured(REQUIRED_FOR_OAUTH_CALLBACK)

  return {
    ...requireSageActiveOAuthStartConfig(),
    tokenUrl: requireEnv("SAGE_ACTIVE_TOKEN_URL"),
    apiUrl: env.SAGE_ACTIVE_API_URL?.trim() || null,
    clientSecret: requireEnv("SAGE_ACTIVE_CLIENT_SECRET"),
    apiKey: env.SAGE_ACTIVE_API_KEY?.trim() || null,
    tokenEncryptionKey: requireEnv("SAGE_ACTIVE_TOKEN_ENCRYPTION_KEY"),
  }
}

export function requireSageActiveSyncConfig(): SageActiveConfig {
  assertConfigured(REQUIRED_FOR_SYNC)

  const config = requireSageActiveOAuthCallbackConfig()
  return {
    ...config,
    apiUrl: requireEnv("SAGE_ACTIVE_API_URL"),
    apiKey: requireEnv("SAGE_ACTIVE_API_KEY"),
  }
}

function assertConfigured(keys: readonly (keyof typeof env)[]) {
  const missing = missingEnv(keys)
  if (missing.length > 0) {
    throw new ConvexError(
      `Configuration Sage Active incomplète: ${missing.join(", ")}.`
    )
  }
}

function missingEnv(keys: readonly (keyof typeof env)[]) {
  return keys.filter((key) => !env[key]?.trim())
}

function requireEnv(key: keyof typeof env) {
  const value = env[key]?.trim()
  if (!value) {
    throw new ConvexError(`Variable manquante: ${key}.`)
  }

  return value
}

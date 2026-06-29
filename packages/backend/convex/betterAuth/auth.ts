// oxlint-disable import/no-relative-parent-imports -- Convex local component files need generated app files from the parent convex root.
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import type { GenericCtx } from "@convex-dev/better-auth/utils"
import type { DataModel } from "@workspace/backend/dataModel"
import { betterAuth, type BetterAuthOptions } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"
import { organization } from "better-auth/plugins/organization"

import { components } from "../_generated/api"
import { env } from "../_generated/server"
import authConfig from "../auth.config"
import {
  getOrganizationMemberLimit,
  hasReachedOwnedOrganizationLimit,
} from "../billingLib"
import schema from "./schema"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : ""
}

const LOCAL_DEV_TRUSTED_ORIGINS = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://[::1]:*",
]

function getSiteOrigin(siteUrl: string | undefined) {
  return siteUrl ? new URL(siteUrl).origin : undefined
}

function isLocalSiteUrl(siteUrl: string | undefined) {
  if (!siteUrl) {
    return false
  }

  const { hostname } = new URL(siteUrl)

  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  )
}

function getTrustedOrigins(siteUrl: string | undefined) {
  const siteOrigin = getSiteOrigin(siteUrl)
  const siteOrigins = siteOrigin ? [siteOrigin] : []

  return isLocalSiteUrl(siteUrl)
    ? [...siteOrigins, ...LOCAL_DEV_TRUSTED_ORIGINS]
    : siteOrigins
}

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  }
)

const baseOptions = {
  appName: "Clair",
  baseURL: env.SITE_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(env.SITE_URL),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" || !isRecord(ctx.body)) {
        return undefined
      }

      const email = normalizeEmail(ctx.body.email)
      const name = typeof ctx.body.name === "string" ? ctx.body.name.trim() : ""

      if (!email || name) {
        return undefined
      }

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            email,
            name: email,
          },
        },
      }
    }),
  },
} satisfies BetterAuthOptions

function createOrganizationOptions(ctx: GenericCtx<DataModel>) {
  return {
    allowUserToCreateOrganization: true,
    organizationLimit: async (user) =>
      await hasReachedOwnedOrganizationLimit(ctx, user.id),
    creatorRole: "owner",
    membershipLimit: async (_user, org) =>
      await getOrganizationMemberLimit(ctx, org.id),
    invitationExpiresIn: 60 * 60 * 24 * 7,
    cancelPendingInvitationsOnReInvite: true,
    disableOrganizationDeletion: true,
  } satisfies Parameters<typeof organization>[0]
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    ...baseOptions,
    database: authComponent.adapter(ctx),
    plugins: [
      organization(createOrganizationOptions(ctx)),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx))

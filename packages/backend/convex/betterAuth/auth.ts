// oxlint-disable import/no-relative-parent-imports -- Convex local component files need generated app files from the parent convex root.
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import type { GenericCtx } from "@convex-dev/better-auth/utils"
import type { DataModel } from "@workspace/backend/dataModel"
import { betterAuth, type BetterAuthOptions } from "better-auth"
import { organization } from "better-auth/plugins/organization"

import { components } from "../_generated/api"
import { env } from "../_generated/server"
import authConfig from "../auth.config"
import schema from "./schema"

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  }
)

export const options = {
  appName: "Clair",
  baseURL: env.SITE_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.SITE_URL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      membershipLimit: 100,
      invitationExpiresIn: 60 * 60 * 24 * 7,
      cancelPendingInvitationsOnReInvite: true,
      disableOrganizationDeletion: true,
    }),
    convex({ authConfig }),
  ],
} satisfies BetterAuthOptions

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    ...options,
    database: authComponent.adapter(ctx),
  }) satisfies BetterAuthOptions

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx))

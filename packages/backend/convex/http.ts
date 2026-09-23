import { registerRoutes } from "@convex-dev/stripe"
import { httpRouter } from "convex/server"

import { components, internal } from "./_generated/api"
import { env, httpAction } from "./_generated/server"
import { authComponent, createAuth } from "./betterAuth/auth"

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
})
http.route({
  path: "/sage-active/oauth/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url)
    const error = url.searchParams.get("error")
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")

    if (error) {
      return redirectToDashboard("sage", "oauth_error")
    }

    if (!code || !state) {
      return redirectToDashboard("sage", "oauth_missing")
    }

    try {
      const result = await ctx.runAction(
        internal.sageActiveActions.completeOAuthCallback,
        { code, state }
      )
      return redirectToSite(result.redirectPath)
    } catch {
      return redirectToDashboard("sage", "oauth_failed")
    }
  }),
})

function redirectToDashboard(key: string, value: string) {
  return redirectToSite(withSearch("/dashboard", key, value))
}

function redirectToSite(path: string) {
  return Response.redirect(new URL(path, env.SITE_URL), 302)
}

function withSearch(path: string, key: string, value: string) {
  const url = new URL(path, env.SITE_URL)
  url.searchParams.set(key, value)
  return `${url.pathname}${url.search}`
}

export default http

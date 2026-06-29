import stripe from "@convex-dev/stripe/convex.config.js"
import { defineApp } from "convex/server"
import { v } from "convex/values"

import betterAuth from "./betterAuth/convex.config"

const app = defineApp({
  env: {
    BETTER_AUTH_SECRET: v.string(),
    SITE_URL: v.string(),
    STRIPE_SECRET_KEY: v.string(),
    STRIPE_WEBHOOK_SECRET: v.string(),
    STRIPE_EQUIPE_PRICE_ID: v.string(),
    STRIPE_PRO_PRICE_ID: v.string(),
    STRIPE_ENTERPRISE_BASE_PRICE_ID: v.string(),
    STRIPE_ENTERPRISE_EXTRA_ORGANIZATION_PRICE_ID: v.optional(v.string()),
    STRIPE_ENTERPRISE_EXTRA_MEMBER_PRICE_ID: v.optional(v.string()),
  },
})

app.use(betterAuth)
app.use(stripe)

export default app

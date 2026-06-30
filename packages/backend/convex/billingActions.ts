"use node"

import { StripeSubscriptions } from "@convex-dev/stripe"
import { ConvexError, v } from "convex/values"
import Stripe from "stripe"

import { components } from "./_generated/api"
import { action, env } from "./_generated/server"
import { isPaidPlanId } from "./billingLib"

const stripeClient = new StripeSubscriptions(components.stripe, {
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
})

const checkoutPlanId = v.union(
  v.literal("equipe"),
  v.literal("pro"),
  v.literal("enterprise")
)

const enterpriseCheckoutOptions = v.object({
  extraOrganizationCount: v.optional(v.number()),
  extraMembersPerOrganization: v.optional(v.number()),
})

export const createSubscriptionCheckout = action({
  args: {
    planId: checkoutPlanId,
    enterprise: v.optional(enterpriseCheckoutOptions),
    successPath: v.optional(v.string()),
    cancelPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Authentication required")
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    })

    const metadata = buildSubscriptionMetadata(args, identity.subject)
    const stripe = createStripe()
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.customerId,
      client_reference_id: identity.subject,
      line_items: getLineItems(args),
      metadata,
      subscription_data: { metadata },
      success_url: makeSiteUrl(
        args.successPath ?? "/dashboard?billing=success"
      ),
      cancel_url: makeSiteUrl(
        args.cancelPath ?? "/dashboard?billing=cancelled"
      ),
    })

    return {
      sessionId: session.id,
      url: session.url,
    }
  },
})

export const createCustomerPortal = action({
  args: {
    returnPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Authentication required")
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    })

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: makeSiteUrl(args.returnPath ?? "/dashboard"),
    })
  },
})

function getLineItems(args: {
  planId: "equipe" | "pro" | "enterprise"
  enterprise?: {
    extraOrganizationCount?: number
    extraMembersPerOrganization?: number
  }
}) {
  if (args.planId !== "enterprise") {
    return [{ price: requirePriceId(args.planId), quantity: 1 }]
  }

  const extraOrganizationCount = getAddOnQuantity(
    args.enterprise?.extraOrganizationCount
  )
  const extraMembersPerOrganization = getAddOnQuantity(
    args.enterprise?.extraMembersPerOrganization
  )

  return [
    { price: requirePriceId("enterprise"), quantity: 1 },
    ...getAddOnLineItem(
      env.STRIPE_ENTERPRISE_EXTRA_ORGANIZATION_PRICE_ID,
      extraOrganizationCount
    ),
    ...getAddOnLineItem(
      env.STRIPE_ENTERPRISE_EXTRA_MEMBER_PRICE_ID,
      extraMembersPerOrganization
    ),
  ]
}

function buildSubscriptionMetadata(
  args: {
    planId: "equipe" | "pro" | "enterprise"
    enterprise?: {
      extraOrganizationCount?: number
      extraMembersPerOrganization?: number
    }
  },
  userId: string
) {
  if (!isPaidPlanId(args.planId)) {
    throw new ConvexError("Unknown billing plan")
  }

  const extraOrganizationCount =
    args.planId === "enterprise"
      ? getAddOnQuantity(args.enterprise?.extraOrganizationCount)
      : 0
  const extraMembersPerOrganization =
    args.planId === "enterprise"
      ? getAddOnQuantity(args.enterprise?.extraMembersPerOrganization)
      : 0

  return {
    userId,
    plan: args.planId,
    enterpriseExtraOrganizationCount: String(extraOrganizationCount),
    enterpriseExtraMembersPerOrganization: String(extraMembersPerOrganization),
  }
}

function getAddOnLineItem(priceId: string | undefined, quantity: number) {
  if (quantity === 0) {
    return []
  }

  if (!priceId) {
    throw new ConvexError("Stripe add-on price is not configured")
  }

  return [{ price: priceId, quantity }]
}

function getAddOnQuantity(value: number | undefined) {
  if (value === undefined) {
    return 0
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new ConvexError("Add-on quantities must be positive integers")
  }

  return value
}

function requirePriceId(planId: "equipe" | "pro" | "enterprise") {
  const priceId = getPriceId(planId)
  if (!priceId) {
    throw new ConvexError(`Stripe price is not configured for ${planId}`)
  }

  return priceId
}

function getPriceId(planId: "equipe" | "pro" | "enterprise") {
  switch (planId) {
    case "equipe":
      return env.STRIPE_EQUIPE_PRICE_ID
    case "pro":
      return env.STRIPE_PRO_PRICE_ID
    case "enterprise":
      return env.STRIPE_ENTERPRISE_BASE_PRICE_ID
    default:
      throw new ConvexError("Unknown billing plan")
  }
}

function makeSiteUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new ConvexError("Return paths must be relative")
  }

  return new URL(path, env.SITE_URL).toString()
}

function createStripe() {
  return new Stripe(env.STRIPE_SECRET_KEY)
}

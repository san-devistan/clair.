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
const STRIPE_PRODUCT_IMAGE_SOURCE_METADATA_KEY = "clairProductImageSource"
const STRIPE_PRODUCT_IMAGE_URL_METADATA_KEY = "clairProductImageUrl"

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
    const lineItems = getLineItems(args)
    await syncStripeProductImages(stripe, lineItems)

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.customerId,
      client_reference_id: identity.subject,
      line_items: lineItems,
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

export const reactivateCurrentSubscription = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError("Authentication required")
    }

    const subscriptions: unknown = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    )
    const subscription = getReactivatableSubscription(subscriptions)
    if (!subscription) {
      throw new ConvexError("Aucun abonnement à renouveler.")
    }

    await stripeClient.reactivateSubscription(ctx, {
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    })

    return { status: "renewed" }
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

type CheckoutLineItem = ReturnType<typeof getLineItems>[number]

async function syncStripeProductImages(
  stripe: Stripe,
  lineItems: CheckoutLineItem[]
) {
  const sourceUrl = getStripeProductImageSourceUrl()
  if (!sourceUrl) {
    return
  }

  await Promise.all(
    uniqueStrings(lineItems.map((lineItem) => lineItem.price)).map((priceId) =>
      syncStripeProductImage(stripe, priceId, sourceUrl)
    )
  )
}

async function syncStripeProductImage(
  stripe: Stripe,
  priceId: string,
  sourceUrl: string
) {
  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] })
  const product = price.product
  if (typeof product === "string" || product.deleted) {
    return
  }

  const currentImageUrl = getStoredProductImageUrl(product, sourceUrl)
  if (currentImageUrl) {
    if (product.images[0] !== currentImageUrl) {
      await stripe.products.update(product.id, { images: [currentImageUrl] })
    }
    return
  }

  const imageUrl = await uploadStripeProductImage(stripe, sourceUrl)
  await stripe.products.update(product.id, {
    images: [imageUrl],
    metadata: {
      [STRIPE_PRODUCT_IMAGE_SOURCE_METADATA_KEY]: sourceUrl,
      [STRIPE_PRODUCT_IMAGE_URL_METADATA_KEY]: imageUrl,
    },
  })
}

function getStoredProductImageUrl(product: Stripe.Product, sourceUrl: string) {
  if (
    product.metadata[STRIPE_PRODUCT_IMAGE_SOURCE_METADATA_KEY] !== sourceUrl
  ) {
    return ""
  }

  return product.metadata[STRIPE_PRODUCT_IMAGE_URL_METADATA_KEY] ?? ""
}

async function uploadStripeProductImage(stripe: Stripe, sourceUrl: string) {
  const image = await fetchStripeProductImage(sourceUrl)
  const file = await stripe.files.create({
    file: {
      data: image.data,
      name: image.name,
      type: image.contentType,
    },
    purpose: "business_logo",
  })
  const fileLink = await stripe.fileLinks.create({
    file: file.id,
    metadata: {
      [STRIPE_PRODUCT_IMAGE_SOURCE_METADATA_KEY]: sourceUrl,
    },
  })

  if (!fileLink.url) {
    throw new ConvexError("Stripe did not return a public file link URL.")
  }

  return fileLink.url
}

async function fetchStripeProductImage(sourceUrl: string) {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new ConvexError(`Unable to fetch Stripe product image: ${sourceUrl}`)
  }

  const contentType = getImageContentType(response)
  const data = new Uint8Array(await response.arrayBuffer())
  return {
    contentType,
    data,
    name: contentType === "image/jpeg" ? "clair-logo.jpg" : "clair-logo.png",
  }
}

function getImageContentType(response: Response) {
  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ??
    ""
  if (contentType !== "image/png" && contentType !== "image/jpeg") {
    throw new ConvexError("Stripe product image must be PNG or JPEG.")
  }

  return contentType
}

function getStripeProductImageSourceUrl() {
  const configuredUrl = env.STRIPE_PRODUCT_IMAGE_URL?.trim()
  if (configuredUrl) {
    return requireHttpsUrl(configuredUrl, "STRIPE_PRODUCT_IMAGE_URL")
  }

  if (isLocalSiteUrl(env.SITE_URL)) {
    return null
  }

  return requireHttpsUrl(
    new URL("/logo512.png", env.SITE_URL).toString(),
    "SITE_URL"
  )
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

function requireHttpsUrl(url: string, source: string) {
  const parsed = new URL(url)
  if (parsed.protocol !== "https:") {
    throw new ConvexError(`${source} must resolve to an HTTPS URL.`)
  }

  return parsed.toString()
}

function isLocalSiteUrl(siteUrl: string) {
  const { hostname } = new URL(siteUrl)
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  )
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function createStripe() {
  return new Stripe(env.STRIPE_SECRET_KEY)
}

function getReactivatableSubscription(value: unknown) {
  if (!Array.isArray(value)) {
    return null
  }

  return (
    value.find(
      (subscription) =>
        isSubscriptionRecord(subscription) && subscription.cancelAtPeriodEnd
    ) ?? null
  )
}

function isSubscriptionRecord(value: unknown): value is {
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
} {
  return (
    typeof value === "object" &&
    value !== null &&
    getBooleanFromRecord(value, "cancelAtPeriodEnd") !== null &&
    getStringFromRecord(value, "stripeSubscriptionId") !== ""
  )
}

function getBooleanFromRecord(value: object, key: string) {
  const field: unknown = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof field === "boolean" ? field : null
}

function getStringFromRecord(value: object, key: string) {
  const field: unknown = Object.getOwnPropertyDescriptor(value, key)?.value
  return typeof field === "string" ? field : ""
}

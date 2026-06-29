import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start"

function getConvexUrl() {
  const convexUrl = process.env.VITE_CONVEX_URL
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is required for authenticated Convex")
  }

  return convexUrl
}

function getConvexSiteUrl() {
  const explicitSiteUrl = process.env.VITE_CONVEX_SITE_URL
  if (explicitSiteUrl) {
    return explicitSiteUrl
  }

  const convexUrl = getConvexUrl()
  if (convexUrl.endsWith(".convex.cloud")) {
    return convexUrl.replace(/\.convex\.cloud$/, ".convex.site")
  }

  throw new Error("VITE_CONVEX_SITE_URL is required for authenticated Convex")
}

export const { handler } = convexBetterAuthReactStart({
  convexUrl: getConvexUrl(),
  convexSiteUrl: getConvexSiteUrl(),
})

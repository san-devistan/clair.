import { query } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"
import { getBillingEntitlementsForUser, PLAN_CATALOG } from "./billingLib"

export const listPlans = query({
  args: {},
  handler: () => PLAN_CATALOG,
})

export const getCurrentEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx)
    if (!user) {
      return null
    }

    return await getBillingEntitlementsForUser(ctx, user._id)
  },
})

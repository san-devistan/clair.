"use client"

import type { BillingPlan, PlanId } from "@/components/onboarding/plan-card"
import {
  OnboardingSelection,
  type OnboardingDisplayState,
} from "@/components/onboarding/selection"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "@/lib/navigation"
import { Navigate, createFileRoute } from "@tanstack/react-router"
import { api } from "@workspace/backend/api"
import { useAction, useMutation, useQuery } from "convex/react"
import { useCallback, useState } from "react"

type OnboardingIntent = "login" | "create-organization"
type OnboardingSearch = {
  checkout?: "success" | "cancelled"
  intent?: OnboardingIntent
  redirect?: string
}
type OnboardingResult = {
  status: string
  activeOrganizationId?: string | null
}

const EMPTY_PLANS: BillingPlan[] = []
const AUTH_REDIRECT_SEARCH = { redirect: "/onboarding" }
const DASHBOARD_REDIRECTS = [
  "/dashboard",
  "/dashboard/bilan",
  "/dashboard/charges",
  "/dashboard/clients",
  "/dashboard/fournisseurs",
  "/dashboard/insights",
  "/dashboard/revenus",
  "/dashboard/tresorerie",
] as const

type DashboardRedirect = (typeof DASHBOARD_REDIRECTS)[number]

function validateSearch(search: Record<string, unknown>): OnboardingSearch {
  const checkout =
    search.checkout === "success" || search.checkout === "cancelled"
      ? search.checkout
      : undefined
  const intent =
    search.intent === "create-organization" ? "create-organization" : "login"
  const redirect = typeof search.redirect === "string" ? search.redirect : ""

  return {
    checkout,
    intent,
    redirect: redirect.startsWith("/") ? redirect : undefined,
  }
}

function makeReturnPath({
  checkout,
  intent,
  redirectTo,
}: {
  checkout: "success" | "cancelled"
  intent: OnboardingIntent
  redirectTo: string
}) {
  const search = new URLSearchParams({ checkout })
  if (intent === "create-organization") {
    search.set("intent", intent)
  }
  if (redirectTo !== "/dashboard") {
    search.set("redirect", redirectTo)
  }

  return `/onboarding?${search.toString()}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Impossible de continuer."
}

function getCheckoutNotice(checkout: OnboardingSearch["checkout"]) {
  if (checkout === "success") {
    return "Paiement valide. La creation de l'entreprise se finalise des que Stripe confirme l'abonnement."
  }

  if (checkout === "cancelled") {
    return "Paiement annule. Vous pouvez choisir un plan quand vous etes pret."
  }

  return null
}

function getDisplayState({
  checkout,
  finalizing,
  isSessionPending,
  status,
}: {
  checkout: OnboardingSearch["checkout"]
  finalizing: boolean
  isSessionPending: boolean
  status: OnboardingResult | undefined
}): OnboardingDisplayState {
  const loading = isSessionPending || status === undefined
  const canCreateOrganization = status?.status === "can-create-organization"

  return {
    checkoutNotice: getCheckoutNotice(checkout),
    loading,
    showPlans: !loading && !finalizing && !canCreateOrganization,
    showFinalize:
      !loading &&
      !finalizing &&
      (canCreateOrganization || checkout === "success"),
  }
}

function shouldRedirectToAuth({
  isSessionPending,
  session,
  status,
}: {
  isSessionPending: boolean
  session: ReturnType<typeof authClient.useSession>["data"]
  status: OnboardingResult | undefined
}) {
  return !isSessionPending && (!session || status?.status === "unauthenticated")
}

function getReadyRedirectTo(redirectTo: string): DashboardRedirect {
  return DASHBOARD_REDIRECTS.find((path) => path === redirectTo) ?? "/dashboard"
}

export const Route = createFileRoute("/onboarding")({
  validateSearch,
  component: OnboardingPage,
})

function OnboardingPage() {
  const search = Route.useSearch()
  const { replace } = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const redirectTo = search.redirect ?? "/dashboard"
  const intent = search.intent ?? "login"
  const plans = useQuery(api.billing.listPlans)
  const status = useQuery(api.auth.getOnboardingStatus, { intent })
  const createCheckout = useAction(
    api.billingActions.createSubscriptionCheckout
  )
  const createDefaultOrganization = useMutation(
    api.auth.createDefaultOrganizationForCurrentUser
  )
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finishWithOrganization = useCallback(
    async (result: OnboardingResult) => {
      if (result.status !== "ready" || !result.activeOrganizationId) {
        setError("Choisissez un plan pour creer votre entreprise.")
        return
      }

      await authClient.organization.setActive({
        organizationId: result.activeOrganizationId,
      })
      replace(redirectTo)
    },
    [redirectTo, replace]
  )

  const createOrganizationAndRedirect = useCallback(async () => {
    setFinalizing(true)
    setError(null)
    try {
      const result: OnboardingResult = await createDefaultOrganization()
      await finishWithOrganization(result)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setFinalizing(false)
    }
  }, [createDefaultOrganization, finishWithOrganization])

  const startCheckout = useCallback(
    async (planId: PlanId) => {
      setSelectedPlanId(planId)
      setError(null)
      try {
        const result = await createCheckout({
          planId,
          successPath: makeReturnPath({
            checkout: "success",
            intent,
            redirectTo,
          }),
          cancelPath: makeReturnPath({
            checkout: "cancelled",
            intent,
            redirectTo,
          }),
        })

        if (!result.url) {
          throw new Error("Stripe n'a pas retourne d'URL de paiement.")
        }

        window.location.assign(result.url)
      } catch (caughtError) {
        setError(getErrorMessage(caughtError))
        setSelectedPlanId(null)
      }
    },
    [createCheckout, intent, redirectTo]
  )

  const finalizeOrganization = useCallback(() => {
    void createOrganizationAndRedirect()
  }, [createOrganizationAndRedirect])

  const displayState = getDisplayState({
    checkout: search.checkout,
    finalizing,
    isSessionPending,
    status,
  })

  if (shouldRedirectToAuth({ isSessionPending, session, status })) {
    return <Navigate to="/auth" search={AUTH_REDIRECT_SEARCH} replace={true} />
  }

  if (status?.status === "ready") {
    return <Navigate to={getReadyRedirectTo(redirectTo)} replace={true} />
  }

  return (
    <OnboardingSelection
      displayState={displayState}
      error={error}
      finalizing={finalizing}
      plans={plans ?? EMPTY_PLANS}
      selectedPlanId={selectedPlanId}
      onFinalize={finalizeOrganization}
      onSelectPlan={startCheckout}
    />
  )
}

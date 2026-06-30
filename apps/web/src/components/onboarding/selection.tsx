"use client"

import { AuthBackground } from "@/components/auth/auth-background"
import { AuthHeader } from "@/components/auth/auth-header"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Building2, CreditCard, Loader2 } from "lucide-react"

import { PlanCard, type BillingPlan, type PlanId } from "./plan-card"

export type OnboardingDisplayState = {
  checkoutNotice: string | null
  loading: boolean
  showFinalize: boolean
  showPlans: boolean
}

export function OnboardingSelection({
  displayState,
  error,
  finalizing,
  plans,
  selectedPlanId,
  onFinalize,
  onSelectPlan,
}: {
  displayState: OnboardingDisplayState
  error: string | null
  finalizing: boolean
  plans: BillingPlan[]
  selectedPlanId: PlanId | null
  onFinalize: () => void
  onSelectPlan: (planId: PlanId) => Promise<void>
}) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <AuthBackground />
      <AuthHeader />
      <section className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl flex-col justify-center gap-7 px-5 py-8 sm:px-6 lg:py-12">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-4">
            Abonnement
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Choisissez un plan pour creer votre entreprise
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Le plan definit le nombre d'entreprises que vous pouvez posseder et
            le nombre de membres invites dans chacune.
          </p>
        </div>

        {displayState.checkoutNotice ? (
          <Alert>
            <CreditCard className="size-4" />
            <AlertDescription>{displayState.checkoutNotice}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {displayState.loading || finalizing ? (
          <div className="flex min-h-36 items-center gap-3 rounded-lg border bg-card px-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Verification de votre compte...</span>
          </div>
        ) : null}

        {displayState.showPlans ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                disabled={selectedPlanId !== null}
                loading={selectedPlanId === plan.id}
                plan={plan}
                onSelect={onSelectPlan}
              />
            ))}
          </div>
        ) : null}

        {displayState.showFinalize ? (
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              disabled={selectedPlanId !== null}
              onClick={onFinalize}
            >
              <Building2 />
              Finaliser l'entreprise
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

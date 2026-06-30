"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Building2, Check, CreditCard, Loader2 } from "lucide-react"
import { useCallback } from "react"

export type PlanId = "equipe" | "pro" | "enterprise"
export type BillingPlan = {
  amountCents: number | null
  id: PlanId
  includedMembersPerOrganization: number
  includedOrganizations: number
  name: string
}

const PLAN_DETAILS: Record<
  PlanId,
  {
    tone: string
    features: string[]
  }
> = {
  equipe: {
    tone: "Pour demarrer avec une seule entreprise.",
    features: ["1 entreprise", "3 membres inclus", "Administrateur inclus"],
  },
  pro: {
    tone: "Pour gerer plusieurs structures.",
    features: [
      "3 entreprises",
      "10 membres par entreprise",
      "Invitations email",
    ],
  },
  enterprise: {
    tone: "Base modulable pour une equipe plus large.",
    features: [
      "5 entreprises incluses",
      "20 membres par entreprise",
      "Ajouts facturables ensuite",
    ],
  },
}

function formatMonthlyPrice(amountCents: number | null) {
  if (amountCents === null) {
    return "Sur mesure"
  }

  return `${(amountCents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
  })} EUR`
}

export function PlanCard({
  disabled,
  loading,
  plan,
  onSelect,
}: {
  disabled: boolean
  loading: boolean
  plan: BillingPlan
  onSelect: (planId: PlanId) => Promise<void>
}) {
  const details = PLAN_DETAILS[plan.id]
  const selectPlan = useCallback(() => {
    void onSelect(plan.id)
  }, [onSelect, plan.id])

  return (
    <Card className="rounded-lg bg-background/90">
      <CardHeader>
        <div className="mb-1 flex items-center justify-between gap-3">
          <CardTitle>{plan.name}</CardTitle>
          <Building2 className="size-4 text-muted-foreground" />
        </div>
        <div>
          <div className="font-heading text-3xl font-semibold">
            {formatMonthlyPrice(plan.amountCents)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">par mois</div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="min-h-10 text-sm leading-5 text-muted-foreground">
          {details.tone}
        </p>
        <ul className="grid gap-2 text-sm">
          {details.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={disabled}
          onClick={selectPlan}
        >
          {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
          Choisir {plan.name}
        </Button>
      </CardFooter>
    </Card>
  )
}

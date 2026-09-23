"use client"

import type { useOrgSwitcherState } from "@/components/auth/use-org-switcher-state"
import { SignInRequired } from "@/components/fec/dashboard/settings/sign-in-required"
import { api } from "@workspace/backend/api"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { useAction } from "convex/react"
import { ArrowUpRight, ExternalLink, Loader2, RotateCcw } from "lucide-react"
import { useCallback, useState } from "react"

import { BillingStatusInfoRow } from "./billing-status-badge"
import { SettingsPanel } from "./panel"

type BillingEntitlements = {
  planId: "free" | "equipe" | "pro" | "enterprise"
  organizationLimit: number
  membersPerOrganization: number
  subscription: {
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: number
    status: string
    stripeSubscriptionId: string
  } | null
}
type BillingUsage = ReturnType<typeof useOrgSwitcherState>["billingUsage"]
type MemberUsage = ReturnType<
  typeof useOrgSwitcherState
>["activeOrganizationUsage"]
type BillingAction = "portal" | "renew"

const PLAN_LABELS: Record<BillingEntitlements["planId"], string> = {
  free: "Aucun abonnement",
  equipe: "Equipe",
  pro: "Pro",
  enterprise: "Entreprise",
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  past_due: "Paiement en retard",
  paused: "En pause",
  trialing: "Essai",
  unpaid: "Impayé",
}
const PERIOD_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

export function BillingSettingsPanel({
  billingUsage,
  memberUsage,
  organizationCount,
  session,
}: {
  billingUsage: BillingUsage
  memberUsage: MemberUsage
  organizationCount: number
  session: ReturnType<typeof useOrgSwitcherState>["session"]
}) {
  const createCustomerPortal = useAction(
    api.billingActions.createCustomerPortal
  )
  const reactivateSubscription = useAction(
    api.billingActions.reactivateCurrentSubscription
  )
  const [pendingAction, setPendingAction] = useState<BillingAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const billing = billingUsage?.entitlements as
    | BillingEntitlements
    | null
    | undefined
  const display = getBillingDisplay({
    billing,
    billingUsage,
    memberUsage,
    organizationCount,
  })

  const openCustomerPortal = useCallback(async () => {
    setPendingAction("portal")
    setError(null)

    try {
      const result = await createCustomerPortal({ returnPath: "/dashboard" })
      const url = getPortalUrl(result)
      if (!url) {
        throw new Error("Stripe n'a pas retourné d'URL de gestion.")
      }

      window.location.assign(url)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
      setPendingAction(null)
    }
  }, [createCustomerPortal])
  const clickCustomerPortal = useCallback(() => {
    void openCustomerPortal()
  }, [openCustomerPortal])
  const renewSubscription = useCallback(async () => {
    setPendingAction("renew")
    setError(null)

    try {
      await reactivateSubscription({})
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setPendingAction(null)
    }
  }, [reactivateSubscription])
  const clickRenewSubscription = useCallback(() => {
    void renewSubscription()
  }, [renewSubscription])

  if (!session) {
    return (
      <SettingsPanel>
        <SignInRequired />
      </SettingsPanel>
    )
  }

  return (
    <SettingsPanel>
      <BillingError error={error} />
      <BillingInfoRow label="Plan" value={display.plan} />
      <BillingStatusInfoRow
        label="Statut"
        value={display.status}
        status={billing?.subscription?.status}
      />
      <BillingInfoRow label={display.periodLabel} value={display.periodValue} />
      <BillingInfoRow label="Entreprises" value={display.organizationLimit} />
      <BillingInfoRow
        label="Membres par entreprise"
        value={display.membersPerOrganization}
      />
      <BillingActionsSection
        billing={billing}
        pendingAction={pendingAction}
        onOpenPortal={clickCustomerPortal}
        onRenew={clickRenewSubscription}
      />
    </SettingsPanel>
  )
}

function BillingError({ error }: { error: string | null }) {
  if (!error) {
    return null
  }

  return (
    <section className="py-4">
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </section>
  )
}

function BillingActionsSection({
  billing,
  pendingAction,
  onOpenPortal,
  onRenew,
}: {
  billing: BillingEntitlements | null | undefined
  pendingAction: BillingAction | null
  onOpenPortal: () => void
  onRenew: () => void
}) {
  const showRenew = Boolean(billing?.subscription?.cancelAtPeriodEnd)
  const showUpgrade = Boolean(
    billing && billing.planId !== "free" && billing.planId !== "enterprise"
  )
  const disabled = pendingAction !== null

  return (
    <section className="grid gap-3 py-4">
      <p className="text-sm text-muted-foreground">
        Gérez votre abonnement, vos factures, votre moyen de paiement et vos
        changements de plan.
      </p>
      {showRenew ? (
        <Button
          type="button"
          className="w-full"
          disabled={disabled}
          onClick={onRenew}
        >
          {pendingAction === "renew" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RotateCcw />
          )}
          Renouveler l'abonnement
        </Button>
      ) : null}
      {showUpgrade ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={disabled}
          onClick={onOpenPortal}
        >
          {pendingAction === "portal" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ArrowUpRight />
          )}
          Améliorer le plan
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={disabled}
        onClick={onOpenPortal}
      >
        {pendingAction === "portal" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <ExternalLink />
        )}
        Changer ou gérer l'abonnement
      </Button>
    </section>
  )
}

function BillingInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <section className="flex min-h-12 items-center justify-between gap-4 py-3">
      <p className="shrink-0 font-medium">{label}</p>
      <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
        {value}
      </p>
    </section>
  )
}

function getPeriodLabel(
  subscription: BillingEntitlements["subscription"]
): string {
  if (!subscription) {
    return "Période"
  }

  return subscription.cancelAtPeriodEnd ? "Fin prévue" : "Renouvellement"
}

function getPeriodValue(
  subscription: BillingEntitlements["subscription"],
  billing: BillingEntitlements | null | undefined
) {
  if (!billing) {
    return "Chargement"
  }

  if (!subscription) {
    return "Aucun abonnement"
  }

  return formatPeriodDate(subscription.currentPeriodEnd)
}

function formatPeriodDate(timestamp: number) {
  if (timestamp <= 0) {
    return "Non disponible"
  }

  const milliseconds = timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
  return PERIOD_DATE_FORMATTER.format(new Date(milliseconds))
}

function getBillingDisplay({
  billing,
  billingUsage,
  memberUsage,
  organizationCount,
}: {
  billing: BillingEntitlements | null | undefined
  billingUsage: BillingUsage
  memberUsage: MemberUsage
  organizationCount: number
}) {
  const subscription = billing?.subscription ?? null
  return {
    plan: billing ? PLAN_LABELS[billing.planId] : "Chargement",
    status: getStatusLabel(subscription?.status) ?? getFallbackStatus(billing),
    periodLabel: getPeriodLabel(subscription),
    periodValue: getPeriodValue(subscription, billing),
    organizationLimit: getOrganizationUsageValue(billing, organizationCount),
    membersPerOrganization: getMembersPerOrganizationValue(
      billing,
      billingUsage,
      memberUsage,
      organizationCount
    ),
  }
}

function getOrganizationUsageValue(
  billing: BillingEntitlements | null | undefined,
  organizationCount: number
) {
  if (!billing) {
    return "Chargement"
  }

  return formatUsageRatio(
    organizationCount,
    billing.organizationLimit,
    "entreprise"
  )
}

function getMembersPerOrganizationValue(
  billing: BillingEntitlements | null | undefined,
  billingUsage: BillingUsage,
  memberUsage: MemberUsage,
  organizationCount: number
) {
  if (!billing || !billingUsage) {
    return "Chargement"
  }

  if (memberUsage) {
    return formatUsageRatio(
      memberUsage.usedMemberSlots,
      memberUsage.memberLimit,
      "membre"
    )
  }

  if (organizationCount > 0) {
    return "Chargement"
  }

  return formatUsageRatio(0, billing.membersPerOrganization, "membre")
}

function formatUsageRatio(used: number, limit: number, singularUnit: string) {
  const unit = used > 1 ? `${singularUnit}s` : singularUnit
  return `${used}/${limit} ${unit}`
}

function getFallbackStatus(billing: BillingEntitlements | null | undefined) {
  return billing ? "Non abonné" : "Chargement"
}

function getStatusLabel(status: string | undefined) {
  if (!status) {
    return null
  }

  return SUBSCRIPTION_STATUS_LABELS[status] ?? status
}

function getPortalUrl(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  if (typeof value !== "object" || value === null) {
    return ""
  }

  const url: unknown = Object.getOwnPropertyDescriptor(value, "url")?.value
  return typeof url === "string" ? url : ""
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Impossible d'ouvrir la gestion de facturation."
}

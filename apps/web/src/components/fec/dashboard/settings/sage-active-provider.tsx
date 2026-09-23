"use client"

import { hasManageMembersRole } from "@/components/auth/org-switcher.utils"
import type { useOrgSwitcherState } from "@/components/auth/use-org-switcher-state"
import { SageActiveSetupDialog } from "@/components/fec/dashboard/sage-active-setup-dialog"
import { authClient } from "@/lib/auth/client"
import { api } from "@workspace/backend/api"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { useAction, useMutation, useQuery } from "convex/react"
import { Cable, Loader2, RefreshCw, Unplug } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

type SourceStatus =
  | "setup_pending"
  | "syncing"
  | "synced"
  | "error"
  | "disconnected"
  | "reauthorization_required"
  | "deletion_pending"
  | "none"

type SageActiveSource = {
  status: Exclude<SourceStatus, "none">
  providerCompanyName: string | null
  connectedByUserName: string | null
  lastSyncAt: number | null
  lastSyncError: string | null
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
})
const EMPTY_MISSING_ENV: string[] = []

export function SageActiveProviderPanel({
  session,
}: {
  session: ReturnType<typeof useOrgSwitcherState>["session"]
}) {
  if (!session) {
    return null
  }

  return <SageActiveProviderContent session={session} />
}

function SageActiveProviderContent({
  session,
}: {
  session: NonNullable<ReturnType<typeof useOrgSwitcherState>["session"]>
}) {
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const organization = getOrganizationContext(
    activeOrganization,
    session.user.id
  )
  const sourceState = useQuery(
    api.accountingSources.getActive,
    organization.args
  )
  const [setupOpen, setSetupOpen] = useState(false)
  const openSetup = useCallback(() => setSetupOpen(true), [])
  const canManage = sourceState?.canManage ?? organization.localCanManage
  const source = sourceState?.source ?? null
  const missingForOAuth =
    sourceState?.sageActiveSetup.missingForOAuth ?? EMPTY_MISSING_ENV

  return (
    <section className="grid gap-4 py-4">
      <SourceSummary
        source={source}
        canManage={canManage}
        organizationId={organization.id}
        onOpenSetup={openSetup}
      />
      <SetupWarning canManage={canManage} missingForOAuth={missingForOAuth} />
      <SyncError source={source} />
      <SageActiveSetupDialog
        open={setupOpen}
        organizationId={organization.id ?? null}
        onOpenChange={setSetupOpen}
      />
    </section>
  )
}

function getOrganizationContext(
  activeOrganization:
    | { id: string; members: Array<{ userId: string; role: string }> }
    | null
    | undefined,
  userId: string
) {
  const activeMember = activeOrganization?.members.find(
    (member) => member.userId === userId
  )
  const localCanManage = hasManageMembersRole(activeMember?.role)
  const organizationId = activeOrganization?.id

  return {
    args: organizationId && localCanManage ? { organizationId } : {},
    id: organizationId,
    localCanManage,
  }
}

function SourceSummary({
  source,
  canManage,
  organizationId,
  onOpenSetup,
}: {
  source: SageActiveSource | null
  canManage: boolean
  organizationId: string | undefined
  onOpenSetup: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Source connectée
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="font-medium">Sage Active</p>
          <SourceStatusBadge status={source?.status ?? "none"} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {source?.providerCompanyName ??
            "Synchronisation automatique des écritures comptables validées."}
        </p>
        <SourceMetadata source={source} canManage={canManage} />
      </div>
      {canManage ? (
        <SourceActions
          source={source}
          organizationId={organizationId}
          onOpenSetup={onOpenSetup}
        />
      ) : null}
    </div>
  )
}

function SourceActions({
  source,
  organizationId,
  onOpenSetup,
}: {
  source: SageActiveSource | null
  organizationId: string | undefined
  onOpenSetup: () => void
}) {
  const syncNow = useAction(api.sageActiveActions.syncNow)
  const disconnect = useMutation(api.accountingSources.disconnectSageActive)
  const [pendingAction, setPendingAction] = useState<
    "sync" | "disconnect" | null
  >(null)
  const runSync = useCallback(async () => {
    if (!organizationId) return

    setPendingAction("sync")
    try {
      await syncNow({ organizationId })
      toast.success("Synchronisation lancée")
    } catch (error) {
      toast.error("Synchronisation impossible", {
        description: getErrorMessage(error),
      })
    } finally {
      setPendingAction(null)
    }
  }, [organizationId, syncNow])
  const startSync = useCallback(() => void runSync(), [runSync])
  const disconnectSource = useCallback(async () => {
    if (!organizationId) return

    setPendingAction("disconnect")
    try {
      await disconnect({ organizationId })
      toast.success("Sage Active déconnecté")
    } catch (error) {
      toast.error("Déconnexion impossible", {
        description: getErrorMessage(error),
      })
    } finally {
      setPendingAction(null)
    }
  }, [disconnect, organizationId])
  const startDisconnect = useCallback(
    () => void disconnectSource(),
    [disconnectSource]
  )

  if (!source) {
    return (
      <Button type="button" size="sm" onClick={onOpenSetup}>
        <Cable />
        Connecter
      </Button>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={startSync}
        disabled={pendingAction !== null}
        aria-label="Synchroniser Sage Active"
        title="Synchroniser Sage Active"
      >
        {pendingAction === "sync" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <RefreshCw />
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={startDisconnect}
        disabled={pendingAction !== null}
        aria-label="Déconnecter Sage Active"
        title="Déconnecter Sage Active"
      >
        {pendingAction === "disconnect" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Unplug />
        )}
      </Button>
    </div>
  )
}

function SetupWarning({
  canManage,
  missingForOAuth,
}: {
  canManage: boolean
  missingForOAuth: string[]
}) {
  if (!canManage || missingForOAuth.length === 0) {
    return null
  }

  return (
    <Alert>
      <AlertTitle>Configuration Sage Active incomplète</AlertTitle>
      <AlertDescription>
        Variables manquantes : {missingForOAuth.join(", ")}.
      </AlertDescription>
    </Alert>
  )
}

function SyncError({ source }: { source: SageActiveSource | null }) {
  if (!source?.lastSyncError) {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Dernière synchronisation en échec</AlertTitle>
      <AlertDescription>{source.lastSyncError}</AlertDescription>
    </Alert>
  )
}

function SourceStatusBadge({ status }: { status: SourceStatus }) {
  const label = getSourceStatusLabel(status)
  const variant = status === "error" ? "destructive" : "secondary"

  return <Badge variant={variant}>{label}</Badge>
}

function SourceMetadata({
  source,
  canManage,
}: {
  source: SageActiveSource | null
  canManage: boolean
}) {
  if (!source) {
    return null
  }

  const details = [
    source.lastSyncAt
      ? `Dernière synchro ${formatDate(source.lastSyncAt)}`
      : "",
    canManage && source.connectedByUserName
      ? `Connecté par ${source.connectedByUserName}`
      : "",
  ].filter(Boolean)

  if (details.length === 0) {
    return null
  }

  return (
    <p className="mt-1 text-xs text-muted-foreground">{details.join(" · ")}</p>
  )
}

function getSourceStatusLabel(status: SourceStatus): string {
  switch (status) {
    case "setup_pending":
      return "À finaliser"
    case "syncing":
      return "Import en cours"
    case "synced":
      return "Synchronisé"
    case "error":
      return "Erreur"
    case "disconnected":
      return "Déconnecté"
    case "reauthorization_required":
      return "À reconnecter"
    case "deletion_pending":
      return "Suppression"
    case "none":
      return "Non connecté"
  }

  return "Non connecté"
}

function formatDate(timestamp: number) {
  return DATE_TIME_FORMATTER.format(new Date(timestamp))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return cleanConvexErrorMessage(error.message)
  }

  return "Une erreur est survenue."
}

function cleanConvexErrorMessage(message: string) {
  const marker = "Uncaught ConvexError: "
  const markerIndex = message.lastIndexOf(marker)
  const raw =
    markerIndex >= 0 ? message.slice(markerIndex + marker.length) : message
  return raw.split("\n")[0]?.split(" at ")[0]?.trim() || message
}

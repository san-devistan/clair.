"use client"

import { api } from "@workspace/backend/api"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useAction } from "convex/react"
import { CheckCircle2, Circle, Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useState } from "react"

type SetupStepStatus = "done" | "current" | "pending"

const SETUP_STEP_ICONS = {
  done: CheckCircle2,
  current: Loader2,
  pending: Circle,
} satisfies Record<SetupStepStatus, typeof Circle>

const SETUP_STEP_ICON_CLASSES: Record<SetupStepStatus, string> = {
  done: "size-4 text-success-foreground",
  current: "size-4 animate-spin text-primary",
  pending: "size-4 text-muted-foreground",
}

interface SageActiveSetupDialogProps {
  open: boolean
  organizationId: string | null
  onOpenChange: (open: boolean) => void
}

const SETUP_STEPS = [
  "Connexion à Sage Active",
  "Choix de l'entreprise",
  "Récupération des écritures",
  "Validation comptable",
  "Préparation du tableau de bord",
] as const

export function SageActiveSetupDialog({
  open,
  organizationId,
  onOpenChange,
}: SageActiveSetupDialogProps) {
  const beginConnection = useAction(api.sageActiveActions.beginConnection)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const connect = useCallback(async () => {
    if (!organizationId) {
      setError("Sélectionnez une entreprise avant de connecter Sage Active.")
      return
    }

    setError(null)
    setPending(true)
    try {
      const result = await beginConnection({
        organizationId,
        returnPath: "/dashboard",
      })
      window.location.assign(result.authUrl)
    } catch (caughtError) {
      setPending(false)
      setError(getErrorMessage(caughtError))
    }
  }, [beginConnection, organizationId])
  const startConnection = useCallback(() => void connect(), [connect])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connecter Sage Active</DialogTitle>
          <DialogDescription>
            Autorisez Clair à lire les écritures validées de votre organisation
            Sage Active. Les membres verront les indicateurs sans compte Sage.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border bg-muted/25 p-3">
          {SETUP_STEPS.map((step, index) => (
            <SetupStep
              key={step}
              label={step}
              status={getSetupStepStatus(index, pending)}
            />
          ))}
        </div>

        <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success-foreground">
          <div className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <p>
              Les tokens Sage sont chiffrés côté backend et ne sont jamais
              exposés au navigateur.
            </p>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/[0.06] p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button type="button" onClick={startConnection} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            Continuer vers Sage Active
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SetupStep({
  label,
  status,
}: {
  label: string
  status: SetupStepStatus
}) {
  const Icon = SETUP_STEP_ICONS[status]

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={SETUP_STEP_ICON_CLASSES[status]} />
      <span
        className={
          status === "pending" ? "text-muted-foreground" : "text-foreground"
        }
      >
        {label}
      </span>
    </div>
  )
}

function getSetupStepStatus(index: number, pending: boolean): SetupStepStatus {
  if (!pending) return index === 0 ? "current" : "pending"
  if (index === 0) return "done"
  if (index === 1) return "current"
  return "pending"
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return cleanConvexErrorMessage(error.message)
  }

  return "Connexion Sage Active impossible."
}

function cleanConvexErrorMessage(message: string) {
  const marker = "Uncaught ConvexError: "
  const markerIndex = message.lastIndexOf(marker)
  const raw =
    markerIndex >= 0 ? message.slice(markerIndex + marker.length) : message
  return raw.split("\n")[0]?.split(" at ")[0]?.trim() || message
}

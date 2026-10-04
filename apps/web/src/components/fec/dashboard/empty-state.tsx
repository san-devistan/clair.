"use client"

import { hasManageMembersRole } from "@/components/auth/org-switcher.utils"
import Link from "@/components/link"
import { authClient } from "@/lib/auth/client"
import { useFecStore } from "@/lib/fec/store-context"
import { Button } from "@workspace/ui/components/button"
import { ArrowRight, Cable, Loader2, Sparkles, Upload } from "lucide-react"
import { useCallback, useRef, useState, type ChangeEvent } from "react"
import { toast } from "sonner"

import { useDashboardMode } from "./mode"
import { SageActiveSetupDialog } from "./sage-active-setup-dialog"

const START_LINK = <Link href="/auth?redirect=/dashboard" />
const DEMO_LINK = <Link href="/demo" />
const ACCEPTED_FEC_EXTENSIONS = [".txt", ".csv", ".tsv"]

function EmptyStateInner() {
  const { hydrated, importFile, importState } = useFecStore()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const [sageSetupOpen, setSageSetupOpen] = useState(false)
  const canLoadDemo = !isSessionPending && !session
  const activeMember = activeOrganization?.members.find(
    (member) => member.userId === session?.user.id
  )
  const canManageSource = hasManageMembersRole(activeMember?.role)
  const activeOrganizationId = activeOrganization?.id ?? null
  const openSageSetup = useCallback(() => setSageSetupOpen(true), [])
  const copy = getEmptyStateCopy(Boolean(session), canManageSource)

  if (!hydrated) {
    return (
      <div className="flex min-h-screen-section items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (importState.status === "parsing") {
    return (
      <div className="flex min-h-screen-section flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-heading text-lg font-semibold">
            Analyse en cours…
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Calcul des indicateurs et insights
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen-hero w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Cable className="size-8" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        {copy.subtitle}
      </p>

      {session ? (
        <AuthenticatedSourceActions
          activeOrganizationId={activeOrganizationId}
          canManageSource={canManageSource}
          importFile={importFile}
          importState={importState}
          onOpenSageSetup={openSageSetup}
        />
      ) : null}

      {canLoadDemo ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={START_LINK}>
            Commencer
            <ArrowRight />
          </Button>
          <Button size="lg" variant="outline" render={DEMO_LINK}>
            <Sparkles />
            Charger une démo
          </Button>
        </div>
      ) : null}

      <p className="mt-6 max-w-lg text-sm text-muted-foreground">
        Le FEC reste disponible comme solution de secours. Vous pourrez changer
        de source plus tard depuis les réglages.
      </p>

      <SageActiveSetupDialog
        open={sageSetupOpen}
        organizationId={activeOrganizationId}
        onOpenChange={setSageSetupOpen}
      />
    </div>
  )
}

function AuthenticatedSourceActions({
  activeOrganizationId,
  canManageSource,
  importFile,
  importState,
  onOpenSageSetup,
}: {
  activeOrganizationId: string | null
  canManageSource: boolean
  importFile: ReturnType<typeof useFecStore>["importFile"]
  importState: ReturnType<typeof useFecStore>["importState"]
  onOpenSageSetup: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const openFilePicker = useCallback(() => fileInputRef.current?.click(), [])
  const importFecFile = useCallback(
    async (file: File) => {
      try {
        await importFile(file)
        toast.success("Source importée", {
          description: "Le tableau de bord utilise maintenant ce FEC.",
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur lors de l'analyse"
        toast.error("Impossible d'analyser le fichier", {
          description: message,
        })
      }
    },
    [importFile]
  )
  const importSelectedFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.currentTarget.value = ""
      if (file) void importFecFile(file)
    },
    [importFecFile]
  )
  const disabled = importState.status === "parsing" || !canManageSource

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button
        size="lg"
        onClick={onOpenSageSetup}
        disabled={!canManageSource || !activeOrganizationId}
      >
        <Cable />
        Connecter Sage Active
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={openFilePicker}
        disabled={disabled}
      >
        <Upload />
        Importer un FEC
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FEC_EXTENSIONS.join(",")}
        onChange={importSelectedFile}
        className="sr-only"
        disabled={disabled}
        aria-label="Importer un fichier FEC"
      />
    </div>
  )
}

export function DashboardEmptyState() {
  const mode = useDashboardMode()

  if (mode === "demo") return <DemoEmptyState />

  return <EmptyStateInner />
}

function DemoEmptyState() {
  const { importDemo, importState } = useFecStore()
  const loadDemo = useCallback(() => void importDemo(), [importDemo])

  if (importState.status !== "error") {
    return (
      <div className="flex min-h-screen-section flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Préparation de la démo…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen-hero w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Impossible de charger la démo
      </h2>
      <p className="mt-3 text-muted-foreground">{importState.message}</p>
      <Button className="mt-6" onClick={loadDemo}>
        <Sparkles />
        Recharger la démo
      </Button>
    </div>
  )
}

function getEmptyStateCopy(hasSession: boolean, canManageSource: boolean) {
  if (!hasSession) {
    return {
      title: "Analysez vos données comptables",
      subtitle:
        "Connectez-vous pour synchroniser Sage Active, ou chargez une démo pour découvrir le tableau de bord.",
    }
  }

  if (!canManageSource) {
    return {
      title: "Connectez votre comptabilité",
      subtitle:
        "La source comptable doit être connectée par un admin de cette entreprise.",
    }
  }

  return {
    title: "Connectez votre comptabilité",
    subtitle:
      "Synchronisez Sage Active pour alimenter automatiquement vos indicateurs financiers.",
  }
}

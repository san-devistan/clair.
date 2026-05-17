"use client"

import Link from "@/components/link"
import { useFecStore } from "@/lib/fec/store"
import { useRouter, useSearchParams } from "@/lib/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { ArrowRight, FileSpreadsheet, Loader2, Sparkles } from "lucide-react"
import { Suspense, useCallback, useEffect } from "react"

const UPLOAD_LINK = <Link href="/upload" />

function DemoAutoLoader() {
  const { hydrated, importDemo, importState } = useFecStore()
  const { get } = useSearchParams()
  const { replace } = useRouter()

  useEffect(() => {
    if (!hydrated) return
    if (get("demo") === "1" && importState.status === "idle") {
      void (async () => {
        await importDemo()
        replace("/dashboard")
      })()
    }
  }, [hydrated, get, importState.status, importDemo, replace])

  return null
}

function EmptyStateInner() {
  const { hydrated, importDemo, importState } = useFecStore()
  const loadDemo = useCallback(() => void importDemo(), [importDemo])

  if (!hydrated) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (importState.status === "parsing") {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4">
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
    <div className="mx-auto flex min-h-[70svh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileSpreadsheet className="size-8" />
      </div>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Importez votre FEC pour commencer
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Vos données restent dans votre navigateur. Aucun upload serveur, aucun
        compte requis.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" render={UPLOAD_LINK}>
          Importer mon FEC
          <ArrowRight />
        </Button>
        <Button size="lg" variant="outline" onClick={loadDemo}>
          <Sparkles />
          Charger une démo
        </Button>
      </div>

      <Card className="mt-12 w-full p-6 text-left">
        <p className="text-sm font-medium">Comment exporter mon FEC ?</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Le Fichier des Écritures Comptables est un export normalisé fourni par
          votre logiciel de comptabilité (Pennylane, Sage, EBP, Cegid…) ou par
          votre expert-comptable.
        </p>
      </Card>
    </div>
  )
}

export function DashboardEmptyState() {
  return (
    <>
      <Suspense fallback={null}>
        <DemoAutoLoader />
      </Suspense>
      <EmptyStateInner />
    </>
  )
}

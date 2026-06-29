"use client"

import type { useOrgSwitcherState } from "@/components/auth/use-org-switcher-state"
import { FormattedNumber } from "@/components/fec/numbers/formatted"
import { monthEndDate, monthStartDate } from "@/lib/fec/date-ranges"
import { formatShortDate } from "@/lib/fec/format"
import type { useFecStore } from "@/lib/fec/store"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { CloudUpload, Loader2, Trash2 } from "lucide-react"
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import { toast } from "sonner"

import { SettingsPanel } from "./panel"
import { SignInRequired } from "./sign-in-required"

const ACCEPTED_EXTENSIONS = [".txt", ".csv", ".tsv"]

export function DataProviderPanel({
  availableRange,
  importFile,
  importState,
  reset,
  session,
  source,
}: {
  availableRange: ReturnType<typeof useFecStore>["availableRange"]
  importFile: ReturnType<typeof useFecStore>["importFile"]
  importState: ReturnType<typeof useFecStore>["importState"]
  reset: ReturnType<typeof useFecStore>["reset"]
  session: ReturnType<typeof useOrgSwitcherState>["session"]
  source: ReturnType<typeof useFecStore>["source"]
}) {
  const hasActiveSource = Boolean(source && availableRange)

  return (
    <SettingsPanel>
      <CurrentDataSource
        source={source}
        availableRange={availableRange}
        onRemoveSource={reset}
      />
      {session && !hasActiveSource ? (
        <FecImportDropzone importFile={importFile} importState={importState} />
      ) : null}
      {!session ? <SignInRequired /> : null}
    </SettingsPanel>
  )
}

function CurrentDataSource({
  availableRange,
  onRemoveSource,
  source,
}: {
  availableRange: ReturnType<typeof useFecStore>["availableRange"]
  onRemoveSource: () => void
  source: ReturnType<typeof useFecStore>["source"]
}) {
  if (!source || !availableRange) {
    return null
  }

  const { meta } = source.parseResult

  return (
    <section className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Source active
          </p>
          <p className="mt-1 truncate font-medium">{meta.fileName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatShortDate(monthStartDate(availableRange.startMonth))} →{" "}
            {formatShortDate(monthEndDate(availableRange.endMonth))}
          </p>
          <p className="text-sm text-muted-foreground">
            <FormattedNumber value={meta.rowCount} /> écritures disponibles
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onClick={onRemoveSource}
          aria-label="Supprimer le FEC"
          title="Supprimer le FEC"
        >
          <Trash2 />
        </Button>
      </div>
    </section>
  )
}

function FecImportDropzone({
  importFile,
  importState,
}: {
  importFile: ReturnType<typeof useFecStore>["importFile"]
  importState: ReturnType<typeof useFecStore>["importState"]
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isProcessing = importState.status === "parsing"

  const handleFile = useCallback(
    async (file: File) => {
      setSelectedFile(file)
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
        setSelectedFile(null)
      }
    },
    [importFile]
  )

  const dropFile = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const importSelectedFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.currentTarget.value = ""
      if (file) void handleFile(file)
    },
    [handleFile]
  )

  const openFilePicker = useCallback(() => inputRef.current?.click(), [])
  const markDragging = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])
  const clearDragging = useCallback(() => setIsDragging(false), [])

  return (
    <section className="grid gap-3 py-4">
      <button
        type="button"
        disabled={isProcessing}
        onClick={openFilePicker}
        onDragOver={markDragging}
        onDragLeave={clearDragging}
        onDrop={dropFile}
        className={cn(
          "flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/25 px-4 py-6 text-center transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-70",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        {isProcessing ? (
          <Loader2 className="size-6 animate-spin text-primary" />
        ) : (
          <CloudUpload className="size-6 text-primary" />
        )}
        <div>
          <p className="font-medium">
            {isProcessing
              ? `Analyse de ${selectedFile?.name ?? "votre FEC"}...`
              : "Importer le FEC"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ACCEPTED_EXTENSIONS.join(", ")}
          </p>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={importSelectedFile}
        className="sr-only"
        disabled={isProcessing}
        aria-label="Importer un fichier FEC"
      />
    </section>
  )
}

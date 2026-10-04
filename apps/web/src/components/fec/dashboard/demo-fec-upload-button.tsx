"use client"

import { useFecStore } from "@/lib/fec/store-context"
import { Button } from "@workspace/ui/components/button"
import { Loader2, Upload } from "lucide-react"
import { useCallback, useRef, type ChangeEvent } from "react"
import { toast } from "sonner"

const ACCEPTED_FEC_EXTENSIONS = ".txt,.csv,.tsv"

export function DemoFecUploadButton() {
  const { importFile, importState } = useFecStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const isParsing = importState.status === "parsing"
  const openFilePicker = useCallback(() => inputRef.current?.click(), [])
  const importSelectedFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.currentTarget.value = ""
      if (!file) return

      try {
        await importFile(file)
        toast.success("Votre FEC est chargé", {
          description: "La démo utilise maintenant vos données.",
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
  const changeFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => void importSelectedFile(event),
    [importSelectedFile]
  )

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={openFilePicker}
        disabled={isParsing}
        className="shrink-0"
      >
        {isParsing ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Upload data-icon="inline-start" />
        )}
        <span className="hidden sm:inline">Tester avec votre FEC</span>
        <span className="sm:hidden">Votre FEC</span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FEC_EXTENSIONS}
        onChange={changeFile}
        className="sr-only"
        disabled={isParsing}
        aria-label="Importer votre fichier FEC"
      />
    </>
  )
}

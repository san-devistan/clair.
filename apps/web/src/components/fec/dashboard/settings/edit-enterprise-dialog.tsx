"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Save } from "lucide-react"
import { useCallback, type ChangeEvent, type FormEvent } from "react"

export function EditEnterpriseDialog({
  error,
  open,
  orgName,
  pending,
  onClose,
  onNameChange,
  onOpenChange,
  onSubmit,
}: {
  error: string | null
  open: boolean
  orgName: string
  pending: boolean
  onClose: () => void
  onNameChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'entreprise</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <FieldGroup>
            <EnterpriseNameField value={orgName} onChange={onNameChange} />
            <FieldError>{error}</FieldError>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              <Save />
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EnterpriseNameField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const changeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return (
    <Field>
      <FieldLabel htmlFor="enterprise-name">Nom</FieldLabel>
      <Input
        id="enterprise-name"
        value={value}
        onChange={changeName}
        placeholder="Entreprise Dupont"
        autoComplete="organization"
      />
    </Field>
  )
}

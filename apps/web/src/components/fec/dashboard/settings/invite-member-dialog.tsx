"use client"

import type {
  MemberRole,
  OrgSwitcherHandlers,
} from "@/components/auth/org-switcher.types"
import { parseMemberRole } from "@/components/auth/org-switcher.utils"
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
import { UserPlus } from "lucide-react"
import { useCallback, type ChangeEvent } from "react"

export function InviteMemberDialog({
  error,
  memberEmail,
  memberRole,
  open,
  pending,
  onClose,
  onEmailChange,
  onOpenChange,
  onRoleChange,
  onSubmit,
}: {
  error: string | null
  memberEmail: string
  memberRole: MemberRole
  open: boolean
  pending: boolean
  onClose: () => void
  onEmailChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onRoleChange: (role: MemberRole) => void
  onSubmit: OrgSwitcherHandlers["submitAddMember"]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un accès</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <FieldGroup>
            <MemberEmailField value={memberEmail} onChange={onEmailChange} />
            <MemberRoleField value={memberRole} onChange={onRoleChange} />
            <FieldError>{error}</FieldError>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              <UserPlus />
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MemberEmailField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const changeEmail = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value)
    },
    [onChange]
  )

  return (
    <Field>
      <FieldLabel htmlFor="member-email">Email</FieldLabel>
      <Input
        id="member-email"
        type="email"
        value={value}
        onChange={changeEmail}
        placeholder="email@entreprise.fr"
        autoComplete="email"
      />
    </Field>
  )
}

function MemberRoleField({
  value,
  onChange,
}: {
  value: MemberRole
  onChange: (role: MemberRole) => void
}) {
  const changeRole = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(parseMemberRole(event.target.value))
    },
    [onChange]
  )

  return (
    <Field>
      <FieldLabel htmlFor="member-role">Rôle</FieldLabel>
      <select
        id="member-role"
        value={value}
        onChange={changeRole}
        className="h-8 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="member">Membre</option>
        <option value="admin">Admin</option>
      </select>
    </Field>
  )
}

"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@workspace/ui/lib/utils"
import { Plus, UserMinus } from "lucide-react"
import { useCallback, type ChangeEvent, type FormEvent } from "react"

import type {
  ActiveOrganization,
  MemberRole,
  OrganizationMember,
} from "./org-switcher.types"
import {
  EMPTY_MEMBERS,
  parseMemberRole,
  ROLE_LABELS,
} from "./org-switcher.utils"

export function MembersDialog({
  activeOrganization,
  canManageMembers,
  currentUserId,
  error,
  memberEmail,
  memberRole,
  open,
  pendingAction,
  onEmailChange,
  onOpenChange,
  onRemoveMember,
  onRoleChange,
  onSubmit,
}: {
  activeOrganization: ActiveOrganization | null
  canManageMembers: boolean
  currentUserId: string
  error: string | null
  memberEmail: string
  memberRole: MemberRole
  open: boolean
  pendingAction: string | null
  onEmailChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onRemoveMember: (memberId: string) => void
  onRoleChange: (role: MemberRole) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const members = activeOrganization?.members ?? EMPTY_MEMBERS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Membres</DialogTitle>
          <DialogDescription>
            {activeOrganization?.name ?? "Organisation active"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <MemberList
            canManageMembers={canManageMembers}
            currentUserId={currentUserId}
            members={members}
            pendingAction={pendingAction}
            onRemoveMember={onRemoveMember}
          />
          <AddMemberForm
            canManageMembers={canManageMembers}
            error={error}
            memberEmail={memberEmail}
            memberRole={memberRole}
            pending={pendingAction === "add-member"}
            onEmailChange={onEmailChange}
            onRoleChange={onRoleChange}
            onSubmit={onSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MemberList({
  canManageMembers,
  currentUserId,
  members,
  pendingAction,
  onRemoveMember,
}: {
  canManageMembers: boolean
  currentUserId: string
  members: OrganizationMember[]
  pendingAction: string | null
  onRemoveMember: (memberId: string) => void
}) {
  return (
    <div className="grid gap-2">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          canRemove={canManageMembers && member.userId !== currentUserId}
          member={member}
          pending={pendingAction === member.id}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  )
}

function MemberRow({
  canRemove,
  member,
  pending,
  onRemoveMember,
}: {
  canRemove: boolean
  member: OrganizationMember
  pending: boolean
  onRemoveMember: (memberId: string) => void
}) {
  const remove = useCallback(() => {
    onRemoveMember(member.id)
  }, [member.id, onRemoveMember])

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
      <MemberIdentity member={member} />
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">
          {ROLE_LABELS[member.role] ?? member.role}
        </Badge>
        <RemoveMemberButton
          canRemove={canRemove}
          pending={pending}
          onClick={remove}
        />
      </div>
    </div>
  )
}

function MemberIdentity({ member }: { member: OrganizationMember }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{member.user.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {member.user.email}
      </p>
    </div>
  )
}

function RemoveMemberButton({
  canRemove,
  pending,
  onClick,
}: {
  canRemove: boolean
  pending: boolean
  onClick: () => void
}) {
  if (!canRemove) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "text-muted-foreground hover:text-destructive",
        pending && "opacity-50"
      )}
      disabled={pending}
      onClick={onClick}
    >
      <UserMinus />
      <span className="sr-only">Retirer</span>
    </Button>
  )
}

function AddMemberForm({
  canManageMembers,
  error,
  memberEmail,
  memberRole,
  pending,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: {
  canManageMembers: boolean
  error: string | null
  memberEmail: string
  memberRole: MemberRole
  pending: boolean
  onEmailChange: (value: string) => void
  onRoleChange: (role: MemberRole) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  if (!canManageMembers) {
    return null
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <FieldGroup className="gap-3">
        <MemberEmailField value={memberEmail} onChange={onEmailChange} />
        <MemberRoleField value={memberRole} onChange={onRoleChange} />
        <FieldError>{error}</FieldError>
      </FieldGroup>
      <Button type="submit" disabled={pending}>
        <Plus />
        Ajouter
      </Button>
    </form>
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
      <FieldLabel htmlFor="member-email">Ajouter par email</FieldLabel>
      <Input
        id="member-email"
        type="email"
        value={value}
        onChange={changeEmail}
        placeholder="manager@entreprise.fr"
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
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
    </Field>
  )
}

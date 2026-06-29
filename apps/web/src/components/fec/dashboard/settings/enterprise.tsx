import type {
  ActiveOrganization,
  OrganizationMember,
  OrgSwitcherHandlers,
  OrgSwitcherState,
} from "@/components/auth/org-switcher.types"
import {
  EMPTY_MEMBERS,
  ROLE_LABELS,
} from "@/components/auth/org-switcher.utils"
import type { useOrgSwitcherState } from "@/components/auth/use-org-switcher-state"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Pencil, UserMinus, UserPlus } from "lucide-react"
import { useCallback } from "react"

import { SettingsPanel } from "./panel"
import { SignInRequired } from "./sign-in-required"

export function EnterpriseAccessPanel({
  activeOrganization,
  canManageMembers,
  currentUserId,
  handlers,
  session,
  state,
}: {
  activeOrganization: ActiveOrganization | null
  canManageMembers: boolean
  currentUserId: string | undefined
  handlers: OrgSwitcherHandlers
  session: ReturnType<typeof useOrgSwitcherState>["session"]
  state: OrgSwitcherState
}) {
  if (!session) {
    return (
      <SettingsPanel>
        <SignInRequired />
      </SettingsPanel>
    )
  }

  return (
    <SettingsPanel>
      <EnterpriseNameSection
        activeOrganization={activeOrganization}
        canManageMembers={canManageMembers}
        onOpenEditOrganization={handlers.openEditDialog}
      />
      <MemberAccessList
        canAddMember={Boolean(activeOrganization && canManageMembers)}
        canManageMembers={canManageMembers}
        currentUserId={currentUserId}
        members={activeOrganization?.members ?? EMPTY_MEMBERS}
        pendingAction={state.pendingAction}
        onOpenAddMember={handlers.openMembersDialog}
        onRemoveMember={handlers.removeMember}
      />
    </SettingsPanel>
  )
}

function EnterpriseNameSection({
  activeOrganization,
  canManageMembers,
  onOpenEditOrganization,
}: {
  activeOrganization: ActiveOrganization | null
  canManageMembers: boolean
  onOpenEditOrganization: () => void
}) {
  return (
    <section className="flex min-h-12 items-center justify-between gap-4 py-3">
      <p className="shrink-0 font-medium">Nom</p>
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
          {activeOrganization?.name ?? "Aucune entreprise sélectionnée"}
        </p>
        {activeOrganization && canManageMembers ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onOpenEditOrganization}
            aria-label="Modifier le nom de l'entreprise"
            title="Modifier le nom de l'entreprise"
          >
            <Pencil />
          </Button>
        ) : null}
      </div>
    </section>
  )
}

function MemberAccessList({
  canAddMember,
  canManageMembers,
  currentUserId,
  members,
  pendingAction,
  onOpenAddMember,
  onRemoveMember,
}: {
  canAddMember: boolean
  canManageMembers: boolean
  currentUserId: string | undefined
  members: OrganizationMember[]
  pendingAction: string | null
  onOpenAddMember: () => void
  onRemoveMember: (memberId: string) => void
}) {
  if (members.length === 0) {
    return (
      <section className="grid gap-2 py-4">
        <AccessListTitle
          canAddMember={canAddMember}
          count={0}
          onOpenAddMember={onOpenAddMember}
        />
        <div className="py-3 text-sm text-muted-foreground">
          Aucun profil n'a accès à cette entreprise.
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-2 py-4">
      <AccessListTitle
        canAddMember={canAddMember}
        count={members.length}
        onOpenAddMember={onOpenAddMember}
      />
      <div className="divide-y">
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
    </section>
  )
}

function AccessListTitle({
  canAddMember,
  count,
  onOpenAddMember,
}: {
  canAddMember: boolean
  count: number
  onOpenAddMember: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <p className="text-base font-semibold">Liste de membres</p>
        <span className="text-xs text-muted-foreground">
          {count} {count > 1 ? "membres" : "membre"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canAddMember ? (
          <Button type="button" size="sm" onClick={onOpenAddMember}>
            <UserPlus />
            Inviter
          </Button>
        ) : null}
      </div>
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
    <div className="flex items-center justify-between gap-3 py-2.5">
      <MemberIdentity member={member} />
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">{formatRole(member.role)}</Badge>
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
  const email = member.user.email?.trim() ?? ""
  const name = member.user.name?.trim() ?? ""
  const displayName = name || email || "Profil"
  const showEmail =
    Boolean(email) &&
    Boolean(name) &&
    name.toLowerCase() !== email.toLowerCase()

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{displayName}</p>
      {showEmail ? (
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      ) : null}
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

function formatRole(role: string) {
  if (role.includes("admin") || role.includes("owner")) {
    return "Admin"
  }

  return ROLE_LABELS[role] === "Member" ? "Membre" : (ROLE_LABELS[role] ?? role)
}

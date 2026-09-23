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
  canInviteMember,
  canManageMembers,
  currentUserId,
  handlers,
  memberUsage,
  session,
  state,
}: {
  activeOrganization: ActiveOrganization | null
  canInviteMember: boolean
  canManageMembers: boolean
  currentUserId: string | undefined
  handlers: OrgSwitcherHandlers
  memberUsage: MemberUsage
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
        canAddMember={Boolean(
          activeOrganization && canManageMembers && canInviteMember
        )}
        canShowInvite={Boolean(activeOrganization && canManageMembers)}
        canManageMembers={canManageMembers}
        currentUserId={currentUserId}
        memberUsage={memberUsage}
        members={activeOrganization?.members ?? EMPTY_MEMBERS}
        pendingAction={state.pendingAction}
        onOpenAddMember={handlers.openMembersDialog}
        onRemoveMember={handlers.removeMember}
      />
    </SettingsPanel>
  )
}

export type MemberUsage =
  | {
      canInviteMember: boolean
      memberLimit: number
      pendingInvitationCount: number
      usedMemberSlots: number
    }
  | null
  | undefined
type RoleBadgeTone = "admin" | "custom" | "member"

const ROLE_BADGE_STYLES: Record<RoleBadgeTone, string> = {
  admin: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  custom: "border-border bg-muted/50 text-muted-foreground",
  member:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
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
  canShowInvite,
  canManageMembers,
  currentUserId,
  memberUsage,
  members,
  pendingAction,
  onOpenAddMember,
  onRemoveMember,
}: {
  canAddMember: boolean
  canShowInvite: boolean
  canManageMembers: boolean
  currentUserId: string | undefined
  memberUsage: MemberUsage
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
          canShowInvite={canShowInvite}
          count={0}
          memberUsage={memberUsage}
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
        canShowInvite={canShowInvite}
        count={members.length}
        memberUsage={memberUsage}
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
  canShowInvite,
  count,
  memberUsage,
  onOpenAddMember,
}: {
  canAddMember: boolean
  canShowInvite: boolean
  count: number
  memberUsage: MemberUsage
  onOpenAddMember: () => void
}) {
  const limitReached = canShowInvite && memberUsage?.canInviteMember === false

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="text-base font-semibold">Liste de membres</p>
          <span className="text-xs text-muted-foreground">
            {formatMemberUsage(count, memberUsage)}
          </span>
        </div>
        {limitReached ? (
          <p className="text-xs text-muted-foreground">
            Limite du plan atteinte.
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canShowInvite ? (
          <Button
            type="button"
            size="sm"
            disabled={!canAddMember}
            title={
              canAddMember ? "Inviter un membre" : "Limite du plan atteinte"
            }
            onClick={onOpenAddMember}
          >
            <UserPlus />
            Inviter
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function formatMemberUsage(count: number, usage: MemberUsage) {
  if (!usage) {
    return `${count} ${count > 1 ? "membres" : "membre"}`
  }

  return `${usage.usedMemberSlots}/${usage.memberLimit} places`
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
        <MemberRoleBadge role={member.role} />
        <RemoveMemberButton
          canRemove={canRemove}
          pending={pending}
          onClick={remove}
        />
      </div>
    </div>
  )
}

function MemberRoleBadge({ role }: { role: string }) {
  const label = formatRole(role)
  const tone = getRoleBadgeTone(role, label)

  return (
    <Badge
      variant="outline"
      className={cn("max-w-32 justify-start px-2.5", ROLE_BADGE_STYLES[tone])}
    >
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
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

function getRoleBadgeTone(role: string, label: string): RoleBadgeTone {
  if (role.includes("admin") || role.includes("owner")) {
    return "admin"
  }

  if (label === "Membre") {
    return "member"
  }

  return "custom"
}

function formatRole(role: string) {
  if (role.includes("admin") || role.includes("owner")) {
    return "Admin"
  }

  return ROLE_LABELS[role] === "Member" ? "Membre" : (ROLE_LABELS[role] ?? role)
}

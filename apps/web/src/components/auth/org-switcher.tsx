"use client"

import { CreateOrganizationDialog } from "./create-organization-dialog"
import { MembersDialog } from "./members-dialog"
import { OrganizationMenu } from "./organization-menu"
import { useOrgSwitcherState } from "./use-org-switcher-state"

export function OrgSwitcher() {
  const {
    activeOrganization,
    canManageMembers,
    handlers,
    isOrgListPending,
    organizations,
    session,
    state,
  } = useOrgSwitcherState()

  if (!session) {
    return null
  }

  return (
    <>
      <OrganizationMenu
        activeOrganization={activeOrganization}
        organizations={organizations}
        isOrgListPending={isOrgListPending}
        onOpenCreate={handlers.openCreateDialog}
        onOpenMembers={handlers.openMembersDialog}
        onSelectOrganization={handlers.selectOrganization}
        onSignOut={handlers.signOut}
      />
      <CreateOrganizationDialog
        error={state.error}
        open={state.createOpen}
        orgName={state.orgName}
        pending={state.pendingAction === "create-org"}
        onClose={handlers.closeCreateDialog}
        onNameChange={handlers.setOrgName}
        onOpenChange={handlers.setCreateOpen}
        onSubmit={handlers.submitCreateOrganization}
      />
      <MembersDialog
        activeOrganization={activeOrganization}
        canManageMembers={canManageMembers}
        currentUserId={session.user.id}
        error={state.error}
        memberEmail={state.memberEmail}
        memberRole={state.memberRole}
        open={state.membersOpen}
        pendingAction={state.pendingAction}
        onEmailChange={handlers.setMemberEmail}
        onOpenChange={handlers.setMembersOpen}
        onRemoveMember={handlers.removeMember}
        onRoleChange={handlers.setMemberRole}
        onSubmit={handlers.submitAddMember}
      />
    </>
  )
}

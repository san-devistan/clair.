"use client"

import { CreateOrganizationDialog } from "@/components/auth/create-organization-dialog"
import Link from "@/components/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { Plus, UserCircle } from "lucide-react"

import type { Organization } from "./org-switcher.types"
import {
  OrganizationSelectItems,
  OrganizationSelectTriggerContent,
} from "./organization-select"
import { useOrgSwitcherState } from "./use-org-switcher-state"

const AUTH_LINK = <Link href="/auth?redirect=/dashboard" />
const ACCOUNT_MENU_LABEL = "Compte et entreprise"
const ACCOUNT_TRIGGER_BUTTON = (
  <SidebarMenuButton
    aria-label={ACCOUNT_MENU_LABEL}
    size="lg"
    title={ACCOUNT_MENU_LABEL}
    className="h-12 border border-sidebar-border bg-sidebar-accent/40 px-2 hover:bg-sidebar-accent data-popup-open:border-primary data-popup-open:bg-sidebar-accent data-popup-open:ring-2 data-popup-open:ring-primary/25"
  />
)

export function SidebarAccountMenu() {
  const {
    activeOrganization,
    handlers,
    isOrgListPending,
    organizations,
    session,
    state,
  } = useOrgSwitcherState()

  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton render={AUTH_LINK} tooltip="Se connecter">
            <UserCircle />
            <span>Se connecter</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const organizationLabel =
    activeOrganization?.name ?? (isOrgListPending ? "Chargement" : "Entreprise")

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <AccountDropdown
            activeOrganizationId={activeOrganization?.id}
            organizationLabel={organizationLabel}
            organizations={organizations}
            onOpenCreate={handlers.openCreateDialog}
            onSelectOrganization={handlers.selectOrganization}
          />
        </SidebarMenuItem>
      </SidebarMenu>
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
    </>
  )
}

function AccountDropdown({
  activeOrganizationId,
  organizationLabel,
  organizations,
  onOpenCreate,
  onSelectOrganization,
}: {
  activeOrganizationId: string | undefined
  organizationLabel: string
  organizations: Organization[]
  onOpenCreate: () => void
  onSelectOrganization: (organizationId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={ACCOUNT_TRIGGER_BUTTON}>
        <OrganizationSelectTriggerContent
          identityLabel={organizationLabel}
          organizationLabel={organizationLabel}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className="max-w-[calc(100vw-1rem)] p-1.5"
      >
        <OrganizationSelectItems
          activeOrganizationId={activeOrganizationId}
          organizations={organizations}
          onSelectOrganization={onSelectOrganization}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-3 px-2 py-2" onClick={onOpenCreate}>
          <Plus className="size-4" />
          <span>Nouveau</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { CreateOrganizationDialog } from "@/components/auth/create-organization-dialog"
import Link from "@/components/link"
import { isDemoDataSource } from "@/lib/fec/demo-source"
import { useFecStore } from "@/lib/fec/store-context"
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
const DEMO_ORGANIZATION_LABEL = "Demo Entreprise"
const EMPTY_ORGANIZATIONS: Organization[] = []
const ACCOUNT_TRIGGER_BUTTON = (
  <SidebarMenuButton
    aria-label={ACCOUNT_MENU_LABEL}
    size="lg"
    variant="account"
    title={ACCOUNT_MENU_LABEL}
  />
)

export function SidebarAccountMenu() {
  const { source } = useFecStore()
  const {
    activeOrganization,
    canCreateOrganization,
    handlers,
    isOrgListPending,
    organizations,
    session,
    state,
  } = useOrgSwitcherState()
  const isDemoDashboard = !session && isDemoDataSource(source)

  if (isDemoDashboard) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <AccountDropdown
            activeOrganizationId={undefined}
            canCreateOrganization={false}
            demoOrganizationLabel={DEMO_ORGANIZATION_LABEL}
            organizationLabel={DEMO_ORGANIZATION_LABEL}
            organizations={EMPTY_ORGANIZATIONS}
            onOpenCreate={handlers.openCreateDialog}
            onSelectOrganization={handlers.selectOrganization}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

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
            canCreateOrganization={canCreateOrganization}
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
  canCreateOrganization,
  demoOrganizationLabel,
  organizationLabel,
  organizations,
  onOpenCreate,
  onSelectOrganization,
}: {
  activeOrganizationId: string | undefined
  canCreateOrganization: boolean
  demoOrganizationLabel?: string
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
        size="relaxed"
      >
        <OrganizationSelectItems
          activeOrganizationId={activeOrganizationId}
          demoOrganizationLabel={demoOrganizationLabel}
          organizations={organizations}
          onSelectOrganization={onSelectOrganization}
        />
        {canCreateOrganization ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem size="relaxed" onClick={onOpenCreate}>
              <Plus className="size-4" />
              <span>Nouveau</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

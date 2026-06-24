"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Building2,
  Check,
  ChevronsUpDown,
  LogOut,
  Plus,
  Users,
} from "lucide-react"
import { useCallback } from "react"

import type {
  ActiveOrganization,
  Organization,
  Organizations,
} from "./org-switcher.types"

const ORG_TRIGGER_BUTTON = (
  <Button
    variant="outline"
    size="sm"
    className="max-w-[13rem] min-w-0 justify-between gap-2"
  />
)

export function OrganizationMenu({
  activeOrganization,
  organizations,
  isOrgListPending,
  onOpenCreate,
  onOpenMembers,
  onSelectOrganization,
  onSignOut,
}: {
  activeOrganization: ActiveOrganization | null
  organizations: Organizations
  isOrgListPending: boolean
  onOpenCreate: () => void
  onOpenMembers: () => void
  onSelectOrganization: (organizationId: string) => void
  onSignOut: () => void
}) {
  const triggerLabel =
    activeOrganization?.name ??
    (isOrgListPending ? "Chargement" : "Organisation")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={ORG_TRIGGER_BUTTON}>
        <Building2 className="size-4" />
        <span className="min-w-0 truncate">{triggerLabel}</span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <OrganizationMenuItems
          activeOrganizationId={activeOrganization?.id}
          organizations={organizations}
          onSelectOrganization={onSelectOrganization}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenCreate}>
          <Plus className="size-4" />
          Créer une organisation
        </DropdownMenuItem>
        <ManageMembersMenuItem
          hasActiveOrganization={Boolean(activeOrganization)}
          onOpenMembers={onOpenMembers}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}>
          <LogOut className="size-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OrganizationMenuItems({
  activeOrganizationId,
  organizations,
  onSelectOrganization,
}: {
  activeOrganizationId: string | undefined
  organizations: Organizations
  onSelectOrganization: (organizationId: string) => void
}) {
  if (organizations.length === 0) {
    return (
      <>
        <DropdownMenuLabel>Organisations</DropdownMenuLabel>
        <DropdownMenuItem disabled>Aucune organisation</DropdownMenuItem>
      </>
    )
  }

  return (
    <>
      <DropdownMenuLabel>Organisations</DropdownMenuLabel>
      {organizations.map((organization) => (
        <OrganizationMenuItem
          key={organization.id}
          activeOrganizationId={activeOrganizationId}
          organization={organization}
          onSelectOrganization={onSelectOrganization}
        />
      ))}
    </>
  )
}

function OrganizationMenuItem({
  activeOrganizationId,
  organization,
  onSelectOrganization,
}: {
  activeOrganizationId: string | undefined
  organization: Organization
  onSelectOrganization: (organizationId: string) => void
}) {
  const select = useCallback(() => {
    onSelectOrganization(organization.id)
  }, [onSelectOrganization, organization.id])

  return (
    <DropdownMenuItem onClick={select}>
      <span className="min-w-0 flex-1 truncate">{organization.name}</span>
      {organization.id === activeOrganizationId ? (
        <Check className="size-4" />
      ) : null}
    </DropdownMenuItem>
  )
}

function ManageMembersMenuItem({
  hasActiveOrganization,
  onOpenMembers,
}: {
  hasActiveOrganization: boolean
  onOpenMembers: () => void
}) {
  if (!hasActiveOrganization) {
    return null
  }

  return (
    <DropdownMenuItem onClick={onOpenMembers}>
      <Users className="size-4" />
      Gérer les membres
    </DropdownMenuItem>
  )
}

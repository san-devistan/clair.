"use client"

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu"
import { Check, ChevronsUpDown } from "lucide-react"
import { useCallback } from "react"

import { IdentityMark } from "./identity-mark"
import type { Organization } from "./org-switcher.types"

export function OrganizationSelectTriggerContent({
  identityLabel,
  organizationLabel,
}: {
  identityLabel: string
  organizationLabel: string
}) {
  return (
    <>
      <IdentityMark label={identityLabel} tone="accent" />
      <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
        <p className="truncate text-sm font-medium">{organizationLabel}</p>
      </div>
      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
    </>
  )
}

export function OrganizationSelectItems({
  activeOrganizationId,
  organizations,
  onSelectOrganization,
}: {
  activeOrganizationId: string | undefined
  organizations: Organization[]
  onSelectOrganization: (organizationId: string) => void
}) {
  if (organizations.length === 0) {
    return (
      <DropdownMenuGroup>
        <DropdownMenuLabel>Entreprises accessibles</DropdownMenuLabel>
        <DropdownMenuItem disabled>Aucune entreprise</DropdownMenuItem>
      </DropdownMenuGroup>
    )
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Entreprises accessibles</DropdownMenuLabel>
      {organizations.map((organization) => (
        <OrganizationSelectItem
          key={organization.id}
          active={organization.id === activeOrganizationId}
          organization={organization}
          onSelectOrganization={onSelectOrganization}
        />
      ))}
    </DropdownMenuGroup>
  )
}

function OrganizationSelectItem({
  active,
  organization,
  onSelectOrganization,
}: {
  active: boolean
  organization: Organization
  onSelectOrganization: (organizationId: string) => void
}) {
  const select = useCallback(() => {
    onSelectOrganization(organization.id)
  }, [onSelectOrganization, organization.id])

  return (
    <DropdownMenuItem className="gap-3 px-2 py-2" onClick={select}>
      <IdentityMark label={organization.name} compact />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{organization.name}</p>
      </div>
      {active ? <Check className="size-4 text-primary" /> : null}
    </DropdownMenuItem>
  )
}

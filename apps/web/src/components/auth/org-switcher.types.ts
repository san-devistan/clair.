import type { authClient } from "@/lib/auth/client"
import type { SubmitEvent } from "react"

export type MemberRole = "admin" | "member"
export type Organizations = NonNullable<
  ReturnType<typeof authClient.useListOrganizations>["data"]
>
export type Organization = Organizations[number]
export type ActiveOrganization = NonNullable<
  ReturnType<typeof authClient.useActiveOrganization>["data"]
>
export type OrganizationMember = ActiveOrganization["members"][number]

export type OrgSwitcherState = {
  createOpen: boolean
  editOpen: boolean
  editOrgName: string
  error: string | null
  memberEmail: string
  memberRole: MemberRole
  membersOpen: boolean
  orgName: string
  pendingAction: string | null
}

export type OrgSwitcherAction =
  | { type: "patch"; patch: Partial<OrgSwitcherState> }
  | { type: "created" }
  | { type: "member-added" }
  | { type: "organization-updated" }

export type OrgSwitcherHandlers = {
  closeCreateDialog: () => void
  closeEditDialog: () => void
  openCreateDialog: () => void
  openEditDialog: () => void
  openMembersDialog: () => void
  selectOrganization: (organizationId: string) => void
  setCreateOpen: (open: boolean) => void
  setEditOpen: (open: boolean) => void
  setEditOrgName: (value: string) => void
  setMemberEmail: (value: string) => void
  setMemberRole: (role: MemberRole) => void
  setMembersOpen: (open: boolean) => void
  setOrgName: (value: string) => void
  signOut: () => void
  submitAddMember: (event: SubmitEvent<HTMLFormElement>) => void
  submitCreateOrganization: (event: SubmitEvent<HTMLFormElement>) => void
  submitUpdateOrganization: (event: SubmitEvent<HTMLFormElement>) => void
  removeMember: (memberId: string) => void
}

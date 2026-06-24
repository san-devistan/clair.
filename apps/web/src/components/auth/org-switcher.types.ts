import type { authClient } from "@/lib/auth/client"
import type { FormEvent } from "react"

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

export type OrgSwitcherHandlers = {
  closeCreateDialog: () => void
  openCreateDialog: () => void
  openMembersDialog: () => void
  selectOrganization: (organizationId: string) => void
  setCreateOpen: (open: boolean) => void
  setMemberEmail: (value: string) => void
  setMemberRole: (role: MemberRole) => void
  setMembersOpen: (open: boolean) => void
  setOrgName: (value: string) => void
  signOut: () => void
  submitAddMember: (event: FormEvent<HTMLFormElement>) => void
  submitCreateOrganization: (event: FormEvent<HTMLFormElement>) => void
  removeMember: (memberId: string) => void
}

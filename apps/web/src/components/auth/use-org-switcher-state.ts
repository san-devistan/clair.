"use client"

import { authClient } from "@/lib/auth/client"
import { api } from "@workspace/backend/api"
import { useMutation, useQuery } from "convex/react"
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type FormEvent,
} from "react"

import type {
  ActiveOrganization,
  MemberRole,
  Organizations,
  OrgSwitcherAction,
  OrgSwitcherState,
} from "./org-switcher.types"
import { EMPTY_ORGANIZATIONS, hasManageMembersRole } from "./org-switcher.utils"
import {
  useAddMember,
  useCreateOrganization,
  useRemoveMember,
  useUpdateOrganization,
} from "./use-org-switcher-actions"

const INITIAL_STATE: OrgSwitcherState = {
  createOpen: false,
  editOpen: false,
  editOrgName: "",
  error: null,
  memberEmail: "",
  memberRole: "member",
  membersOpen: false,
  orgName: "",
  pendingAction: null,
}
function orgSwitcherReducer(
  state: OrgSwitcherState,
  action: OrgSwitcherAction
): OrgSwitcherState {
  switch (action.type) {
    case "created":
      return { ...state, createOpen: false, orgName: "" }
    case "member-added":
      return {
        ...state,
        memberEmail: "",
        memberRole: "member",
        membersOpen: false,
      }
    case "organization-updated":
      return { ...state, editOpen: false, editOrgName: "" }
    case "patch":
      return { ...state, ...action.patch }
    default:
      return state
  }
}

export function useOrgSwitcherState() {
  const addMemberByEmail = useMutation(api.auth.addMemberByEmail)
  const createOrganizationForCurrentUser = useMutation(
    api.auth.createOrganizationForCurrentUser
  )
  const { data: session } = authClient.useSession()
  const { data: organizations, isPending: isOrgListPending } =
    authClient.useListOrganizations()
  const accessibleOrganizations = getAccessibleOrganizations(organizations)
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const billingUsage = useBillingUsage(
    Boolean(session),
    activeOrganization?.id
  )
  const [state, dispatch] = useReducer(orgSwitcherReducer, INITIAL_STATE)

  useInitialActiveOrganization(activeOrganization, organizations)

  const setCreateOpen = useCallback((createOpen: boolean) => {
    dispatch({ type: "patch", patch: { createOpen } })
  }, [])

  const setEditOpen = useCallback((editOpen: boolean) => {
    dispatch({ type: "patch", patch: { editOpen } })
  }, [])

  const setMembersOpen = useCallback((membersOpen: boolean) => {
    dispatch({ type: "patch", patch: { membersOpen } })
  }, [])

  const openCreateDialog = useCallback(() => {
    dispatch({ type: "patch", patch: { createOpen: true, error: null } })
  }, [])

  const openEditDialog = useCallback(() => {
    dispatch({
      type: "patch",
      patch: {
        editOpen: true,
        editOrgName: activeOrganization?.name ?? "",
        error: null,
      },
    })
  }, [activeOrganization?.name])

  const openMembersDialog = useCallback(() => {
    dispatch({
      type: "patch",
      patch: {
        error: null,
        memberEmail: "",
        memberRole: "member",
        membersOpen: true,
      },
    })
  }, [])

  const closeCreateDialog = useCallback(() => {
    dispatch({ type: "patch", patch: { createOpen: false } })
  }, [])

  const closeEditDialog = useCallback(() => {
    dispatch({ type: "patch", patch: { editOpen: false } })
  }, [])

  const setOrgName = useCallback((orgName: string) => {
    dispatch({ type: "patch", patch: { orgName } })
  }, [])

  const setEditOrgName = useCallback((editOrgName: string) => {
    dispatch({ type: "patch", patch: { editOrgName } })
  }, [])

  const setMemberEmail = useCallback((memberEmail: string) => {
    dispatch({ type: "patch", patch: { memberEmail } })
  }, [])

  const setMemberRole = useCallback((memberRole: MemberRole) => {
    dispatch({ type: "patch", patch: { memberRole } })
  }, [])

  const selectOrganization = useCallback((organizationId: string) => {
    void authClient.organization.setActive({ organizationId })
  }, [])

  const signOut = useCallback(() => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign("/auth")
        },
      },
    })
  }, [])

  const { canCreateOrganization, canInviteMember, canManageMembers } =
    getOrgSwitcherAccess({
      activeOrganization,
      billingUsage,
      organizationCount: accessibleOrganizations.length,
      sessionUserId: session?.user.id,
    })
  const activeOrganizationUsage = getActiveOrganizationMemberUsage({
    activeOrganization,
    billingUsage,
  })

  const createOrganization = useCreateOrganization(
    billingUsage?.canCreateOrganization ?? null,
    createOrganizationForCurrentUser,
    state.orgName,
    dispatch
  )
  const updateOrganization = useUpdateOrganization(
    activeOrganization,
    state.editOrgName,
    dispatch
  )
  const addMember = useAddMember(
    activeOrganization,
    addMemberByEmail,
    activeOrganizationUsage?.canInviteMember ?? null,
    state.memberEmail,
    state.memberRole,
    dispatch
  )
  const removeMember = useRemoveMember(activeOrganization, dispatch)

  const submitCreateOrganization = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void createOrganization()
    },
    [createOrganization]
  )

  const submitUpdateOrganization = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void updateOrganization()
    },
    [updateOrganization]
  )

  const submitAddMember = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void addMember()
    },
    [addMember]
  )

  return {
    activeOrganization,
    billingUsage,
    activeOrganizationUsage,
    canCreateOrganization,
    canInviteMember,
    canManageMembers,
    isOrgListPending,
    organizations: accessibleOrganizations,
    session,
    state,
    handlers: {
      closeCreateDialog,
      closeEditDialog,
      openCreateDialog,
      openEditDialog,
      openMembersDialog,
      removeMember,
      selectOrganization,
      setCreateOpen,
      setEditOpen,
      setEditOrgName,
      setMemberEmail,
      setMemberRole,
      setMembersOpen,
      setOrgName,
      signOut,
      submitAddMember,
      submitCreateOrganization,
      submitUpdateOrganization,
    },
  }
}

function getAccessibleOrganizations(
  organizations: Organizations | null | undefined
) {
  return organizations ?? EMPTY_ORGANIZATIONS
}

function useBillingUsage(
  hasSession: boolean,
  activeOrganizationId: string | undefined
) {
  const billingUsageArgs = useMemo(
    () =>
      activeOrganizationId ? { organizationId: activeOrganizationId } : {},
    [activeOrganizationId]
  )

  return useQuery(
    api.billing.getCurrentUsage,
    hasSession ? billingUsageArgs : "skip"
  )
}

function useInitialActiveOrganization(
  activeOrganization: ActiveOrganization | null,
  organizations: Organizations | null | undefined
) {
  const didSetInitialOrg = useRef(false)

  useEffect(() => {
    if (didSetInitialOrg.current || activeOrganization || !organizations?.[0]) {
      return
    }

    didSetInitialOrg.current = true
    void authClient.organization.setActive({
      organizationId: organizations[0].id,
    })
  }, [activeOrganization, organizations])
}

function getOrgSwitcherAccess({
  activeOrganization,
  billingUsage,
  organizationCount,
  sessionUserId,
}: {
  activeOrganization: ActiveOrganization | null
  billingUsage: ReturnType<typeof useBillingUsage>
  organizationCount: number
  sessionUserId: string | undefined
}) {
  const activeMember = activeOrganization?.members.find(
    (member) => member.userId === sessionUserId
  )
  const canManageMembers = hasManageMembersRole(activeMember?.role)
  const canCreateOrganization = Boolean(
    sessionUserId &&
    billingUsage &&
    organizationCount < billingUsage.entitlements.organizationLimit
  )
  const memberUsage = getActiveOrganizationMemberUsage({
    activeOrganization,
    billingUsage,
  })
  const canInviteMember = Boolean(
    activeOrganization && canManageMembers && memberUsage?.canInviteMember
  )

  return { canCreateOrganization, canInviteMember, canManageMembers }
}

function getActiveOrganizationMemberUsage({
  activeOrganization,
  billingUsage,
}: {
  activeOrganization: ActiveOrganization | null
  billingUsage: ReturnType<typeof useBillingUsage>
}) {
  const memberLimit = billingUsage?.entitlements.membersPerOrganization
  if (!activeOrganization || memberLimit === undefined) {
    return null
  }

  const pendingInvitationCount = activeOrganization.invitations.filter(
    (invitation) => invitation.status === "pending"
  ).length
  const usedMemberSlots =
    activeOrganization.members.length + pendingInvitationCount

  return {
    canInviteMember: usedMemberSlots < memberLimit,
    memberLimit,
    pendingInvitationCount,
    usedMemberSlots,
  }
}

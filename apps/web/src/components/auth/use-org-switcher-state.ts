"use client"

import { authClient } from "@/lib/auth/client"
import { api } from "@workspace/backend/api"
import { useMutation } from "convex/react"
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type FormEvent,
} from "react"

import type {
  ActiveOrganization,
  MemberRole,
  OrgSwitcherAction,
  OrgSwitcherState,
} from "./org-switcher.types"
import {
  EMPTY_ORGANIZATIONS,
  getErrorMessage,
  hasManageMembersRole,
  makeSlug,
} from "./org-switcher.utils"

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

function isOrganizationLimitError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("maximum number of organizations") ||
    normalized.includes("maxim") ||
    normalized.includes("reached") ||
    normalized.includes("limite")
  )
}

export function useOrgSwitcherState() {
  const addMemberByEmail = useMutation(api.auth.addMemberByEmail)
  const { data: session } = authClient.useSession()
  const { data: organizations, isPending: isOrgListPending } =
    authClient.useListOrganizations()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const [state, dispatch] = useReducer(orgSwitcherReducer, INITIAL_STATE)
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

  const createOrganization = useCreateOrganization(state.orgName, dispatch)
  const updateOrganization = useUpdateOrganization(
    activeOrganization,
    state.editOrgName,
    dispatch
  )
  const addMember = useAddMember(
    activeOrganization,
    addMemberByEmail,
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

  const activeMember = activeOrganization?.members.find(
    (member) => member.userId === session?.user.id
  )

  return {
    activeOrganization,
    canManageMembers: hasManageMembersRole(activeMember?.role),
    isOrgListPending,
    organizations: organizations ?? EMPTY_ORGANIZATIONS,
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

function useCreateOrganization(
  orgName: string,
  dispatch: Dispatch<OrgSwitcherAction>
) {
  return useCallback(async () => {
    const name = orgName.trim()
    const slug = makeSlug(name)
    if (!name || !slug) {
      dispatch({
        type: "patch",
        patch: { error: "Le nom de l'organisation est requis." },
      })
      return
    }

    dispatch({
      type: "patch",
      patch: { error: null, pendingAction: "create-org" },
    })
    try {
      const result = await authClient.organization.create({ name, slug })
      if (result.error) {
        const message =
          result.error.message ?? "Impossible de créer l'organisation."
        if (isOrganizationLimitError(message)) {
          window.location.assign(
            "/onboarding?intent=create-organization&redirect=/dashboard"
          )
          return
        }

        dispatch({
          type: "patch",
          patch: { error: message },
        })
        return
      }

      dispatch({ type: "created" })
    } catch (caughtError) {
      dispatch({
        type: "patch",
        patch: { error: getErrorMessage(caughtError) },
      })
    } finally {
      dispatch({ type: "patch", patch: { pendingAction: null } })
    }
  }, [dispatch, orgName])
}

function useUpdateOrganization(
  activeOrganization: ActiveOrganization | null,
  editOrgName: string,
  dispatch: Dispatch<OrgSwitcherAction>
) {
  return useCallback(async () => {
    if (!activeOrganization) {
      dispatch({
        type: "patch",
        patch: { error: "Sélectionnez une organisation." },
      })
      return
    }

    const name = editOrgName.trim()
    if (!name) {
      dispatch({
        type: "patch",
        patch: { error: "Le nom de l'organisation est requis." },
      })
      return
    }

    dispatch({
      type: "patch",
      patch: { error: null, pendingAction: "update-org" },
    })
    try {
      const result = await authClient.organization.update({
        organizationId: activeOrganization.id,
        data: { name },
      })
      if (result.error) {
        dispatch({
          type: "patch",
          patch: {
            error:
              result.error.message ?? "Impossible de modifier l'organisation.",
          },
        })
        return
      }

      dispatch({ type: "organization-updated" })
    } catch (caughtError) {
      dispatch({
        type: "patch",
        patch: { error: getErrorMessage(caughtError) },
      })
    } finally {
      dispatch({ type: "patch", patch: { pendingAction: null } })
    }
  }, [activeOrganization, dispatch, editOrgName])
}

function useAddMember(
  activeOrganization: ActiveOrganization | null,
  addMemberByEmail: ReturnType<
    typeof useMutation<typeof api.auth.addMemberByEmail>
  >,
  memberEmail: string,
  memberRole: MemberRole,
  dispatch: Dispatch<OrgSwitcherAction>
) {
  return useCallback(async () => {
    if (!activeOrganization) {
      dispatch({
        type: "patch",
        patch: { error: "Sélectionnez une organisation." },
      })
      return
    }

    dispatch({
      type: "patch",
      patch: { error: null, pendingAction: "add-member" },
    })
    try {
      await addMemberByEmail({
        email: memberEmail,
        role: memberRole,
        organizationId: activeOrganization.id,
      })
      await authClient.organization.setActive({
        organizationId: activeOrganization.id,
      })
      dispatch({ type: "member-added" })
    } catch (caughtError) {
      dispatch({
        type: "patch",
        patch: { error: getErrorMessage(caughtError) },
      })
    } finally {
      dispatch({ type: "patch", patch: { pendingAction: null } })
    }
  }, [activeOrganization, addMemberByEmail, dispatch, memberEmail, memberRole])
}

function useRemoveMember(
  activeOrganization: ActiveOrganization | null,
  dispatch: Dispatch<OrgSwitcherAction>
) {
  const removeMemberAsync = useCallback(
    async (memberId: string) => {
      if (!activeOrganization) {
        return
      }

      dispatch({
        type: "patch",
        patch: { error: null, pendingAction: memberId },
      })
      try {
        const result = await authClient.organization.removeMember({
          memberIdOrEmail: memberId,
          organizationId: activeOrganization.id,
        })
        if (result.error) {
          dispatch({
            type: "patch",
            patch: {
              error: result.error.message ?? "Impossible de retirer ce membre.",
            },
          })
        }
      } catch (caughtError) {
        dispatch({
          type: "patch",
          patch: { error: getErrorMessage(caughtError) },
        })
      } finally {
        dispatch({ type: "patch", patch: { pendingAction: null } })
      }
    },
    [activeOrganization, dispatch]
  )

  return useCallback(
    (memberId: string) => {
      void removeMemberAsync(memberId)
    },
    [removeMemberAsync]
  )
}

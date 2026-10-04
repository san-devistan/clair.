"use client"

import { authClient } from "@/lib/auth/client"
import type { api } from "@workspace/backend/api"
import type { useMutation } from "convex/react"
import { useCallback, type Dispatch } from "react"

import type {
  ActiveOrganization,
  MemberRole,
  OrgSwitcherAction,
} from "./org-switcher.types"
import { getErrorMessage, makeSlug } from "./org-switcher.utils"

const CREATE_ORGANIZATION_LIMIT_PATH =
  "/onboarding?intent=create-organization&redirect=/dashboard"
const MEMBER_LIMIT_MESSAGE =
  "La limite de membres de cette entreprise est atteinte."

type CreateOrganizationMutation = ReturnType<
  typeof useMutation<typeof api.auth.createOrganizationForCurrentUser>
>
type AddMemberByEmailMutation = ReturnType<
  typeof useMutation<typeof api.auth.addMemberByEmail>
>

function isOrganizationLimitError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("maximum number of organizations") ||
    normalized.includes("maxim") ||
    normalized.includes("reached") ||
    normalized.includes("limit") ||
    normalized.includes("limite")
  )
}

export function useCreateOrganization({
  canCreateOrganization,
  createOrganizationForCurrentUser,
  refreshOrganizations,
  orgName,
  dispatch,
}: {
  canCreateOrganization: boolean | null
  createOrganizationForCurrentUser: CreateOrganizationMutation
  refreshOrganizations: () => Promise<void>
  orgName: string
  dispatch: Dispatch<OrgSwitcherAction>
}) {
  return useCallback(async () => {
    if (canCreateOrganization === false) {
      window.location.assign(CREATE_ORGANIZATION_LIMIT_PATH)
      return
    }

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
      const result = await createOrganizationForCurrentUser({ name, slug })
      await authClient.organization.setActive({
        organizationId: result.activeOrganizationId,
      })
      await refreshOrganizations()

      dispatch({ type: "created" })
    } catch (caughtError) {
      const message = getErrorMessage(caughtError)
      if (isOrganizationLimitError(message)) {
        window.location.assign(CREATE_ORGANIZATION_LIMIT_PATH)
        return
      }

      dispatch({
        type: "patch",
        patch: { error: message },
      })
    } finally {
      dispatch({ type: "patch", patch: { pendingAction: null } })
    }
  }, [
    canCreateOrganization,
    createOrganizationForCurrentUser,
    dispatch,
    orgName,
    refreshOrganizations,
  ])
}

export function useUpdateOrganization(
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

export function useAddMember({
  activeOrganization,
  addMemberByEmail,
  canInviteMember,
  memberEmail,
  memberRole,
  dispatch,
}: {
  activeOrganization: ActiveOrganization | null
  addMemberByEmail: AddMemberByEmailMutation
  canInviteMember: boolean | null
  memberEmail: string
  memberRole: MemberRole
  dispatch: Dispatch<OrgSwitcherAction>
}) {
  return useCallback(async () => {
    if (!activeOrganization) {
      dispatch({
        type: "patch",
        patch: { error: "Sélectionnez une organisation." },
      })
      return
    }

    if (canInviteMember === false) {
      dispatch({
        type: "patch",
        patch: { error: MEMBER_LIMIT_MESSAGE },
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
  }, [
    activeOrganization,
    addMemberByEmail,
    canInviteMember,
    dispatch,
    memberEmail,
    memberRole,
  ])
}

export function useRemoveMember(
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

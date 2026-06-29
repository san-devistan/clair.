"use client"

import { authClient } from "@/lib/auth/client"
import { api } from "@workspace/backend/api"
import { useMutation } from "convex/react"
import { useEffect, useRef } from "react"

type AuthSession = ReturnType<typeof authClient.useSession>["data"]

export function useAuthOnboarding(session: AuthSession) {
  const completeAuthOnboarding = useMutation(api.auth.completeAuthOnboarding)
  const completedOnboardingUserId = useRef<string | null>(null)

  useEffect(() => {
    const userId = session?.user.id
    if (!userId || completedOnboardingUserId.current === userId) {
      return
    }

    completedOnboardingUserId.current = userId

    const runOnboarding = async () => {
      try {
        const result = await completeAuthOnboarding()
        if (result.activeOrganizationId) {
          await authClient.organization.setActive({
            organizationId: result.activeOrganizationId,
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    void runOnboarding()
  }, [completeAuthOnboarding, session?.user.id])
}

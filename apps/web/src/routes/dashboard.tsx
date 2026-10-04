import { DashboardCompanyNameDialog } from "@/components/fec/dashboard/onboarding/company-name-dialog"
import { DashboardShell } from "@/components/fec/dashboard/shell"
import { authClient } from "@/lib/auth/client"
import { isDemoDataSource } from "@/lib/fec/demo-source"
import { useFecStore } from "@/lib/fec/store-context"
import { useRouter } from "@/lib/navigation"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

type DashboardSearch = {
  demo?: "1"
  onboarding?: "company-name"
}
type DashboardAuthState = "loading" | "ready" | "redirecting"

function isDemoSearchValue(value: unknown) {
  return value === "1" || value === 1
}

function validateSearch(search: Record<string, unknown>): DashboardSearch {
  return {
    demo: isDemoSearchValue(search.demo) ? "1" : undefined,
    onboarding:
      search.onboarding === "company-name" ? "company-name" : undefined,
  }
}

export const Route = createFileRoute("/dashboard")({
  validateSearch,
  component: DashboardLayout,
})

function DashboardLayout() {
  const { demo, onboarding } = Route.useSearch()
  const authState = useDashboardAuthGate(demo === "1")

  if (authState !== "ready") {
    return <DashboardAuthLoading />
  }

  return (
    <DashboardShell
      mode="account"
      beforeSidebar={
        <DashboardCompanyNameDialog open={onboarding === "company-name"} />
      }
    >
      <Outlet />
    </DashboardShell>
  )
}

function useDashboardAuthGate(isDemoRequested: boolean) {
  const { replace } = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { hydrated, reset, source } = useFecStore()
  const hasDemoSource = isDemoDataSource(source)
  const authState = getDashboardAuthState({
    hasDemoSource,
    hydrated,
    isDemoRequested,
    isSessionPending,
    session,
  })

  useEffect(() => {
    if (!hydrated || !hasDemoSource) {
      return
    }

    reset()
  }, [hasDemoSource, hydrated, reset])

  useEffect(() => {
    if (authState !== "redirecting") {
      return
    }

    replace(isDemoRequested ? "/demo" : "/auth?redirect=/dashboard")
  }, [authState, isDemoRequested, replace])

  return authState
}

function getDashboardAuthState({
  hasDemoSource,
  hydrated,
  isDemoRequested,
  isSessionPending,
  session,
}: {
  hasDemoSource: boolean
  hydrated: boolean
  isDemoRequested: boolean
  isSessionPending: boolean
  session: ReturnType<typeof authClient.useSession>["data"]
}): DashboardAuthState {
  if (isDemoRequested) {
    return "redirecting"
  }

  if (!hydrated || isSessionPending) {
    return "loading"
  }

  const hasSession = Boolean(session)
  if (hasDemoSource) {
    return "loading"
  }

  if (!hasSession) {
    return "redirecting"
  }

  return "ready"
}

function DashboardAuthLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span>Chargement du compte...</span>
      </div>
    </main>
  )
}

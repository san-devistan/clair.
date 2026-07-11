import { DashboardHeader } from "@/components/fec/dashboard/header"
import { DashboardCompanyNameDialog } from "@/components/fec/dashboard/onboarding/company-name-dialog"
import { DashboardSidebar } from "@/components/fec/dashboard/sidebar"
import { authClient } from "@/lib/auth/client"
import { isDemoDataSource } from "@/lib/fec/demo-source"
import { useFecStore } from "@/lib/fec/store-context"
import { useRouter } from "@/lib/navigation"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"

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
    <SidebarProvider>
      <DashboardDemoLoader />
      <DashboardCompanyNameDialog open={onboarding === "company-name"} />
      <DashboardSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DashboardHeader />
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function useDashboardAuthGate(isDemoRequested: boolean) {
  const { replace } = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: organizations, isPending: isOrganizationPending } =
    authClient.useListOrganizations()
  const { hydrated, reset, source } = useFecStore()
  const hasDemoSource = isDemoDataSource(source)
  const authState = getDashboardAuthState({
    hasDemoSource,
    hydrated,
    isDemoRequested,
    isOrganizationPending,
    isSessionPending,
    organizationCount: organizations?.length ?? 0,
    session,
  })

  useEffect(() => {
    if (!hydrated || !session || !hasDemoSource) {
      return
    }

    reset()
  }, [hasDemoSource, hydrated, reset, session])

  useEffect(() => {
    if (authState !== "redirecting") {
      return
    }

    if (!session) {
      replace("/auth?redirect=/dashboard")
      return
    }
    replace("/onboarding?redirect=/dashboard")
  }, [authState, replace, session])

  return authState
}

function getDashboardAuthState({
  hasDemoSource,
  hydrated,
  isDemoRequested,
  isOrganizationPending,
  isSessionPending,
  organizationCount,
  session,
}: {
  hasDemoSource: boolean
  hydrated: boolean
  isDemoRequested: boolean
  isOrganizationPending: boolean
  isSessionPending: boolean
  organizationCount: number
  session: ReturnType<typeof authClient.useSession>["data"]
}): DashboardAuthState {
  if (!hydrated || isSessionPending) {
    return "loading"
  }

  const hasSession = Boolean(session)
  if (!hasSession && (isDemoRequested || hasDemoSource)) {
    return "ready"
  }

  if (hasSession && (hasDemoSource || isOrganizationPending)) {
    return "loading"
  }

  if (!hasSession || organizationCount === 0) {
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

function DashboardDemoLoader() {
  const { hydrated, importDemo } = useFecStore()
  const { demo } = Route.useSearch()
  const { replace } = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const started = useRef(false)

  useEffect(() => {
    if (!hydrated || isSessionPending || demo !== "1" || started.current) {
      return
    }

    started.current = true
    if (session) {
      replace("/dashboard")
      return
    }

    void (async () => {
      await importDemo()
      replace("/dashboard")
    })()
  }, [demo, hydrated, importDemo, isSessionPending, replace, session])

  return null
}

import { DashboardHeader } from "@/components/fec/dashboard/header"
import { DashboardSidebar } from "@/components/fec/dashboard/sidebar"
import { useFecStore } from "@/lib/fec/store"
import { useRouter } from "@/lib/navigation"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { useEffect, useRef } from "react"

type DashboardSearch = {
  demo?: "1"
}

function isDemoSearchValue(value: unknown) {
  return value === "1" || value === 1
}

function validateSearch(search: Record<string, unknown>): DashboardSearch {
  return {
    demo: isDemoSearchValue(search.demo) ? "1" : undefined,
  }
}

export const Route = createFileRoute("/dashboard")({
  validateSearch,
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardDemoLoader />
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

function DashboardDemoLoader() {
  const { hydrated, importDemo } = useFecStore()
  const { demo } = Route.useSearch()
  const { replace } = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (!hydrated || demo !== "1" || started.current) return

    started.current = true
    void (async () => {
      await importDemo()
      replace("/dashboard")
    })()
  }, [demo, hydrated, importDemo, replace])

  return null
}

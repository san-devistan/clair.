"use client"

import { OrgSwitcher } from "@/components/auth/org-switcher"
import { DashboardHeader } from "@/components/fec/dashboard-header"
import { DashboardSidebar } from "@/components/fec/dashboard-sidebar"
import { getAuthToken } from "@/lib/auth/auth.functions"
import { useFecStore } from "@/lib/fec/store"
import { useRouter, useSearchParams } from "@/lib/navigation"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { useEffect, useRef } from "react"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    const token = await getAuthToken()

    if (!token) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardDemoLoader />
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <OrgSwitcher />
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
  const { get } = useSearchParams()
  const { replace } = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (!hydrated || get("demo") !== "1" || started.current) return

    started.current = true
    void (async () => {
      await importDemo()
      replace("/dashboard")
    })()
  }, [hydrated, get, importDemo, replace])

  return null
}

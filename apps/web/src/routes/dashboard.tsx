"use client"

import { DashboardHeader } from "@/components/fec/dashboard-header"
import { DashboardSidebar } from "@/components/fec/dashboard-sidebar"
import { useFecStore } from "@/lib/fec/store"
import { useRouter, useSearchParams } from "@/lib/navigation"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { useEffect, useRef } from "react"

export const Route = createFileRoute("/dashboard")({
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
          <DashboardHeader />
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

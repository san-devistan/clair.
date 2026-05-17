import { DashboardHeader } from "@/components/fec/dashboard-header"
import { DashboardSidebar } from "@/components/fec/dashboard-sidebar"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
})

export default function DashboardLayout() {
  return (
    <SidebarProvider>
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

"use client"

import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import type { ReactNode } from "react"

import { DashboardHeader } from "./header"
import { DashboardModeProvider, type DashboardMode } from "./mode"
import { DashboardSidebar } from "./sidebar"

export function DashboardShell({
  mode,
  children,
  beforeSidebar,
}: {
  mode: DashboardMode
  children: ReactNode
  beforeSidebar?: ReactNode
}) {
  return (
    <DashboardModeProvider mode={mode}>
      <SidebarProvider>
        {beforeSidebar}
        <DashboardSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <DashboardHeader />
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardModeProvider>
  )
}

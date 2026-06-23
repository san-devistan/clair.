"use client"

import { DashboardOverview } from "@/components/fec/dashboard-overview"
import { DASHBOARD_PAGE_FALLBACK } from "@/components/fec/dashboard-page"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  return (
    <Suspense fallback={DASHBOARD_PAGE_FALLBACK}>
      <DashboardOverview />
    </Suspense>
  )
}

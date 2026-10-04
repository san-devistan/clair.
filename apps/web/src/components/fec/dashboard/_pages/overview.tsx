"use client"

import { DashboardOverview } from "@/components/fec/dashboard/overview"
import { DASHBOARD_PAGE_FALLBACK } from "@/components/fec/dashboard/page"
import { Suspense } from "react"

export function DashboardOverviewPage() {
  return (
    <Suspense fallback={DASHBOARD_PAGE_FALLBACK}>
      <DashboardOverview />
    </Suspense>
  )
}

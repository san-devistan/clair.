"use client"

import { DashboardEmptyState } from "@/components/fec/dashboard/empty-state"
import { TresorerieContent } from "@/components/fec/treasury/content"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/tresorerie")({
  component: TresoreriePage,
})

function TresoreriePage() {
  const { data, comparisonData } = useFecStore()
  if (!data) return <DashboardEmptyState />

  return <TresorerieContent data={data} comparisonData={comparisonData} />
}

"use client"

import { DashboardEmptyState } from "@/components/fec/dashboard/empty-state"
import { TresorerieContent } from "@/components/fec/treasury/content"
import { useFecStore } from "@/lib/fec/store-context"

export function TresoreriePage() {
  const { data, comparisonData } = useFecStore()
  if (!data) return <DashboardEmptyState />

  return <TresorerieContent data={data} comparisonData={comparisonData} />
}

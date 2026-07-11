"use client"

import { createContext, use } from "react"

import type { DashboardData } from "./analytics"
import type { DataSource } from "./data-source"
import type { MonthRange } from "./date-ranges"

export type ImportState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "ready" }
  | { status: "error"; message: string }

export interface FecStoreValue {
  source: DataSource | null
  data: DashboardData | null
  comparisonData: DashboardData | null
  hydrated: boolean
  importState: ImportState
  availableRange: MonthRange | null
  selectedRange: MonthRange | null
  comparisonRange: MonthRange | null
  importFile: (file: File) => Promise<void>
  importDemo: () => Promise<void>
  setSelectedRange: (range: MonthRange) => void
  setComparisonRange: (range: MonthRange | null) => void
  resetComparison: () => void
  reset: () => void
}

export const FecStoreContext = createContext<FecStoreValue | null>(null)

export function useFecStore(): FecStoreValue {
  const ctx = use(FecStoreContext)
  if (!ctx) {
    throw new Error("useFecStore must be used within a FecStoreProvider")
  }
  return ctx
}

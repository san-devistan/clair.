"use client"

import { createContext, use, type ReactNode } from "react"

export type DashboardMode = "account" | "demo"

const DashboardModeContext = createContext<DashboardMode>("account")

export function DashboardModeProvider({
  mode,
  children,
}: {
  mode: DashboardMode
  children: ReactNode
}) {
  return <DashboardModeContext value={mode}>{children}</DashboardModeContext>
}

export function useDashboardMode() {
  return use(DashboardModeContext)
}

export function useDashboardHref(path = "") {
  const basePath = useDashboardMode() === "demo" ? "/demo" : "/dashboard"
  return `${basePath}${path}`
}

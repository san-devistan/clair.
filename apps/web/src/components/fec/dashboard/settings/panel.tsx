import type { ReactNode } from "react"

export function SettingsPanel({ children }: { children: ReactNode }) {
  return <section className="divide-y">{children}</section>
}

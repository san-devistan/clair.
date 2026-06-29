import { AuthBackground } from "@/components/auth/auth-background"
import { AuthHeader } from "@/components/auth/auth-header"
import type { ReactNode } from "react"

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <AuthBackground />
      <AuthHeader />
      <section className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center justify-center px-6 py-10 lg:py-16">
        {children}
      </section>
    </main>
  )
}

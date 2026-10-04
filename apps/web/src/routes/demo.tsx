import { DashboardShell } from "@/components/fec/dashboard/shell"
import { FecStoreProvider } from "@/lib/fec/store"
import { useFecStore } from "@/lib/fec/store-context"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

export const Route = createFileRoute("/demo")({
  component: DemoLayout,
})

function DemoLayout() {
  return (
    <FecStoreProvider persistence="memory">
      <DemoDataLoader />
      <DashboardShell mode="demo">
        <Outlet />
      </DashboardShell>
    </FecStoreProvider>
  )
}

function DemoDataLoader() {
  const { hydrated, importDemo, source } = useFecStore()
  const started = useRef(false)

  useEffect(() => {
    if (!hydrated || source || started.current) return

    started.current = true
    void importDemo()
  }, [hydrated, importDemo, source])

  return null
}

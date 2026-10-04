import { DashboardOverviewPage } from "@/components/fec/dashboard/_pages/overview"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/")({
  component: DashboardOverviewPage,
})

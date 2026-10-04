import { InsightsPage } from "@/components/fec/dashboard/_pages/insights"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/insights")({
  component: InsightsPage,
})

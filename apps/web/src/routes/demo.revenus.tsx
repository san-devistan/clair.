import { RevenusPage } from "@/components/fec/dashboard/_pages/revenus"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/revenus")({
  component: RevenusPage,
})

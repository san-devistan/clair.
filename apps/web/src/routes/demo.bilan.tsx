import { BilanPage } from "@/components/fec/dashboard/_pages/bilan"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/bilan")({
  component: BilanPage,
})

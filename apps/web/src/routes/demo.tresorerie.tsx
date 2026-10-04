import { TresoreriePage } from "@/components/fec/dashboard/_pages/tresorerie"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/tresorerie")({
  component: TresoreriePage,
})

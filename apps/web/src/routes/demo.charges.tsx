import { ChargesPage } from "@/components/fec/dashboard/_pages/charges"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/charges")({
  component: ChargesPage,
})

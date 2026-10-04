import { ClientsPage } from "@/components/fec/dashboard/_pages/clients"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/clients")({
  component: ClientsPage,
})

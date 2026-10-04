import { FournisseursPage } from "@/components/fec/dashboard/_pages/fournisseurs"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/demo/fournisseurs")({
  component: FournisseursPage,
})

import { ThemeProvider } from "@/components/theme-provider"
import { FecStoreProvider } from "@/lib/fec/store"
import type { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import appCss from "@workspace/ui/globals.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Clair · La santé de votre entreprise, en clair",
      },
      {
        name: "description",
        content:
          "Importez votre FEC, obtenez en quelques secondes un tableau de bord clair pour piloter votre entreprise : ventes, charges, trésorerie, marges, et actions concrètes à mener.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico?v=rounded-matte",
        sizes: "16x16 24x24 32x32 48x48 64x64",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg?v=rounded-matte",
        sizes: "any",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>La page demandée est introuvable.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider delay={150}>
            <FecStoreProvider>{children}</FecStoreProvider>
          </TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

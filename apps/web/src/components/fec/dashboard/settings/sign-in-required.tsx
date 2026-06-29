import Link from "@/components/link"
import { Button } from "@workspace/ui/components/button"
import { UserCircle } from "lucide-react"

const AUTH_DASHBOARD_LINK = <Link href="/auth?redirect=/dashboard" />

export function SignInRequired() {
  return (
    <section className="py-4">
      <div className="flex items-start gap-3">
        <UserCircle className="mt-0.5 size-5 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Connexion requise</p>
          <p className="mt-1 text-sm text-muted-foreground">
            L'import FEC et les accès entreprise sont rattachés à votre compte.
          </p>
        </div>
      </div>
      <Button className="mt-4 w-full" render={AUTH_DASHBOARD_LINK}>
        Se connecter
      </Button>
    </section>
  )
}

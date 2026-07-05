import { ClairBrand } from "@/components/clair-brand"
import Link from "@/components/link"
import { Button } from "@workspace/ui/components/button"

const DEMO_LINK = <Link href="/dashboard?demo=1" />

export function AuthHeader({ showDemo = true }: { showDemo?: boolean }) {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between p-6">
      <Link href="/" className="block">
        <ClairBrand />
      </Link>
      {showDemo ? (
        <Button size="sm" variant="outline" render={DEMO_LINK}>
          Voir la démo
        </Button>
      ) : null}
    </header>
  )
}

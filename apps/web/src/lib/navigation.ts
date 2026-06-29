import {
  defaultParseSearch,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router"
import { useMemo } from "react"

function parseHref(href: string) {
  const url = new URL(href, "https://clair.local")
  const search = defaultParseSearch(url.search)

  return {
    to: url.pathname,
    search: Object.keys(search).length > 0 ? search : undefined,
    hash: url.hash ? url.hash.slice(1) : undefined,
  }
}

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function useRouter() {
  const navigate = useNavigate()

  return useMemo(
    () => ({
      push: (href: string) => {
        const { to, search, hash } = parseHref(href)
        void navigate({
          to,
          search,
          hash,
        })
      },
      replace: (href: string) => {
        const { to, search, hash } = parseHref(href)
        void navigate({
          to,
          search,
          hash,
          replace: true,
        })
      },
    }),
    [navigate]
  )
}

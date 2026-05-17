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

function toSearchParams(search: Record<string, unknown>) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) params.append(key, searchValueToString(item))
      }
      continue
    }
    params.set(key, searchValueToString(value))
  }

  return params
}

function searchValueToString(value: unknown) {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean")
    return String(value)
  return JSON.stringify(value) ?? ""
}

export function usePathname() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function useSearchParams() {
  const search = useRouterState({
    select: (state) => state.location.search as Record<string, unknown>,
  })

  return useMemo(() => {
    const params = toSearchParams(search)
    return {
      get: params.get.bind(params),
    }
  }, [search])
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

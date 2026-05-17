import { Link as RouterLink, defaultParseSearch } from "@tanstack/react-router"
import type { AnchorHTMLAttributes, ReactNode } from "react"

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string
  children?: ReactNode
}

function isRouterHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//")
}

function parseRouterHref(href: string) {
  const url = new URL(href, "https://clair.local")
  const search = defaultParseSearch(url.search)

  return {
    to: url.pathname,
    search: Object.keys(search).length > 0 ? search : undefined,
    hash: url.hash ? url.hash.slice(1) : undefined,
  }
}

export default function Link({ href, children, ...props }: LinkProps) {
  if (!isRouterHref(href))
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )

  const { to, search, hash } = parseRouterHref(href)

  return (
    <RouterLink to={to} search={search} hash={hash} {...props}>
      {children}
    </RouterLink>
  )
}

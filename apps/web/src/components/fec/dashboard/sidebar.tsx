"use client"

import { SidebarAccountMenu } from "@/components/auth/sidebar-account-menu"
import { ClairBrand } from "@/components/clair-brand"
import Link from "@/components/link"
import { usePathname } from "@/lib/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardCheck,
  LayoutDashboard,
  type LucideIcon,
  ReceiptText,
  Scale,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { useCallback, useMemo } from "react"

import { useDashboardHref, useDashboardMode } from "./mode"
import { DashboardSettingsDialog } from "./settings/dialog"

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

const PRIMARY_NAV: NavItem[] = [
  { path: "", label: "Vue d'ensemble", icon: LayoutDashboard },
  {
    path: "/insights",
    label: "Actions à mener",
    icon: ClipboardCheck,
  },
]

const ANALYSIS_NAV: NavItem[] = [
  { path: "/bilan", label: "Bilan", icon: Scale },
  { path: "/revenus", label: "Revenus", icon: CircleDollarSign },
  { path: "/charges", label: "Charges", icon: ReceiptText },
  { path: "/tresorerie", label: "Trésorerie", icon: Wallet },
]

const COUNTERPARTY_NAV: NavItem[] = [
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/fournisseurs", label: "Fournisseurs", icon: Truck },
]

const START_LINK = <Link href="/auth?redirect=/dashboard" />

export function DashboardSidebar() {
  const pathname = usePathname()
  const mode = useDashboardMode()
  const rootHref = useDashboardHref()

  const isActive = useCallback(
    (href: string) =>
      href === rootHref ? pathname === href : pathname?.startsWith(href),
    [pathname, rootHref]
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="block px-2 py-1.5">
          <ClairBrand markSize="sm" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavSection items={PRIMARY_NAV} isActive={isActive} />
        <NavSection label="Analyse" items={ANALYSIS_NAV} isActive={isActive} />
        <NavSection
          label="Tiers"
          items={COUNTERPARTY_NAV}
          isActive={isActive}
        />
      </SidebarContent>

      {mode === "account" ? (
        <SidebarFooter>
          <SidebarAccountMenu />
          <DashboardSettingsDialog />
        </SidebarFooter>
      ) : (
        <SidebarFooter>
          <div className="rounded-lg border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">
              Prêt à piloter votre entreprise ?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Connectez vos données et partagez le tableau de bord.
            </p>
            <Button size="sm" className="mt-3 w-full" render={START_LINK}>
              Commencer
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}

function NavSection({
  label,
  items,
  isActive,
}: {
  label?: string
  items: NavItem[]
  isActive: (href: string) => boolean
}) {
  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavMenuItem key={item.path} item={item} isActive={isActive} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavMenuItem({
  item,
  isActive,
}: {
  item: NavItem
  isActive: (href: string) => boolean
}) {
  const href = useDashboardHref(item.path)
  const link = useMemo(() => <Link href={href} />, [href])
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive(href)}
        tooltip={item.label}
        render={link}
      >
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

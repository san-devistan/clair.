"use client"

import { SidebarAccountMenu } from "@/components/auth/sidebar-account-menu"
import { ClairBrand } from "@/components/clair-brand"
import Link from "@/components/link"
import { usePathname } from "@/lib/navigation"
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

import { DashboardSettingsDialog } from "./settings/dialog"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  {
    href: "/dashboard/insights",
    label: "Actions à mener",
    icon: ClipboardCheck,
  },
]

const ANALYSIS_NAV: NavItem[] = [
  { href: "/dashboard/bilan", label: "Bilan", icon: Scale },
  { href: "/dashboard/revenus", label: "Revenus", icon: CircleDollarSign },
  { href: "/dashboard/charges", label: "Charges", icon: ReceiptText },
  { href: "/dashboard/tresorerie", label: "Trésorerie", icon: Wallet },
]

const COUNTERPARTY_NAV: NavItem[] = [
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/fournisseurs", label: "Fournisseurs", icon: Truck },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = useCallback(
    (href: string) =>
      href === "/dashboard" ? pathname === href : pathname?.startsWith(href),
    [pathname]
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

      <SidebarFooter>
        <SidebarAccountMenu />
        <DashboardSettingsDialog />
      </SidebarFooter>
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
            <NavMenuItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavMenuItem({ item, active }: { item: NavItem; active: boolean }) {
  const link = useMemo(() => <Link href={item.href} />, [item.href])
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={active} tooltip={item.label} render={link}>
        <Icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

"use client"

import { FormattedNumber } from "@/components/fec/formatted-number"
import Link from "@/components/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { monthEndDate, monthStartDate } from "@/lib/fec/date-ranges"
import { formatShortDate } from "@/lib/fec/format"
import { useFecStore } from "@/lib/fec/store"
import { usePathname, useRouter } from "@/lib/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
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
  ArrowLeftRight,
  CircleDollarSign,
  ClipboardCheck,
  LayoutDashboard,
  type LucideIcon,
  ReceiptText,
  RotateCcw,
  Scale,
  TableProperties,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { useCallback, useMemo } from "react"

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

const CHANGE_FEC_BUTTON = (
  <Button
    variant="ghost"
    size="sm"
    className="mt-3 h-7 w-full justify-start px-2 text-muted-foreground hover:text-foreground"
  />
)

const CANCEL_RESET_BUTTON = <Button variant="outline" />

export function DashboardSidebar() {
  const pathname = usePathname()
  const { push } = useRouter()
  const { availableRange, source, reset } = useFecStore()

  const isActive = useCallback(
    (href: string) =>
      href === "/dashboard" ? pathname === href : pathname?.startsWith(href),
    [pathname]
  )

  const handleReset = useCallback(() => {
    reset()
    push("/upload")
  }, [push, reset])

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <span className="font-heading text-xs font-bold">c.</span>
          </div>
          <span className="font-heading text-base font-semibold tracking-tight">
            Clair
          </span>
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
        <ThemeToggle />
        {source && availableRange ? (
          <DataSourceCard
            availableRange={availableRange}
            source={source}
            onReset={handleReset}
          />
        ) : null}
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

function DataSourceCard({
  availableRange,
  source,
  onReset,
}: {
  availableRange: NonNullable<ReturnType<typeof useFecStore>["availableRange"]>
  source: NonNullable<ReturnType<typeof useFecStore>["source"]>
  onReset: () => void
}) {
  const { meta } = source.parseResult
  const resetButton = useMemo(
    () => <Button variant="destructive" onClick={onReset} />,
    [onReset]
  )

  return (
    <div className="mx-1 mb-1 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Source de données
          </p>
          <p className="mt-1 truncate text-sm font-medium">{meta.fileName}</p>
        </div>
        <TableProperties className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatShortDate(monthStartDate(availableRange.startMonth))} →{" "}
        {formatShortDate(monthEndDate(availableRange.endMonth))}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        <FormattedNumber value={meta.rowCount} /> écritures disponibles
      </p>

      <Dialog>
        <DialogTrigger render={CHANGE_FEC_BUTTON}>
          <ArrowLeftRight className="size-3.5" />
          <span>Changer de source</span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer une nouvelle source ?</DialogTitle>
            <DialogDescription>
              Vos données actuelles seront supprimées de votre navigateur. Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={CANCEL_RESET_BUTTON}>Annuler</DialogClose>
            <DialogClose render={resetButton}>
              <RotateCcw />
              Importer une nouvelle source
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

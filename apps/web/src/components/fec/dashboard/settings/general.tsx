"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Check,
  ChevronDown,
  LogOut,
  Monitor,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

const subscribeToClientSnapshot = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

type Appearance = "system" | "light" | "dark"

const APPEARANCE_OPTIONS: Array<{
  icon: LucideIcon
  label: string
  value: Appearance
}> = [
  { value: "system", label: "Système", icon: Monitor },
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
]
const DEFAULT_APPEARANCE_OPTION = APPEARANCE_OPTIONS[0]
const APPEARANCE_TRIGGER_BUTTON = (
  <Button type="button" variant="outline" className="gap-2 px-3" />
)

export function GeneralSettingsPanel({
  userEmail,
  onSignOut,
}: {
  userEmail: string | undefined
  onSignOut: () => void
}) {
  return (
    <section className="divide-y">
      <EmailPreference userEmail={userEmail} />
      <ThemePreference />
      {userEmail ? <SessionPreference onSignOut={onSignOut} /> : null}
    </section>
  )
}

function EmailPreference({ userEmail }: { userEmail: string | undefined }) {
  return (
    <SettingRow title="Email">
      <p className="max-w-full min-w-0 truncate text-right text-sm text-muted-foreground sm:max-w-xs">
        {userEmail ?? "Non connecté"}
      </p>
    </SettingRow>
  )
}

function ThemePreference() {
  const { setTheme, theme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeToClientSnapshot,
    getClientSnapshot,
    getServerSnapshot
  )
  const appearance = mounted ? parseAppearance(theme) : "system"
  const selectedOption = useMemo(
    () =>
      APPEARANCE_OPTIONS.find((option) => option.value === appearance) ??
      DEFAULT_APPEARANCE_OPTION,
    [appearance]
  )
  const SelectedIcon = selectedOption.icon

  const selectAppearance = useCallback(
    (value: Appearance) => {
      setTheme(value)
    },
    [setTheme]
  )

  return (
    <SettingRow title="Apparence">
      <DropdownMenu>
        <DropdownMenuTrigger render={APPEARANCE_TRIGGER_BUTTON}>
          <SelectedIcon />
          <span>{selectedOption.label}</span>
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {APPEARANCE_OPTIONS.map((option) => (
            <AppearanceItem
              key={option.value}
              active={option.value === appearance}
              option={option}
              onSelect={selectAppearance}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SettingRow>
  )
}

function AppearanceItem({
  active,
  option,
  onSelect,
}: {
  active: boolean
  option: (typeof APPEARANCE_OPTIONS)[number]
  onSelect: (value: Appearance) => void
}) {
  const Icon = option.icon
  const select = useCallback(() => {
    onSelect(option.value)
  }, [onSelect, option.value])

  return (
    <DropdownMenuItem onClick={select}>
      <Icon />
      <span className="min-w-0 flex-1">{option.label}</span>
      {active ? <Check /> : null}
    </DropdownMenuItem>
  )
}

function SessionPreference({ onSignOut }: { onSignOut: () => void }) {
  return (
    <SettingRow title="Session">
      <Button type="button" variant="destructive" onClick={onSignOut}>
        <LogOut />
        Se déconnecter
      </Button>
    </SettingRow>
  )
}

function SettingRow({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2.5">
      <p className="shrink-0 font-medium">{title}</p>
      {children}
    </div>
  )
}

function parseAppearance(value: string | undefined): Appearance {
  if (value === "dark" || value === "light" || value === "system") {
    return value
  }

  return "system"
}

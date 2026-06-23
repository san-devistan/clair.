"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useSyncExternalStore } from "react"

const subscribeToClientSnapshot = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeToClientSnapshot,
    getClientSnapshot,
    getServerSnapshot
  )

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Mode clair" : "Mode sombre"
  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-label={label}
          onClick={toggleTheme}
          tooltip={label}
        >
          {isDark ? <Sun /> : <Moon />}
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

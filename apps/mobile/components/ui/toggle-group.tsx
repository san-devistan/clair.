import { ToggleGroupContext } from "@/components/ui/toggle-group-context"
import type { toggleVariants } from "@/components/ui/toggle-variants"
import { cn } from "@/lib/utils"
import * as ToggleGroupPrimitive from "@rn-primitives/toggle-group"
import type { VariantProps } from "class-variance-authority"
import { Platform } from "react-native"

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  const contextValue = getToggleGroupContextValue({ variant, size })

  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        "flex flex-row items-center rounded-md shadow-none",
        Platform.select({ web: "w-fit" }),
        variant === "outline" && "shadow-sm shadow-black/5",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

type ToggleGroupContextValue = VariantProps<typeof toggleVariants>

const toggleGroupContextValueCache = new Map<string, ToggleGroupContextValue>()

function getToggleGroupContextValue({
  variant,
  size,
}: ToggleGroupContextValue) {
  const cacheKey = `${variant ?? ""}:${size ?? ""}`
  const cachedValue = toggleGroupContextValueCache.get(cacheKey)
  if (cachedValue) return cachedValue

  const value = { variant, size }
  toggleGroupContextValueCache.set(cacheKey, value)
  return value
}

export { ToggleGroup }
export { ToggleGroupIcon } from "./toggle-group-icon"
export { ToggleGroupItem } from "./toggle-group-item"

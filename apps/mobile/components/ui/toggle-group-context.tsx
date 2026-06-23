import type { toggleVariants } from "@/components/ui/toggle-variants"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"

const ToggleGroupContext = React.createContext<VariantProps<
  typeof toggleVariants
> | null>(null)

function useToggleGroupContext() {
  const context = React.use(ToggleGroupContext)
  if (context === null) {
    throw new Error(
      "ToggleGroup compound components cannot be rendered outside the ToggleGroup component"
    )
  }
  return context
}

export { ToggleGroupContext, useToggleGroupContext }

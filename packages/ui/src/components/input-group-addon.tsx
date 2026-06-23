"use client"

import { inputGroupAddonVariants } from "@workspace/ui/components/input-group-variants"
import { cn } from "@workspace/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  )
}

export { InputGroupAddon }

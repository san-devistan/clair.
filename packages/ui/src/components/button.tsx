import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { buttonVariants } from "@workspace/ui/components/button-variants"
import { cn } from "@workspace/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"

function Button({
  className,
  nativeButton,
  render,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={nativeButton ?? rendersNativeButton(render)}
      render={render}
      {...props}
    />
  )
}

function rendersNativeButton(render: ButtonPrimitive.Props["render"]) {
  return (
    render === undefined ||
    (React.isValidElement(render) && render.type === "button")
  )
}

export { Button }

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { badgeVariants } from "@workspace/ui/components/badge-variants"
import { cn } from "@workspace/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"

function Badge({
  className,
  variant = "default",
  size = "default",
  font = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size, font }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  })
}

export { Badge }

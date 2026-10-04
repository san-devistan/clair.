import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border border-input text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "h-8 bg-transparent px-2.5 py-1 dark:bg-input/30",
        muted: "h-10 bg-muted/30 px-3 py-1 dark:bg-input/30",
      },
      trailing: {
        none: "",
        icon: "pr-10",
      },
    },
    defaultVariants: { variant: "default", trailing: "none" },
  }
)

function Input({
  className,
  type,
  variant,
  trailing,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, trailing }), className)}
      {...props}
    />
  )
}

export { Input }

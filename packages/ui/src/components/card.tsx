import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden text-sm text-card-foreground ring-1 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      size: {
        default: "gap-4 py-4 has-data-[slot=card-footer]:pb-0",
        sm: "gap-3 py-3 has-data-[slot=card-footer]:pb-0",
        compact: "gap-2 py-4 has-data-[slot=card-footer]:pb-0",
        none: "gap-0 p-0",
        roomy: "gap-4 p-6",
      },
      tone: {
        default: "rounded-xl bg-card ring-foreground/10",
        plain: "rounded-lg bg-background/90 ring-foreground/10",
        primary: "rounded-xl bg-card ring-primary/10",
        warning:
          "rounded-xl border border-warning/45 bg-warning/10 ring-transparent dark:bg-warning/15",
        success:
          "rounded-xl border border-success/40 bg-success/10 ring-transparent dark:bg-success/15",
        destructive:
          "rounded-xl border border-destructive/40 bg-destructive/[0.08] ring-transparent dark:bg-destructive/[0.14]",
        info: "rounded-xl border border-info/40 bg-info/10 ring-transparent dark:bg-info/15",
      },
    },
    defaultVariants: { size: "default", tone: "default" },
  }
)

const cardTitleVariants = cva("font-heading", {
  variants: {
    variant: {
      default:
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
      metric:
        "truncate text-xs font-medium tracking-wide text-muted-foreground uppercase",
    },
  },
  defaultVariants: { variant: "default" },
})

function Card({
  className,
  size = "default",
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-tone={tone}
      className={cn(cardVariants({ size, tone }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardTitleVariants>) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

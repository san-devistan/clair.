import { cva } from "class-variance-authority"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        success:
          "border-success/30 bg-success/10 text-success-foreground [a]:hover:bg-success/15",
        warning:
          "border-warning/30 bg-warning/10 text-warning-foreground [a]:hover:bg-warning/15",
        info: "border-info/30 bg-info/10 text-info-foreground [a]:hover:bg-info/15",
        "status-danger":
          "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15",
        "status-loading": "border-border bg-muted/40 text-muted-foreground",
        "status-neutral": "border-border bg-muted/50 text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        xs: "h-4 px-1.5 text-xs",
        pill: "h-auto rounded-full px-3 py-1",
        round: "rounded-full",
        status: "max-w-full justify-start px-2.5",
        role: "max-w-32 justify-start px-2.5",
      },
      font: {
        default: "",
        mono: "font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      font: "default",
    },
  }
)

export { badgeVariants }

"use client"

import { cn } from "@workspace/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const tableRowVariants = cva(
  "border-b transition-colors has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
  {
    variants: {
      variant: {
        default: "hover:bg-muted/50",
        muted: "bg-muted/40 hover:bg-muted/40",
        destructive: "bg-destructive/5 hover:bg-destructive/10",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    layout: {
      auto: "",
      fixed: "table-fixed",
    },
    minWidth: {
      none: "",
      sm: "min-w-table-sm",
      md: "min-w-table-md",
    },
  },
  defaultVariants: { layout: "auto", minWidth: "none" },
})

const tableHeadVariants = cva(
  "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      width: {
        auto: "",
        note: "w-table-note",
      },
    },
    defaultVariants: { width: "auto" },
  }
)

const tableCellVariants = cva(
  "align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      variant: {
        default: "",
        numeric: "text-right font-mono font-medium tabular-nums",
        "numeric-strong": "text-right font-mono font-semibold tabular-nums",
        muted: "text-xs text-muted-foreground tabular-nums",
        description: "text-xs leading-relaxed text-muted-foreground",
        strong: "font-medium",
      },
      tone: {
        default: "",
        destructive: "text-destructive",
      },
      spacing: {
        default: "p-2",
        none: "p-0",
        relaxed: "px-2 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "default",
      spacing: "default",
    },
  }
)

function Table({
  className,
  layout,
  minWidth,
  ...props
}: React.ComponentProps<"table"> & VariantProps<typeof tableVariants>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn(tableVariants({ layout, minWidth }), className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  variant,
  ...props
}: React.ComponentProps<"tr"> & VariantProps<typeof tableRowVariants>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(tableRowVariants({ variant }), className)}
      {...props}
    />
  )
}

function TableHead({
  className,
  width,
  ...props
}: React.ComponentProps<"th"> & VariantProps<typeof tableHeadVariants>) {
  return (
    <th
      data-slot="table-head"
      className={cn(tableHeadVariants({ width }), className)}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant,
  tone,
  spacing,
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant, tone, spacing }), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { tabsListVariants } from "@workspace/ui/components/tabs-list-variants"
import { cn } from "@workspace/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"

function Tabs({
  className,
  orientation = "horizontal",
  spacing = "default",
  ...props
}: TabsPrimitive.Root.Props & { spacing?: "default" | "none" }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      data-spacing={spacing}
      className={cn(
        "group/tabs flex gap-2 data-[spacing=none]:gap-0 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  spacing = "default",
  ...props
}: TabsPrimitive.List.Props &
  VariantProps<typeof tabsListVariants> & { spacing?: "default" | "none" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-spacing={spacing}
      className={cn(
        tabsListVariants({ variant }),
        "data-[spacing=none]:p-0",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  size = "default",
  ...props
}: TabsPrimitive.Tab.Props & { size?: "default" | "nav" }) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-size={size}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=nav]:h-9 data-[size=nav]:px-2 data-[size=nav]:md:justify-start dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

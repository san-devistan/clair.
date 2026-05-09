"use client"

import { cn } from "@workspace/ui/lib/utils"

interface StackedChartLegendItem {
  key: string
  label: string
  fill: string
}

interface StackedChartLegendProps {
  items: StackedChartLegendItem[]
  className?: string
  verticalAlign?: "top" | "middle" | "bottom"
}

export function StackedChartLegend({
  items,
  className,
  verticalAlign = "bottom",
}: StackedChartLegendProps) {
  if (items.length === 0) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.fill }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

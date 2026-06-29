import { ClairMark } from "@/components/clair-mark"
import { cn } from "@workspace/ui/lib/utils"

export function ClairBrand({
  className,
  labelClassName,
  markSize = "md",
}: {
  className?: string
  labelClassName?: string
  markSize?: "sm" | "md" | "lg"
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ClairMark size={markSize} />
      <span
        className={cn(
          "font-heading font-semibold tracking-tight",
          markSize === "sm" ? "text-base" : "text-lg",
          labelClassName
        )}
      >
        Clair
      </span>
    </span>
  )
}

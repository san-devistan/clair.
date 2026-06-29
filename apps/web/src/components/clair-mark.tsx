import { cn } from "@workspace/ui/lib/utils"

type ClairMarkSize = "sm" | "md" | "lg"

const MARK_SIZE_CLASS: Record<ClairMarkSize, string> = {
  sm: "size-7 rounded-md",
  md: "size-8 rounded-lg",
  lg: "size-10 rounded-xl",
}

const TEXT_SIZE_CLASS: Record<ClairMarkSize, string> = {
  sm: "-translate-y-[0.5px] text-xs",
  md: "-translate-y-px text-sm",
  lg: "-translate-y-[1.5px] text-base",
}

export function ClairMark({
  className,
  size = "md",
}: {
  className?: string
  size?: ClairMarkSize
}) {
  return (
    <span
      data-slot="clair-mark"
      className={cn(
        "flex shrink-0 items-center justify-center bg-foreground text-background",
        MARK_SIZE_CLASS[size],
        className
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "font-heading leading-none font-bold",
          TEXT_SIZE_CLASS[size]
        )}
      >
        c.
      </span>
    </span>
  )
}

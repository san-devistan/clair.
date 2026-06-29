import { cn } from "@workspace/ui/lib/utils"
import { useMemo } from "react"

export function IdentityMark({
  compact = false,
  label,
  tone = "default",
}: {
  compact?: boolean
  label: string | null | undefined
  tone?: "default" | "accent"
}) {
  const initials = useMemo(() => getInitials(label), [label])

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md text-xs font-medium",
        compact ? "size-7" : "size-8",
        tone === "accent"
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground"
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

function getInitials(value: string | null | undefined) {
  const parts = value?.trim().split(/\s+/).filter(Boolean)

  if (!parts || parts.length === 0) {
    return "C"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

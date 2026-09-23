import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type BillingStatusTone = "active" | "danger" | "loading" | "neutral" | "warning"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"])
const WARNING_SUBSCRIPTION_STATUSES = new Set(["incomplete", "past_due"])
const DANGER_SUBSCRIPTION_STATUSES = new Set(["incomplete_expired", "unpaid"])
const STATUS_TONE_STYLES: Record<
  BillingStatusTone,
  { badge: string; dot: string }
> = {
  active: {
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129_/_0.85)]",
  },
  danger: {
    badge:
      "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15",
    dot: "bg-red-500 shadow-[0_0_8px_rgb(239_68_68_/_0.8)]",
  },
  loading: {
    badge: "border-border bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  neutral: {
    badge: "border-border bg-muted/50 text-muted-foreground",
    dot: "bg-muted-foreground/70",
  },
  warning: {
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500 shadow-[0_0_8px_rgb(245_158_11_/_0.85)]",
  },
}

function BillingStatusBadge({
  label,
  status,
}: {
  label: string
  status: string | undefined
}) {
  const tone = getBillingStatusTone(status)
  const styles = STATUS_TONE_STYLES[tone]

  return (
    <Badge
      variant="outline"
      className={cn("max-w-full justify-start px-2.5", styles.badge)}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", styles.dot)}
      />
      <span className="min-w-0 truncate">{label}</span>
    </Badge>
  )
}

export function BillingStatusInfoRow({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: string | undefined
}) {
  return (
    <section className="flex min-h-12 items-center justify-between gap-4 py-3">
      <p className="shrink-0 font-medium">{label}</p>
      <div className="flex min-w-0 justify-end">
        <BillingStatusBadge label={value} status={status} />
      </div>
    </section>
  )
}

function getBillingStatusTone(status: string | undefined): BillingStatusTone {
  if (!status) {
    return "loading"
  }

  if (ACTIVE_SUBSCRIPTION_STATUSES.has(status)) {
    return "active"
  }

  if (WARNING_SUBSCRIPTION_STATUSES.has(status)) {
    return "warning"
  }

  if (DANGER_SUBSCRIPTION_STATUSES.has(status)) {
    return "danger"
  }

  return "neutral"
}

import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

type BillingStatusTone = "active" | "danger" | "loading" | "neutral" | "warning"

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"])
const WARNING_SUBSCRIPTION_STATUSES = new Set(["incomplete", "past_due"])
const DANGER_SUBSCRIPTION_STATUSES = new Set(["incomplete_expired", "unpaid"])
const STATUS_BADGE_VARIANTS = {
  active: "success",
  danger: "status-danger",
  loading: "status-loading",
  neutral: "status-neutral",
  warning: "warning",
} as const satisfies Record<BillingStatusTone, string>

const STATUS_DOT_CLASSES: Record<BillingStatusTone, string> = {
  active: "bg-success shadow-[0_0_8px_rgb(16_185_129_/_0.85)]",
  danger: "bg-destructive shadow-[0_0_8px_rgb(239_68_68_/_0.8)]",
  loading: "bg-muted-foreground/50",
  neutral: "bg-muted-foreground/70",
  warning: "bg-warning shadow-[0_0_8px_rgb(245_158_11_/_0.85)]",
}

function BillingStatusBadge({
  label,
  status,
}: {
  label: string
  status: string | undefined
}) {
  const tone = getBillingStatusTone(status)

  return (
    <Badge variant={STATUS_BADGE_VARIANTS[tone]} size="status">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          STATUS_DOT_CLASSES[tone]
        )}
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

"use client"

import type { ActionableInsight } from "@/lib/fec/analytics"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

const SEVERITY_CARD_TONES = {
  critical: "destructive",
  warning: "warning",
  info: "info",
  positive: "success",
} as const satisfies Record<ActionableInsight["severity"], string>

const SEVERITY_ICON_CLASSES: Record<ActionableInsight["severity"], string> = {
  critical: "bg-destructive/15 text-destructive dark:bg-destructive/20",
  warning: "bg-warning/15 text-warning-foreground dark:bg-warning/20",
  info: "bg-info/15 text-info-foreground dark:bg-info/20",
  positive: "bg-success/15 text-success-foreground dark:bg-success/20",
}

const CATEGORY_LABELS: Record<ActionableInsight["category"], string> = {
  charges: "Charges",
  ventes: "Ventes",
  tresorerie: "Trésorerie",
  clients: "Clients",
  fournisseurs: "Fournisseurs",
  marge: "Marge",
}

const SEVERITY_ICONS: Record<ActionableInsight["severity"], LucideIcon> = {
  critical: TriangleAlert,
  warning: CircleAlert,
  info: Lightbulb,
  positive: CheckCircle2,
}

export function InsightCard({ insight }: { insight: ActionableInsight }) {
  const Icon = SEVERITY_ICONS[insight.severity]

  return (
    <Card size="sm" tone={SEVERITY_CARD_TONES[insight.severity]}>
      <CardContent>
        <div className="flex items-start gap-3">
          <InsightIcon
            Icon={Icon}
            className={SEVERITY_ICON_CLASSES[insight.severity]}
          />
          <div className="min-w-0 flex-1 space-y-3">
            <InsightSummary insight={insight} />
            <InsightAction action={insight.action} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightIcon({
  Icon,
  className,
}: {
  Icon: LucideIcon
  className: string
}) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        className
      )}
    >
      <Icon className="size-4" />
    </div>
  )
}

function InsightSummary({ insight }: { insight: ActionableInsight }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-heading text-sm font-semibold">{insight.title}</p>
        <Badge variant="outline" size="xs">
          {CATEGORY_LABELS[insight.category]}
        </Badge>
        {insight.metric ? (
          <Badge variant="secondary" size="xs" font="mono">
            {insight.metric}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {insight.description}
      </p>
    </div>
  )
}

function InsightAction({ action }: { action: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs-plus font-medium tracking-wide text-muted-foreground uppercase">
        <ArrowRight className="size-3" />
        Action recommandée
      </p>
      <p className="text-sm">{action}</p>
    </div>
  )
}

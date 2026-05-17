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

const SEVERITY_STYLES: Record<
  ActionableInsight["severity"],
  { card: string; icon: string }
> = {
  critical: {
    card: "border-destructive/45 bg-destructive/[0.08] dark:bg-destructive/[0.14]",
    icon: "text-destructive bg-destructive/15 dark:bg-destructive/20",
  },
  warning: {
    card: "border-amber-500/45 bg-amber-500/[0.1] dark:bg-amber-500/[0.16]",
    icon: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500",
  },
  info: {
    card: "border-blue-500/40 bg-blue-500/[0.08] dark:bg-blue-500/[0.14]",
    icon: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  positive: {
    card: "border-emerald-500/40 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14]",
    icon: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500",
  },
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
  const styles = SEVERITY_STYLES[insight.severity]

  return (
    <Card className={cn("gap-3", styles.card)}>
      <CardContent>
        <div className="flex items-start gap-3">
          <InsightIcon Icon={Icon} className={styles.icon} />
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
        <Badge variant="outline" className="text-[10px]">
          {CATEGORY_LABELS[insight.category]}
        </Badge>
        {insight.metric ? (
          <Badge variant="secondary" className="font-mono text-[10px]">
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
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <ArrowRight className="size-3" />
        Action recommandée
      </p>
      <p className="text-sm">{action}</p>
    </div>
  )
}

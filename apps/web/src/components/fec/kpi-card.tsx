"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react"
import { type ReactNode, createElement } from "react"

export interface KpiCardProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  description?: ReactNode
  hint?: ReactNode
  trend?: {
    direction: "up" | "down" | "neutral"
    text: string
    tone?: "positive" | "negative" | "neutral"
  }
  tone?: "default" | "success" | "warning" | "danger"
  className?: string
  footer?: ReactNode
}

// Tone colors the value itself — the data point — rather than a tinted card
// envelope: keeps the signal exactly where the eye reads the KPI.
const VALUE_TONE_STYLES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "",
  success: "text-emerald-600 dark:text-emerald-500",
  warning: "text-amber-600 dark:text-amber-500",
  danger: "text-destructive",
}

const TREND_STYLES: Record<
  NonNullable<NonNullable<KpiCardProps["trend"]>["tone"]>,
  string
> = {
  positive: "text-emerald-600 dark:text-emerald-500",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

const VALUE_CLASS =
  "font-heading text-3xl font-bold tracking-tight tabular-nums"

function KpiValue({
  label,
  value,
  description,
  tone,
}: {
  label: string
  value: ReactNode
  description?: ReactNode
  tone: NonNullable<KpiCardProps["tone"]>
}) {
  const className = cn(
    VALUE_CLASS,
    VALUE_TONE_STYLES[tone],
    description && "cursor-help [&_*]:pointer-events-none"
  )

  if (!description) return <p className={className}>{value}</p>

  const trigger = createElement(
    "p",
    {
      "aria-label": `Comprendre la statistique : ${label}`,
      className,
    },
    value
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent align="start" className="max-w-64" side="top">
        <div className="leading-relaxed">{description}</div>
      </TooltipContent>
    </Tooltip>
  )
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  description,
  hint,
  trend,
  tone = "default",
  className,
  footer,
}: KpiCardProps) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </CardTitle>
          </div>
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <KpiValue
          label={label}
          value={value}
          description={description}
          tone={tone}
        />
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                TREND_STYLES[trend.tone ?? "neutral"]
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUp className="size-3" />
              ) : trend.direction === "down" ? (
                <ArrowDown className="size-3" />
              ) : (
                <ArrowRight className="size-3" />
              )}
              {trend.text}
            </span>
            {hint ? (
              <span className="text-muted-foreground">· {hint}</span>
            ) : null}
          </div>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
        {footer}
      </CardContent>
    </Card>
  )
}

"use client"

import { DashboardEmptyState } from "@/components/fec/empty-state"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedNumber } from "@/components/fec/formatted-number"
import { InsightCard } from "@/components/fec/insight-card"
import { useFecStore } from "@/lib/fec/store"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  TriangleAlert,
} from "lucide-react"
import { useMemo } from "react"

export const Route = createFileRoute("/dashboard/insights")({
  component: InsightsPage,
})

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  positive: 3,
}

export default function InsightsPage() {
  const { data } = useFecStore()
  if (!data) return <DashboardEmptyState />

  const sorted = [...data.insights].toSorted(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
  )

  const counts = {
    critical: sorted.filter((i) => i.severity === "critical").length,
    warning: sorted.filter((i) => i.severity === "warning").length,
    info: sorted.filter((i) => i.severity === "info").length,
    positive: sorted.filter((i) => i.severity === "positive").length,
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-4 pb-8 md:px-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Actions à mener
        </h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SeverityStat
          label="Critique"
          count={counts.critical}
          description="Nombre d'alertes critiques à traiter en priorité, car elles peuvent fragiliser rapidement la trésorerie ou la rentabilité."
          icon={TriangleAlert}
          tone="danger"
        />
        <SeverityStat
          label="Attention"
          count={counts.warning}
          description="Nombre de points de vigilance à surveiller ou corriger avant qu'ils deviennent critiques."
          icon={CircleAlert}
          tone="warning"
        />
        <SeverityStat
          label="Opportunité"
          count={counts.info}
          description="Nombre d'opportunités d'amélioration détectées dans les revenus, les charges ou les délais."
          icon={Lightbulb}
          tone="info"
        />
        <SeverityStat
          label="Bonne nouvelle"
          count={counts.positive}
          description="Nombre de signaux favorables détectés sur la période, à préserver ou renforcer."
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardHeader>
            <ExplainedCardTitle description="Aucune alerte significative détectée sur la période analysée. Continuez sur cette lancée.">
              Tout va bien
            </ExplainedCardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-500">
              <CheckCircle2 className="size-5 shrink-0" />
              <p>
                Vos indicateurs financiers sont dans les clous : marge correcte,
                pas de concentration excessive, trésorerie saine.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  )
}

function SeverityStat({
  label,
  count,
  description,
  icon: Icon,
  tone,
}: {
  label: string
  count: number
  description: string
  icon: typeof CheckCircle2
  tone: "danger" | "warning" | "info" | "success"
}) {
  const styles: Record<typeof tone, { card: string; text: string }> = {
    danger: {
      card: "border-destructive/45 bg-destructive/[0.08] dark:bg-destructive/[0.14]",
      text: "text-destructive",
    },
    warning: {
      card: "border-amber-500/45 bg-amber-500/[0.1] dark:bg-amber-500/[0.16]",
      text: "text-amber-700 dark:text-amber-500",
    },
    info: {
      card: "border-blue-500/40 bg-blue-500/[0.08] dark:bg-blue-500/[0.14]",
      text: "text-blue-700 dark:text-blue-400",
    },
    success: {
      card: "border-emerald-500/40 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14]",
      text: "text-emerald-700 dark:text-emerald-500",
    },
  }
  const trigger = useMemo(
    () => (
      <p
        aria-label={`Comprendre la statistique : ${label}`}
        className="mt-2 cursor-help font-heading text-3xl font-semibold tabular-nums"
      >
        <FormattedNumber value={count} />
      </p>
    ),
    [count, label]
  )

  return (
    <Card className={`gap-2 ${styles[tone].card}`}>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <Icon className={`size-4 ${styles[tone].text}`} />
        </div>
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent align="start" className="max-w-64" side="top">
            <div className="leading-relaxed">{description}</div>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  )
}

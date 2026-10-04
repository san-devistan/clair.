import { useDashboardHref } from "@/components/fec/dashboard/mode"
import Link from "@/components/link"
import type { ActionableInsight } from "@/lib/fec/analytics"
import { Button } from "@workspace/ui/components/button"
import {
  CircleAlert,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { useMemo } from "react"

type ActionCategory = ActionableInsight["category"]
type ActionSeverity = Exclude<ActionableInsight["severity"], "positive">

const SEVERITY_ORDER: ActionSeverity[] = ["critical", "warning", "info"]

const SEVERITY_LABELS: Record<
  ActionSeverity,
  { singular: string; plural: string }
> = {
  critical: { singular: "critique", plural: "critiques" },
  warning: { singular: "attention", plural: "points d'attention" },
  info: { singular: "opportunité", plural: "opportunités" },
}

const SEVERITY_STYLES = {
  critical: { icon: TriangleAlert, variant: "insight-critical" },
  warning: { icon: CircleAlert, variant: "insight-warning" },
  info: { icon: Lightbulb, variant: "insight-info" },
} as const satisfies Record<
  ActionSeverity,
  { icon: LucideIcon; variant: string }
>

interface ActionSummaryLinkProps {
  insights: ActionableInsight[]
  categories: readonly ActionCategory[]
}

export function ActionSummaryLink({
  insights,
  categories,
}: ActionSummaryLinkProps) {
  const counts = countActions(insights, categories)
  const label = formatActionSummary(counts)
  const dominantSeverity = getDominantSeverity(counts)
  const insightsHref = useDashboardHref("/insights")
  const insightsLink = useMemo(
    () => <Link href={insightsHref} />,
    [insightsHref]
  )

  if (!label || !dominantSeverity) return null

  const style = SEVERITY_STYLES[dominantSeverity]
  const Icon = style.icon

  return (
    <Button
      aria-label={`Voir les actions à mener : ${label}`}
      variant={style.variant}
      size="sm"
      render={insightsLink}
    >
      <Icon data-icon="inline-start" />
      {label}
    </Button>
  )
}

function countActions(
  insights: ActionableInsight[],
  categories: readonly ActionCategory[]
): Record<ActionSeverity, number> {
  const categorySet = new Set(categories)
  const counts: Record<ActionSeverity, number> = {
    critical: 0,
    warning: 0,
    info: 0,
  }

  for (const insight of insights) {
    if (insight.severity === "positive") continue
    if (!categorySet.has(insight.category)) continue
    counts[insight.severity] += 1
  }

  return counts
}

function formatActionSummary(counts: Record<ActionSeverity, number>): string {
  return SEVERITY_ORDER.flatMap((severity) => {
    const count = counts[severity]
    if (count === 0) return []

    const labels = SEVERITY_LABELS[severity]
    return `${String(count)} ${count > 1 ? labels.plural : labels.singular}`
  }).join(" · ")
}

function getDominantSeverity(
  counts: Record<ActionSeverity, number>
): ActionSeverity | null {
  return SEVERITY_ORDER.find((severity) => counts[severity] > 0) ?? null
}

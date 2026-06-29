import Link from "@/components/link"
import type { ActionableInsight } from "@/lib/fec/analytics"
import { Button } from "@workspace/ui/components/button"
import {
  CircleAlert,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

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

const SEVERITY_STYLES: Record<
  ActionSeverity,
  { icon: LucideIcon; className: string }
> = {
  critical: {
    icon: TriangleAlert,
    className:
      "border-destructive/45 bg-destructive/[0.08] text-destructive hover:bg-destructive/[0.12] dark:bg-destructive/[0.14] dark:hover:bg-destructive/[0.18]",
  },
  warning: {
    icon: CircleAlert,
    className:
      "border-amber-500/45 bg-amber-500/[0.1] text-amber-700 hover:bg-amber-500/[0.14] dark:bg-amber-500/[0.16] dark:text-amber-500 dark:hover:bg-amber-500/20",
  },
  info: {
    icon: Lightbulb,
    className:
      "border-blue-500/40 bg-blue-500/[0.08] text-blue-700 hover:bg-blue-500/[0.12] dark:bg-blue-500/[0.14] dark:text-blue-400 dark:hover:bg-blue-500/[0.18]",
  },
}

const INSIGHTS_LINK = <Link href="/dashboard/insights" />

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

  if (!label || !dominantSeverity) return null

  const style = SEVERITY_STYLES[dominantSeverity]
  const Icon = style.icon

  return (
    <Button
      aria-label={`Voir les actions à mener : ${label}`}
      className={`h-auto min-h-7 max-w-full whitespace-normal sm:whitespace-nowrap ${style.className}`}
      variant="outline"
      size="sm"
      render={INSIGHTS_LINK}
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

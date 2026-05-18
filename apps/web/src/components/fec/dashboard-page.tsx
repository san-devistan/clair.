import { ActionSummaryLink } from "@/components/fec/action-summary-link"
import type { ActionableInsight } from "@/lib/fec/analytics"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

type DashboardActionCategory = ActionableInsight["category"]

interface DashboardPageProps {
  title: string
  titleMeta?: ReactNode
  insights?: ActionableInsight[]
  actionCategories?: readonly DashboardActionCategory[]
  maxWidthClassName?: string
  className?: string
  children: ReactNode
}

export const DASHBOARD_PAGE_FALLBACK = (
  <div className="flex min-h-[60svh] items-center justify-center text-sm text-muted-foreground">
    Chargement…
  </div>
)

export function DashboardPage({
  title,
  titleMeta,
  insights,
  actionCategories,
  maxWidthClassName = "max-w-7xl",
  className,
  children,
}: DashboardPageProps) {
  const actionSummary =
    insights && actionCategories && actionCategories.length > 0 ? (
      <ActionSummaryLink insights={insights} categories={actionCategories} />
    ) : null

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6 px-4 pt-4 pb-8 md:px-6",
        maxWidthClassName,
        className
      )}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          {titleMeta}
        </div>
        {actionSummary}
      </header>

      {children}
    </div>
  )
}

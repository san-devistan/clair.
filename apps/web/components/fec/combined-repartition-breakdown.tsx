"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useTheme } from "next-themes"
import { Fragment, useMemo, useState } from "react"

import type { ChartColorMode } from "@/components/fec/bar-chart-style"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import {
  buildRepartitionGroups,
  computePositiveGroupTotal,
  type RepartitionGroup,
  type RepartitionVariant,
  selectionResetKey,
} from "@/components/fec/repartition-data"
import {
  GroupRows,
  RepartitionChart,
} from "@/components/fec/repartition-section"
import type { AccountDetail } from "@/lib/fec/account-details"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

interface CombinedRepartitionBreakdownProps {
  revenueCategories: CategoryBreakdown[]
  revenueDetails: AccountDetail[]
  expenseCategories: CategoryBreakdown[]
  expenseDetails: AccountDetail[]
  emptyLabel?: string
}

interface RepartitionSeries {
  label: string
  variant: RepartitionVariant
  groups: RepartitionGroup[]
}

interface RepartitionSelection {
  variant: RepartitionVariant
  groupKey: string
}

export function CombinedRepartitionBreakdown({
  revenueCategories,
  revenueDetails,
  expenseCategories,
  expenseDetails,
  emptyLabel = "Pas assez de données pour calculer le résultat.",
}: CombinedRepartitionBreakdownProps) {
  const { resolvedTheme } = useTheme()
  const colorMode: ChartColorMode = resolvedTheme === "dark" ? "dark" : "light"
  const revenueGroups = useMemo(
    () =>
      buildRepartitionGroups(
        revenueCategories,
        revenueDetails,
        "revenue",
        colorMode
      ),
    [colorMode, revenueCategories, revenueDetails]
  )
  const expenseGroups = useMemo(
    () =>
      buildRepartitionGroups(
        expenseCategories,
        expenseDetails,
        "expenses",
        colorMode
      ),
    [colorMode, expenseCategories, expenseDetails]
  )
  const resetKey = useMemo(
    () =>
      `${selectionResetKey(revenueGroups)}::${selectionResetKey(expenseGroups)}`,
    [expenseGroups, revenueGroups]
  )

  if (revenueGroups.length === 0 && expenseGroups.length === 0)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )

  const series: RepartitionSeries[] = [
    { label: "Revenus", variant: "revenue", groups: revenueGroups },
    { label: "Charges", variant: "expenses", groups: expenseGroups },
  ]

  return (
    <TooltipProvider>
      <CombinedRepartitionInteractive key={resetKey} series={series} />
    </TooltipProvider>
  )
}

function CombinedRepartitionInteractive({
  series,
}: {
  series: RepartitionSeries[]
}) {
  const [selection, setSelection] = useState<RepartitionSelection | null>(null)
  const toggleGroup = (variant: RepartitionVariant, groupKey: string) => {
    setSelection((current) =>
      current?.variant === variant && current.groupKey === groupKey
        ? null
        : { variant, groupKey }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {series.map((item) => (
          <RepartitionChart
            key={item.variant}
            groups={item.groups}
            selectedGroupKey={
              selection?.variant === item.variant ? selection.groupKey : null
            }
            onToggleGroup={(groupKey) => toggleGroup(item.variant, groupKey)}
            variant={item.variant}
          />
        ))}
      </div>
      <RepartitionMergedTable
        series={series}
        selection={selection}
        onToggleGroup={toggleGroup}
      />
    </div>
  )
}

function RepartitionMergedTable({
  series,
  selection,
  onToggleGroup,
}: {
  series: RepartitionSeries[]
  selection: RepartitionSelection | null
  onToggleGroup: (variant: RepartitionVariant, groupKey: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Libellé</TableHead>
            <TableHead className="w-24 text-right">Part</TableHead>
            <TableHead className="w-28 text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {series.map((item) =>
            item.groups.length > 0 ? (
              <Fragment key={item.variant}>
                <SeriesHeaderRow series={item} />
                {item.groups.map((group) => (
                  <GroupRows
                    key={`${item.variant}-${group.key}`}
                    group={group}
                    selected={
                      selection?.variant === item.variant &&
                      selection.groupKey === group.key
                    }
                    onToggleGroup={(groupKey) =>
                      onToggleGroup(item.variant, groupKey)
                    }
                    total={computePositiveGroupTotal(item.groups)}
                  />
                ))}
              </Fragment>
            ) : null
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function SeriesHeaderRow({ series }: { series: RepartitionSeries }) {
  const accent =
    series.variant === "revenue"
      ? "text-[var(--revenue)]"
      : "text-[var(--expense)]"
  const fill =
    series.variant === "revenue" ? "var(--revenue)" : "var(--expense)"

  return (
    <TableRow className="bg-muted/40 hover:bg-muted/40">
      <TableCell colSpan={3} className="py-2">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide uppercase">
          <span className={cn("flex min-w-0 items-center gap-2", accent)}>
            <span
              aria-hidden
              className="block size-2.5 shrink-0 rounded-full"
              style={{ background: fill }}
            />
            <span className="min-w-0 truncate">{series.label}</span>
          </span>
          <span className="font-mono text-foreground tabular-nums">
            <FormattedCurrency
              value={computePositiveGroupTotal(series.groups)}
            />
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

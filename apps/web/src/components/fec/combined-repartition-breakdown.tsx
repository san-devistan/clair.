"use client"

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
import { Fragment, useCallback, useMemo, useState } from "react"

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
  const resetKey = `${selectionResetKey(revenueGroups)}::${selectionResetKey(expenseGroups)}`
  const series = useMemo<RepartitionSeries[]>(
    () => [
      { label: "Revenus", variant: "revenue", groups: revenueGroups },
      { label: "Charges", variant: "expenses", groups: expenseGroups },
    ],
    [expenseGroups, revenueGroups]
  )

  if (revenueGroups.length === 0 && expenseGroups.length === 0)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )

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
  const toggleGroup = useCallback(
    (variant: RepartitionVariant, groupKey: string) => {
      setSelection((current) =>
        current?.variant === variant && current.groupKey === groupKey
          ? null
          : { variant, groupKey }
      )
    },
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {series.map((item) => (
          <CombinedSeriesChart
            key={item.variant}
            item={item}
            selection={selection}
            onToggleGroup={toggleGroup}
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

function CombinedSeriesChart({
  item,
  selection,
  onToggleGroup,
}: {
  item: RepartitionSeries
  selection: RepartitionSelection | null
  onToggleGroup: (variant: RepartitionVariant, groupKey: string) => void
}) {
  const selectedGroupKey =
    selection?.variant === item.variant ? selection.groupKey : null
  const toggleSeriesGroup = useCallback(
    (groupKey: string) => onToggleGroup(item.variant, groupKey),
    [item.variant, onToggleGroup]
  )

  return (
    <RepartitionChart
      groups={item.groups}
      selectedGroupKey={selectedGroupKey}
      onToggleGroup={toggleSeriesGroup}
      variant={item.variant}
    />
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
  const totals = useMemo(
    () =>
      new Map(
        series.map((item) => [
          item.variant,
          computePositiveGroupTotal(item.groups),
        ])
      ),
    [series]
  )

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
                  <MergedGroupRows
                    key={`${item.variant}-${group.key}`}
                    variant={item.variant}
                    group={group}
                    selected={
                      selection?.variant === item.variant &&
                      selection.groupKey === group.key
                    }
                    onToggleGroup={onToggleGroup}
                    total={totals.get(item.variant) ?? 0}
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

function MergedGroupRows({
  variant,
  group,
  selected,
  onToggleGroup,
  total,
}: {
  variant: RepartitionVariant
  group: RepartitionGroup
  selected: boolean
  onToggleGroup: (variant: RepartitionVariant, groupKey: string) => void
  total: number
}) {
  const toggleGroup = useCallback(
    (groupKey: string) => onToggleGroup(variant, groupKey),
    [onToggleGroup, variant]
  )

  return (
    <GroupRows
      group={group}
      selected={selected}
      onToggleGroup={toggleGroup}
      total={total}
    />
  )
}

function SeriesHeaderRow({ series }: { series: RepartitionSeries }) {
  const accent =
    series.variant === "revenue"
      ? "text-[var(--revenue)]"
      : "text-[var(--expense)]"
  const fill =
    series.variant === "revenue" ? "var(--revenue)" : "var(--expense)"
  const markerStyle = useMemo(() => ({ background: fill }), [fill])

  return (
    <TableRow className="bg-muted/40 hover:bg-muted/40">
      <TableCell colSpan={3} className="py-2">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide uppercase">
          <span className={cn("flex min-w-0 items-center gap-2", accent)}>
            <span
              aria-hidden
              className="block size-2.5 shrink-0 rounded-full"
              style={markerStyle}
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

/* oxlint-disable eslint/max-lines */
"use client"

import type { ChartColorMode } from "@/components/fec/bar-chart-style"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { OverflowTooltip } from "@/components/fec/overflow-tooltip"
import {
  buildMainSegments,
  buildRepartitionGroups,
  type ChartSegment,
  computePositiveGroupTotal,
  type InteractiveSegment,
  type RepartitionGroup,
  type RepartitionVariant,
  selectionResetKey,
} from "@/components/fec/repartition-data"
import { StackedSegmentBar } from "@/components/fec/stacked-segment-bar"
import type { AccountDetail } from "@/lib/fec/account-details"
import type { CategoryBreakdown } from "@/lib/fec/analytics"
import { formatPercent } from "@/lib/fec/format"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
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
import { ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useMemo, useState } from "react"

interface RepartitionSectionProps {
  title: string
  description: string
  categories: CategoryBreakdown[]
  details: AccountDetail[]
  variant: RepartitionVariant
  emptyLabel: string
}

export function RepartitionSection({
  title,
  description,
  categories,
  details,
  variant,
  emptyLabel,
}: RepartitionSectionProps) {
  const { resolvedTheme } = useTheme()
  const colorMode: ChartColorMode = resolvedTheme === "dark" ? "dark" : "light"
  const groups = useMemo(
    () => buildRepartitionGroups(categories, details, variant, colorMode),
    [categories, colorMode, details, variant]
  )
  const resetKey = useMemo(() => selectionResetKey(groups), [groups])

  return (
    <Card>
      <CardHeader>
        <ExplainedCardTitle description={description}>
          {title}
        </ExplainedCardTitle>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <TooltipProvider>
            <RepartitionInteractive
              key={resetKey}
              groups={groups}
              variant={variant}
            />
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}

function RepartitionInteractive({
  groups,
  variant,
}: {
  groups: RepartitionGroup[]
  variant: RepartitionVariant
}) {
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)
  const toggleGroup = useCallback((groupKey: string) => {
    setSelectedGroupKey((current) => (current === groupKey ? null : groupKey))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <RepartitionChart
        groups={groups}
        selectedGroupKey={selectedGroupKey}
        onToggleGroup={toggleGroup}
        variant={variant}
      />
      <RepartitionTable
        groups={groups}
        selectedGroupKey={selectedGroupKey}
        onToggleGroup={toggleGroup}
      />
    </div>
  )
}

export function RepartitionChart({
  groups,
  selectedGroupKey,
  onToggleGroup,
  variant,
}: {
  groups: RepartitionGroup[]
  selectedGroupKey: string | null
  onToggleGroup: (groupKey: string) => void
  variant: RepartitionVariant
}) {
  const total = computePositiveGroupTotal(groups)
  const label = variant === "revenue" ? "Revenus" : "Charges"
  const accent =
    variant === "revenue" ? "text-[var(--revenue)]" : "text-[var(--expense)]"
  const segments = buildMainSegments(groups, selectedGroupKey, total)
  const toggleSegment = useCallback(
    (segment: InteractiveSegment) => onToggleGroup(segment.groupKey),
    [onToggleGroup]
  )
  const getSegmentAriaLabel = useCallback(
    (segment: InteractiveSegment) =>
      selectedGroupKey !== null && segment.groupKey === selectedGroupKey
        ? `Masquer le détail de ${segment.groupLabel}`
        : `Afficher le détail de ${segment.groupLabel}`,
    [selectedGroupKey]
  )
  const getSegmentPressed = useCallback(
    (segment: InteractiveSegment) =>
      selectedGroupKey !== null && segment.groupKey === selectedGroupKey,
    [selectedGroupKey]
  )
  const renderSegmentTooltip = useCallback(
    (segment: InteractiveSegment) => <RepartitionTooltip segment={segment} />,
    []
  )

  if (total <= 0)
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucun montant positif à représenter
      </p>
    )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            accent
          )}
        >
          {label}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          <FormattedCurrency value={total} />
        </span>
      </div>
      <StackedSegmentBar
        segments={segments}
        ariaLabel={`Répartition des ${label.toLowerCase()} par catégorie`}
        role="group"
        onSegmentClick={toggleSegment}
        getSegmentAriaLabel={getSegmentAriaLabel}
        getSegmentPressed={getSegmentPressed}
        getTooltipContent={renderSegmentTooltip}
      />
    </div>
  )
}

function RepartitionTooltip({ segment }: { segment: InteractiveSegment }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-semibold">{segment.label}</span>
      <SegmentTooltipMeta segment={segment} />
      <span className="font-mono tabular-nums opacity-80">
        {formatPercent(segment.share)} ·{" "}
        <FormattedCurrency value={segment.amount} tooltip={false} />
      </span>
    </div>
  )
}

function SegmentTooltipMeta({ segment }: { segment: ChartSegment }) {
  if (segment.accountNum)
    return (
      <span className="font-mono text-[10px] opacity-70">
        {segment.accountNum}
        {segment.auxNum ? ` · ${segment.auxNum}` : ""}
      </span>
    )

  if (segment.detailCount === 0) return null

  return (
    <span className="text-[10px] opacity-70">
      {String(segment.detailCount)} poste
      {segment.detailCount > 1 ? "s" : ""}
    </span>
  )
}

function RepartitionTable({
  groups,
  selectedGroupKey,
  onToggleGroup,
}: {
  groups: RepartitionGroup[]
  selectedGroupKey: string | null
  onToggleGroup: (groupKey: string) => void
}) {
  const total = computePositiveGroupTotal(groups)

  return (
    <div className="rounded-md border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Libellé</TableHead>
            <TableHead className="w-24 text-right">Part</TableHead>
            <TableHead className="w-28 text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <GroupRows
              key={group.key}
              group={group}
              selected={group.key === selectedGroupKey}
              onToggleGroup={onToggleGroup}
              total={total}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function GroupRows({
  group,
  selected,
  onToggleGroup,
  total,
}: {
  group: RepartitionGroup
  selected: boolean
  onToggleGroup: (groupKey: string) => void
  total: number
}) {
  const toggleGroup = useCallback(
    () => onToggleGroup(group.key),
    [group.key, onToggleGroup]
  )
  const Chevron = selected ? ChevronUp : ChevronDown
  const ariaLabel = selected
    ? `Masquer le détail de ${group.label}`
    : `Afficher le détail de ${group.label}`
  const markerStyle = useMemo(() => ({ background: group.fill }), [group.fill])

  return (
    <>
      <TableRow>
        <TableCell colSpan={3} className="p-0">
          <button
            type="button"
            aria-label={ariaLabel}
            aria-expanded={selected}
            onClick={toggleGroup}
            className={cn(
              "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_6rem_7rem] items-center gap-2 bg-muted/30 p-2 text-left transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              selected && "bg-primary/[0.08] hover:bg-primary/[0.1]"
            )}
          >
            <span className="flex min-w-0 items-center gap-2 font-medium">
              <Chevron
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span
                aria-hidden
                className="block size-2.5 shrink-0 rounded-full"
                style={markerStyle}
              />
              <span className="min-w-0 truncate">{group.label}</span>
              {selected ? (
                <Badge variant="secondary" className="text-[10px]">
                  Détail
                </Badge>
              ) : null}
            </span>
            <span className="text-right text-muted-foreground tabular-nums">
              {formatPercent(group.share)}
            </span>
            <span className="text-right font-mono font-medium tabular-nums">
              <FormattedCurrency value={group.amount} />
            </span>
          </button>
        </TableCell>
      </TableRow>
      {selected
        ? group.details.map((detail) => (
            <DetailRow key={detail.id} detail={detail} total={total} />
          ))
        : null}
    </>
  )
}

function DetailRow({
  detail,
  total,
}: {
  detail: AccountDetail
  total: number
}) {
  const share = total > 0 ? (detail.amount / total) * 100 : 0
  const isNegative = detail.amount < 0

  return (
    <TableRow className={cn(isNegative && "bg-destructive/5")}>
      <TableCell className="whitespace-normal">
        <div className="flex min-w-0 gap-3 pl-5">
          <span className="mt-2 h-6 w-px shrink-0 bg-border" aria-hidden />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <OverflowTooltip
                text={detail.label}
                className="font-medium text-foreground"
              />
              {isNegative ? (
                <Badge variant="destructive" className="text-[10px]">
                  À vérifier
                </Badge>
              ) : null}
            </div>
            <DetailMeta detail={detail} />
          </div>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          "text-right text-xs text-muted-foreground tabular-nums",
          isNegative && "text-destructive"
        )}
      >
        {formatPercent(share)}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono font-medium tabular-nums",
          isNegative && "text-destructive"
        )}
      >
        <FormattedCurrency value={detail.amount} />
      </TableCell>
    </TableRow>
  )
}

function DetailMeta({ detail }: { detail: AccountDetail }) {
  const code = [detail.accountNum, detail.auxNum].filter(Boolean).join(" · ")
  const label =
    detail.accountLabel && detail.accountLabel !== detail.label
      ? detail.accountLabel
      : code

  if (!label) return null

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <OverflowTooltip text={label} wrapperClassName="max-w-[320px]" />
      {label !== code && code ? (
        <span className="font-mono text-[10px]">{code}</span>
      ) : null}
    </div>
  )
}

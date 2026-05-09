"use client"

import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

import {
  OTHER_SEGMENT_LABEL,
  SMALL_SEGMENT_SHARE_THRESHOLD,
  STACKED_BAR_CONTAINER_CLASS,
} from "@/components/fec/bar-chart-style"
import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { OverflowTooltip } from "@/components/fec/overflow-tooltip"
import type { AccountDetail } from "@/lib/fec/account-details"
import { formatPercent } from "@/lib/fec/format"

type AccountDetailVariant = "revenue" | "expenses"

interface AccountDetailSectionProps {
  items: AccountDetail[]
  variant: AccountDetailVariant
  emptyLabel: string
}

interface ChartSegment {
  id: string
  label: string
  amount: number
  share: number
  fill: string
  detailCount: number
  accountNum?: string
  auxNum?: string
}

const MIN_INLINE_SHARE = 8

const REVENUE_RAMP = [
  "var(--revenue-5)",
  "var(--revenue-4)",
  "var(--revenue-3)",
  "var(--revenue-2)",
  "var(--revenue-1)",
]

const EXPENSE_RAMP = [
  "var(--expense-5)",
  "var(--expense-4)",
  "var(--expense-3)",
  "var(--expense-2)",
  "var(--expense-1)",
]

export function AccountDetailSection({
  items,
  variant,
  emptyLabel,
}: AccountDetailSectionProps) {
  const positiveTotal = computePositiveTotal(items)
  const segments = buildChartSegments(items, positiveTotal, variant)

  if (items.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <AccountDetailBar
          segments={segments}
          total={positiveTotal}
          variant={variant}
        />
        <AccountDetailTable items={items} positiveTotal={positiveTotal} />
      </div>
    </TooltipProvider>
  )
}

function computePositiveTotal(items: AccountDetail[]): number {
  return items.reduce((sum, item) => {
    if (item.amount <= 0) return sum
    return sum + item.amount
  }, 0)
}

function buildChartSegments(
  items: AccountDetail[],
  positiveTotal: number,
  variant: AccountDetailVariant
): ChartSegment[] {
  if (positiveTotal <= 0) return []

  const ramp = variant === "revenue" ? REVENUE_RAMP : EXPENSE_RAMP
  const segments: ChartSegment[] = []
  let otherAmount = 0
  let otherCount = 0

  for (const item of items) {
    if (item.amount <= 0) continue

    const share = (item.amount / positiveTotal) * 100
    if (share < SMALL_SEGMENT_SHARE_THRESHOLD) {
      otherAmount += item.amount
      otherCount += 1
      continue
    }

    segments.push({
      id: item.id,
      label: item.label,
      amount: item.amount,
      share,
      fill: ramp[segments.length % ramp.length]!,
      detailCount: 1,
      accountNum: item.accountNum,
      auxNum: item.auxNum,
    })
  }

  if (otherAmount > 0) {
    segments.push({
      id: "other",
      label: OTHER_SEGMENT_LABEL,
      amount: otherAmount,
      share: (otherAmount / positiveTotal) * 100,
      fill: "var(--muted-foreground)",
      detailCount: otherCount,
    })
  }

  return segments
}

function AccountDetailBar({
  segments,
  total,
  variant,
}: {
  segments: ChartSegment[]
  total: number
  variant: AccountDetailVariant
}) {
  const label = variant === "revenue" ? "Revenus" : "Charges"
  const accent =
    variant === "revenue" ? "text-[var(--revenue)]" : "text-[var(--expense)]"

  if (segments.length === 0)
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
      <div
        className={STACKED_BAR_CONTAINER_CLASS}
        role="img"
        aria-label={`Répartition des ${label.toLowerCase()} par détail comptable`}
      >
        {segments.map((segment, idx) => (
          <ChartSegmentBlock
            key={segment.id}
            segment={segment}
            isFirst={idx === 0}
          />
        ))}
      </div>
    </div>
  )
}

function ChartSegmentBlock({
  segment,
  isFirst,
}: {
  segment: ChartSegment
  isFirst: boolean
}) {
  const showInline = segment.share >= MIN_INLINE_SHARE

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            style={{
              width: `${String(segment.share)}%`,
              background: segment.fill,
            }}
            className={cn(
              "flex min-w-0 cursor-default items-center justify-center px-2 text-center transition-all",
              !isFirst && "border-l-2 border-background/60"
            )}
          />
        }
      >
        {showInline ? (
          <span className="max-w-full truncate text-xs font-semibold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:text-sm">
            {segment.label}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-semibold">{segment.label}</span>
          {segment.accountNum ? (
            <span className="font-mono text-[10px] opacity-70">
              {segment.accountNum}
              {segment.auxNum ? ` · ${segment.auxNum}` : ""}
            </span>
          ) : (
            <span className="text-[10px] opacity-70">
              <FormattedNumber value={segment.detailCount} tooltip={false} />{" "}
              postes
            </span>
          )}
          <span className="font-mono tabular-nums opacity-80">
            {formatPercent(segment.share)} ·{" "}
            <FormattedCurrency value={segment.amount} tooltip={false} />
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function AccountDetailTable({
  items,
  positiveTotal,
}: {
  items: AccountDetail[]
  positiveTotal: number
}) {
  return (
    <div className="rounded-md border">
      <Table className="min-w-[720px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] text-left">Libellé</TableHead>
            <TableHead className="w-[180px] text-left">Catégorie</TableHead>
            <TableHead aria-hidden="true" className="w-auto p-0" />
            <TableHead className="w-24 text-right">Part</TableHead>
            <TableHead className="w-28 text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <AccountDetailRow
              key={item.id}
              item={item}
              positiveTotal={positiveTotal}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AccountDetailRow({
  item,
  positiveTotal,
}: {
  item: AccountDetail
  positiveTotal: number
}) {
  const share = positiveTotal > 0 ? (item.amount / positiveTotal) * 100 : 0
  const isNegative = item.amount < 0

  return (
    <TableRow className={cn(isNegative && "bg-destructive/5")}>
      <TableCell className="text-left">
        <div className="flex max-w-[276px] flex-col gap-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <OverflowTooltip
              text={item.label}
              className="font-medium text-foreground"
            />
            {isNegative ? (
              <Badge variant="destructive" className="text-[10px]">
                À vérifier
              </Badge>
            ) : null}
          </div>
          {item.accountLabel && item.accountLabel !== item.label ? (
            <OverflowTooltip
              text={item.accountLabel}
              className="text-xs text-muted-foreground"
            />
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-left">
        {item.categoryLabel ? <CategoryBadge item={item} /> : null}
      </TableCell>
      <TableCell aria-hidden="true" className="p-0" />
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
        <FormattedCurrency value={item.amount} />
      </TableCell>
    </TableRow>
  )
}

function CategoryBadge({ item }: { item: AccountDetail }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent text-[10px]"
      style={{
        backgroundColor: item.categoryFill,
        color: "white",
      }}
    >
      {item.categoryLabel}
    </Badge>
  )
}

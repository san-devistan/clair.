"use client"

import {
  FormattedCurrency,
  FormattedNumber,
} from "@/components/fec/formatted-number"
import { OverflowTooltip } from "@/components/fec/overflow-tooltip"
import type {
  AgedBalance,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
} from "@/lib/fec/analytics"
import { formatNumber } from "@/lib/fec/format"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useMemo } from "react"

type CounterpartyVariant = "clients" | "suppliers"

interface CounterpartyTableProps {
  aging: AgedBalance
  variant: CounterpartyVariant
}

interface CounterpartyTableLabels {
  notDue: string
  overdue: string
  total: string
}

interface CounterpartyRowModel {
  accountNum: string
  label: string
  status: AgedBalanceCounterparty
}

const AGING_BUCKET_COLOR: Record<AgedBalanceBucketKey, string> = {
  notDue: "var(--bar-neutral)",
  "0_30": "var(--expense-1)",
  "31_60": "var(--expense-3)",
  "60plus": "var(--expense-5)",
}

const AGING_SORT_RANK: Record<AgedBalanceBucketKey, number> = {
  "60plus": 0,
  "31_60": 1,
  "0_30": 2,
  notDue: 3,
}

const LABELS: Record<CounterpartyVariant, CounterpartyTableLabels> = {
  clients: {
    notDue: "À venir",
    overdue: "À relancer",
    total: "Total",
  },
  suppliers: {
    notDue: "À venir",
    overdue: "À payer",
    total: "Total",
  },
}

export function CounterpartyTable({ aging, variant }: CounterpartyTableProps) {
  const labels = LABELS[variant]
  const rows = buildCounterpartyRows(aging)

  if (rows.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucune donnée à afficher
      </p>
    )

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table className="min-w-[960px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] text-left">Libellé</TableHead>
              <TableHead className="w-[180px] text-left">Catégorie</TableHead>
              <TableHead className="w-[120px] text-center">Factures</TableHead>
              <TableHead className="w-24 text-center">Retard</TableHead>
              <TableHead aria-hidden="true" className="w-auto p-0" />
              <TableHead className="w-24 text-right">{labels.notDue}</TableHead>
              <TableHead className="w-24 text-right">
                {labels.overdue}
              </TableHead>
              <TableHead className="w-24 text-right">{labels.total}</TableHead>
            </TableRow>
          </TableHeader>
          <CounterpartyTableBody rows={rows} />
        </Table>
      </div>
    </TooltipProvider>
  )
}

function buildCounterpartyRows(aging: AgedBalance): CounterpartyRowModel[] {
  const rows: CounterpartyRowModel[] = []

  for (const status of aging.counterparties) {
    if (status.totalAmount <= 0) continue
    rows.push({
      accountNum: status.accountNum,
      label: status.label,
      status,
    })
  }

  return rows.toSorted(sortCounterpartyRows)
}

function sortCounterpartyRows(
  a: CounterpartyRowModel,
  b: CounterpartyRowModel
): number {
  const aRank = AGING_SORT_RANK[a.status.worstBucketKey]
  const bRank = AGING_SORT_RANK[b.status.worstBucketKey]
  if (aRank !== bRank) return aRank - bRank

  const aAmount = amountForCategorySort(a.status)
  const bAmount = amountForCategorySort(b.status)
  if (aAmount !== bAmount) return bAmount - aAmount

  return a.label.localeCompare(b.label, "fr")
}

function amountForCategorySort(status: AgedBalanceCounterparty): number {
  if (status.overdueAmount > 0) return status.overdueAmount
  return status.totalAmount
}

function CounterpartyTableBody({ rows }: { rows: CounterpartyRowModel[] }) {
  return (
    <TableBody>
      {rows.map((row) => (
        <CounterpartyTableRow key={row.accountNum} row={row} />
      ))}
    </TableBody>
  )
}

function CounterpartyTableRow({ row }: { row: CounterpartyRowModel }) {
  const notDueAmount = Math.max(
    0,
    row.status.totalAmount - row.status.overdueAmount
  )

  return (
    <TableRow>
      <TableCell className="text-left">
        <CounterpartyLabel row={row} />
      </TableCell>
      <TableCell className="text-left">
        <AgingStatusBadge status={row.status} />
      </TableCell>
      <TableCell className="text-center text-muted-foreground tabular-nums">
        <FormattedNumber value={row.status.invoiceCount} />
      </TableCell>
      <TableCell className="text-center text-xs text-muted-foreground">
        <CounterpartyDelay status={row.status} />
      </TableCell>
      <TableCell aria-hidden="true" className="p-0" />
      <TableCell className="text-right font-mono text-xs tabular-nums">
        <CurrencyOrDash value={notDueAmount} />
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        <OverdueAmount status={row.status} />
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        <FormattedCurrency value={row.status.totalAmount} />
      </TableCell>
    </TableRow>
  )
}

function CounterpartyLabel({ row }: { row: CounterpartyRowModel }) {
  return (
    <div className="max-w-[196px]">
      <OverflowTooltip
        text={row.label}
        className="font-medium text-foreground"
      />
    </div>
  )
}

function AgingStatusBadge({ status }: { status: AgedBalanceCounterparty }) {
  const badgeStyle = useMemo(
    () => ({
      backgroundColor: AGING_BUCKET_COLOR[status.worstBucketKey],
      color: "white",
    }),
    [status.worstBucketKey]
  )

  return (
    <Badge
      variant="outline"
      className="border-transparent text-[10px]"
      style={badgeStyle}
    >
      {status.worstBucketLabel}
    </Badge>
  )
}

function CounterpartyDelay({ status }: { status: AgedBalanceCounterparty }) {
  const delayStyle = useMemo(
    () => ({ color: AGING_BUCKET_COLOR[status.worstBucketKey] }),
    [status.worstBucketKey]
  )

  if (status.worstBucketKey === "notDue")
    return (
      <span className="text-muted-foreground tabular-nums" title="Non échu">
        -
      </span>
    )

  const days = Math.max(0, status.oldestDaysOverdue)
  return (
    <span
      className="font-medium tabular-nums"
      style={delayStyle}
      title={`Retard le plus ancien : ${formatNumber(days)} j`}
    >
      {formatNumber(days)} j
    </span>
  )
}

function OverdueAmount({ status }: { status: AgedBalanceCounterparty }) {
  const amountStyle = useMemo(
    () => ({ color: AGING_BUCKET_COLOR[status.worstBucketKey] }),
    [status.worstBucketKey]
  )

  if (status.overdueAmount <= 0)
    return <span className="text-muted-foreground">-</span>

  return (
    <span style={amountStyle}>
      <FormattedCurrency value={status.overdueAmount} />
    </span>
  )
}

function CurrencyOrDash({ value }: { value: number }) {
  if (value <= 0) return <span className="text-muted-foreground">-</span>
  return <FormattedCurrency value={value} />
}

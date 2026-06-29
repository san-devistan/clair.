"use client"

import { FormattedCurrency } from "@/components/fec/numbers/formatted"
import { OverflowTooltip } from "@/components/fec/tooltip/overflow"
import type {
  AgedBalanceBucketKey,
  AgedBalanceInvoice,
} from "@/lib/fec/analytics"
import { formatNumber, formatShortDate } from "@/lib/fec/format"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useCallback, useMemo } from "react"

import { type AgingBucketColorMap, type AgingGroup, pluralize } from "./display"

export function AgingTable({
  groups,
  partyWord,
  selectedBucketKey,
  onToggleBucket,
  bucketColors,
}: {
  groups: AgingGroup[]
  partyWord: string
  selectedBucketKey: AgedBalanceBucketKey | null
  onToggleBucket: (bucketKey: AgedBalanceBucketKey) => void
  bucketColors: AgingBucketColorMap
}) {
  return (
    <div className="rounded-md border">
      <Table className="min-w-[720px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Libellé</TableHead>
            <TableHead className="w-32 text-right">Échéance</TableHead>
            <TableHead className="w-28 text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <AgingGroupRows
              key={group.key}
              group={group}
              partyWord={partyWord}
              selected={group.key === selectedBucketKey}
              onToggleBucket={onToggleBucket}
              bucketColors={bucketColors}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AgingGroupRows({
  group,
  partyWord,
  selected,
  onToggleBucket,
  bucketColors,
}: {
  group: AgingGroup
  partyWord: string
  selected: boolean
  onToggleBucket: (bucketKey: AgedBalanceBucketKey) => void
  bucketColors: AgingBucketColorMap
}) {
  const toggleBucket = useCallback(
    () => onToggleBucket(group.key),
    [group.key, onToggleBucket]
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
            onClick={toggleBucket}
            className={cn(
              "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_8rem_7rem] items-center gap-2 bg-muted/30 p-2 text-left transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
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
              <span className="shrink-0 text-xs font-normal text-muted-foreground">
                {formatNumber(group.partyCount)}{" "}
                {pluralize(group.partyCount, partyWord)}
              </span>
              {selected ? (
                <Badge variant="secondary" className="text-[10px]">
                  Détail
                </Badge>
              ) : null}
            </span>
            <span className="text-right text-muted-foreground tabular-nums">
              {formatNumber(group.count)} {pluralize(group.count, "facture")}
            </span>
            <span className="text-right font-mono font-medium tabular-nums">
              <FormattedCurrency value={group.amount} />
            </span>
          </button>
        </TableCell>
      </TableRow>
      {selected
        ? group.invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              bucketColors={bucketColors}
            />
          ))
        : null}
    </>
  )
}

function InvoiceRow({
  invoice,
  bucketColors,
}: {
  invoice: AgedBalanceInvoice
  bucketColors: AgingBucketColorMap
}) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal">
        <div className="flex min-w-0 gap-3 pl-5">
          <span className="mt-2 h-6 w-px shrink-0 bg-border" aria-hidden />
          <div className="flex min-w-0 flex-col gap-0.5">
            <OverflowTooltip
              text={invoice.label}
              className="font-medium text-foreground"
            />
            <InvoiceMeta invoice={invoice} />
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        <InvoiceDue invoice={invoice} bucketColors={bucketColors} />
      </TableCell>
      <TableCell className="text-right font-mono font-medium tabular-nums">
        <FormattedCurrency value={invoice.amount} />
      </TableCell>
    </TableRow>
  )
}

function InvoiceMeta({ invoice }: { invoice: AgedBalanceInvoice }) {
  const date = invoice.pieceDate ?? invoice.invoiceDate
  const reference = invoice.pieceRef || invoice.ecritureNum
  const meta = [
    reference ? `Pièce ${reference}` : "",
    `Facture ${formatShortDate(invoice.invoiceDate)}`,
    date.getTime() !== invoice.invoiceDate.getTime()
      ? `Pièce datée du ${formatShortDate(date)}`
      : "",
  ].filter(Boolean)
  const code = invoice.accountNum

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {meta.length > 0 ? (
        <OverflowTooltip
          text={meta.join(" · ")}
          wrapperClassName="max-w-[360px]"
        />
      ) : null}
      <span className="font-mono text-[10px]">{code}</span>
    </div>
  )
}

function InvoiceDue({
  invoice,
  bucketColors,
}: {
  invoice: AgedBalanceInvoice
  bucketColors: AgingBucketColorMap
}) {
  const isOverdue = invoice.daysOverdue >= 0
  const dueStyle = useMemo(
    () => (isOverdue ? { color: bucketColors[invoice.bucketKey] } : undefined),
    [bucketColors, invoice.bucketKey, isOverdue]
  )

  return (
    <span
      className={cn(
        "font-mono font-medium tabular-nums",
        !isOverdue && "text-muted-foreground"
      )}
      style={dueStyle}
      title={isOverdue ? "Jours échus" : "Jours avant échéance"}
    >
      {formatNumber(invoice.daysOverdue)} j
    </span>
  )
}

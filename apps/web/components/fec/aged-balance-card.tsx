"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ReceiptText,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import type {
  AgingBucketColorMap,
  AgingGroup,
} from "@/components/fec/aged-balance-display"
import {
  agingSelectionResetKey,
  buildAgingGroups,
  computeAgingTotal,
  CUSTOMER_AGING_BUCKET_COLOR,
  pluralize,
  SUPPLIER_AGING_BUCKET_COLOR,
} from "@/components/fec/aged-balance-display"
import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import { OverflowTooltip } from "@/components/fec/overflow-tooltip"
import { StackedSegmentBar } from "@/components/fec/stacked-segment-bar"
import type {
  AgedBalance,
  AgedBalanceBucketKey,
  AgedBalanceInvoice,
} from "@/lib/fec/analytics"
import {
  formatEuroCompact,
  formatNumber,
  formatPercent,
  formatShortDate,
} from "@/lib/fec/format"

type PartyType = "clients" | "fournisseurs"

interface AgedBalanceCardProps {
  type: PartyType
  data: AgedBalance
  compact?: boolean
}

export function AgedBalanceCard({
  type,
  data,
  compact = false,
}: AgedBalanceCardProps) {
  const isClients = type === "clients"
  const partyWord = isClients ? "client" : "fournisseur"
  const Icon = isClients ? Users : ReceiptText
  const title = isClients ? "Balance âgée clients" : "Balance âgée fournisseurs"
  const detailHref = isClients
    ? "/dashboard/clients"
    : "/dashboard/fournisseurs"
  const bucketColors = isClients
    ? CUSTOMER_AGING_BUCKET_COLOR
    : SUPPLIER_AGING_BUCKET_COLOR
  const groups = useMemo(
    () => buildAgingGroups(data, bucketColors),
    [data, bucketColors]
  )
  const resetKey = useMemo(() => agingSelectionResetKey(groups), [groups])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <ExplainedCardTitle
              description={
                <>
                  Au {formatShortDate(data.asOf)} · échéance {data.paymentDays}{" "}
                  j · {data.partyCount} {pluralize(data.partyCount, partyWord)}{" "}
                  avec encours. Cliquez une tranche pour ouvrir les factures qui
                  la composent.
                </>
              }
            >
              {title}
            </ExplainedCardTitle>
          </div>
          {compact ? (
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={detailHref} />}
            >
              Détail
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <AgingSummaryTiles data={data} partyWord={partyWord} />

        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun encours sur la période.
          </p>
        ) : (
          <TooltipProvider>
            {compact ? (
              <AgingChart
                groups={groups}
                partyWord={partyWord}
                selectedBucketKey={null}
              />
            ) : (
              <AgingInteractive
                key={resetKey}
                groups={groups}
                partyWord={partyWord}
                bucketColors={bucketColors}
              />
            )}
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  )
}

function AgingSummaryTiles({
  data,
  partyWord,
}: {
  data: AgedBalance
  partyWord: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-1 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Échu
        </p>
        <p className="font-heading text-2xl font-bold text-destructive tabular-nums">
          {formatEuroCompact(data.overdueAmount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.overdueInvoiceCount}{" "}
          {pluralize(data.overdueInvoiceCount, "facture")} ·{" "}
          {data.overduePartyCount}{" "}
          {pluralize(data.overduePartyCount, partyWord)}
        </p>
      </div>
      <div className="flex flex-col gap-1 rounded-md border p-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Non échu
        </p>
        <p className="font-heading text-2xl font-bold tabular-nums">
          {formatEuroCompact(data.notDueAmount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.notDueInvoiceCount}{" "}
          {pluralize(data.notDueInvoiceCount, "facture")} ·{" "}
          {data.notDuePartyCount} {pluralize(data.notDuePartyCount, partyWord)}
        </p>
      </div>
    </div>
  )
}

function AgingInteractive({
  groups,
  partyWord,
  bucketColors,
}: {
  groups: AgingGroup[]
  partyWord: string
  bucketColors: AgingBucketColorMap
}) {
  const [selectedBucketKey, setSelectedBucketKey] =
    useState<AgedBalanceBucketKey | null>(() => groups[0]?.key ?? null)
  const toggleBucket = (bucketKey: AgedBalanceBucketKey) => {
    setSelectedBucketKey((current) =>
      current === bucketKey ? null : bucketKey
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AgingChart
        groups={groups}
        partyWord={partyWord}
        selectedBucketKey={selectedBucketKey}
        onToggleBucket={toggleBucket}
      />
      <AgingTable
        groups={groups}
        partyWord={partyWord}
        selectedBucketKey={selectedBucketKey}
        onToggleBucket={toggleBucket}
        bucketColors={bucketColors}
      />
    </div>
  )
}

function AgingChart({
  groups,
  partyWord,
  selectedBucketKey,
  onToggleBucket,
}: {
  groups: AgingGroup[]
  partyWord: string
  selectedBucketKey: AgedBalanceBucketKey | null
  onToggleBucket?: (bucketKey: AgedBalanceBucketKey) => void
}) {
  const total = computeAgingTotal(groups)

  if (total <= 0)
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucun montant positif à représenter
      </p>
    )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Encours total
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          <FormattedCurrency value={total} />
        </span>
      </div>
      <StackedSegmentBar
        segments={groups}
        ariaLabel="Répartition de la balance âgée par tranche"
        role={onToggleBucket ? "group" : "img"}
        onSegmentClick={
          onToggleBucket ? (segment) => onToggleBucket(segment.key) : undefined
        }
        getSegmentAriaLabel={(segment) =>
          selectedBucketKey === segment.key
            ? `Masquer le détail de ${segment.label}`
            : `Afficher le détail de ${segment.label}`
        }
        getSegmentPressed={(segment) =>
          selectedBucketKey === segment.key ? true : undefined
        }
        renderTooltip={(segment) => (
          <AgingTooltip segment={segment} partyWord={partyWord} />
        )}
      />
    </div>
  )
}

function AgingTooltip({
  segment,
  partyWord,
}: {
  segment: AgingGroup
  partyWord: string
}) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-semibold">{segment.label}</span>
      <span className="text-[10px] opacity-70">
        {formatNumber(segment.count)} {pluralize(segment.count, "facture")} ·{" "}
        {formatNumber(segment.partyCount)}{" "}
        {pluralize(segment.partyCount, partyWord)}
      </span>
      <span className="font-mono tabular-nums opacity-80">
        {formatPercent(segment.share)} ·{" "}
        <FormattedCurrency value={segment.amount} tooltip={false} />
      </span>
    </div>
  )
}

function AgingTable({
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
  const toggleBucket = () => onToggleBucket(group.key)
  const Chevron = selected ? ChevronUp : ChevronDown
  const ariaLabel = selected
    ? `Masquer le détail de ${group.label}`
    : `Afficher le détail de ${group.label}`

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
                style={{ background: group.fill }}
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

  return (
    <span
      className={cn(
        "font-mono font-medium tabular-nums",
        !isOverdue && "text-muted-foreground"
      )}
      style={isOverdue ? { color: bucketColors[invoice.bucketKey] } : {}}
      title={isOverdue ? "Jours échus" : "Jours avant échéance"}
    >
      {formatNumber(invoice.daysOverdue)} j
    </span>
  )
}

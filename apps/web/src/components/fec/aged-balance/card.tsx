"use client"

import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { StackedSegmentBar } from "@/components/fec/charting/stacked-segment-bar"
import { FormattedCurrency } from "@/components/fec/numbers/formatted"
import Link from "@/components/link"
import type { AgedBalance, AgedBalanceBucketKey } from "@/lib/fec/analytics"
import {
  formatEuroCompact,
  formatNumber,
  formatPercent,
  formatShortDate,
} from "@/lib/fec/format"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { ArrowRight, ReceiptText, Users } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import {
  agingSelectionResetKey,
  buildAgingGroups,
  computeAgingTotal,
  CUSTOMER_AGING_BUCKET_COLOR,
  type AgingBucketColorMap,
  type AgingGroup,
  pluralize,
  SUPPLIER_AGING_BUCKET_COLOR,
} from "./display"
import { AgingTable } from "./table"

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
  const detailLink = useMemo(() => <Link href={detailHref} />, [detailHref])

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
            <Button variant="ghost" size="sm" render={detailLink}>
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
  const toggleBucket = useCallback((bucketKey: AgedBalanceBucketKey) => {
    setSelectedBucketKey((current) =>
      current === bucketKey ? null : bucketKey
    )
  }, [])

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
  const toggleSegment = useCallback(
    (segment: AgingGroup) => onToggleBucket?.(segment.key),
    [onToggleBucket]
  )
  const getSegmentAriaLabel = useCallback(
    (segment: AgingGroup) =>
      selectedBucketKey === segment.key
        ? `Masquer le détail de ${segment.label}`
        : `Afficher le détail de ${segment.label}`,
    [selectedBucketKey]
  )
  const getSegmentPressed = useCallback(
    (segment: AgingGroup) =>
      selectedBucketKey === segment.key ? true : undefined,
    [selectedBucketKey]
  )
  const renderAgingTooltip = useCallback(
    (segment: AgingGroup) => (
      <AgingTooltip segment={segment} partyWord={partyWord} />
    ),
    [partyWord]
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
        onSegmentClick={onToggleBucket ? toggleSegment : undefined}
        getSegmentAriaLabel={getSegmentAriaLabel}
        getSegmentPressed={getSegmentPressed}
        getTooltipContent={renderAgingTooltip}
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

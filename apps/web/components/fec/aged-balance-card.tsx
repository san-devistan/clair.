"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight, ReceiptText, Users } from "lucide-react"
import Link from "next/link"

import { ExplainedCardTitle } from "@/components/fec/explained-card-title"
import { FormattedCurrency } from "@/components/fec/formatted-number"
import type { AgedBalance, AgedBalanceBucket } from "@/lib/fec/analytics"
import { formatEuroCompact, formatShortDate } from "@/lib/fec/format"

type PartyType = "clients" | "fournisseurs"

interface AgedBalanceCardProps {
  type: PartyType
  data: AgedBalance
  compact?: boolean
}

const BUCKET_COLOR: Record<AgedBalanceBucket["key"], string> = {
  notDue: "var(--bar-neutral)",
  "0_30": "var(--expense-1)",
  "31_60": "var(--expense-3)",
  "60plus": "var(--expense-5)",
}

const MIN_INLINE_PCT = 8

function pluralize(n: number, singular: string, plural?: string): string {
  return n > 1 ? (plural ?? `${singular}s`) : singular
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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <ExplainedCardTitle
              description={
                <>
                  Au {formatShortDate(data.asOf)} · échéance {data.paymentDays}{" "}
                  j · {data.partyCount} {pluralize(data.partyCount, partyWord)}{" "}
                  avec encours. La barre sépare les montants non échus et les
                  retards par ancienneté.
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
              <ArrowRight />
            </Button>
          ) : (
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        {/* Tuiles non echu / echu */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 rounded-md border p-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Non échu
            </p>
            <p className="font-heading text-2xl font-bold tabular-nums">
              {formatEuroCompact(data.notDueAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.notDueInvoiceCount}{" "}
              {pluralize(data.notDueInvoiceCount, "facture")} ·{" "}
              {data.notDuePartyCount}{" "}
              {pluralize(data.notDuePartyCount, partyWord)}
            </p>
          </div>
          <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/[0.04] p-3">
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
        </div>

        {/* Barre stackee par tranche d'aging */}
        <AgingBar buckets={data.buckets} totalAmount={data.totalAmount} />
      </CardContent>
    </Card>
  )
}

function AgingBar({
  buckets,
  totalAmount,
}: {
  buckets: AgedBalanceBucket[]
  totalAmount: number
}) {
  if (totalAmount <= 0)
    return (
      <p className="text-xs text-muted-foreground">
        Aucun encours sur la période.
      </p>
    )

  const visibleBuckets = buckets.filter((b) => b.amount > 0)

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Encours total
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            <FormattedCurrency value={totalAmount} />
          </span>
        </div>
        <div
          className="flex h-20 w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/30"
          role="img"
          aria-label="Répartition par tranche d'âge"
        >
          {visibleBuckets.map((b, idx) => (
            <AgingSegment
              key={b.key}
              bucket={b}
              totalAmount={totalAmount}
              isFirst={idx === 0}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

function AgingSegment({
  bucket,
  totalAmount,
  isFirst,
}: {
  bucket: AgedBalanceBucket
  totalAmount: number
  isFirst: boolean
}) {
  const sharePct = (bucket.amount / totalAmount) * 100
  const showInline = sharePct >= MIN_INLINE_PCT

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            style={{
              width: `${String(sharePct)}%`,
              background: BUCKET_COLOR[bucket.key],
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
            {bucket.label}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-semibold">{bucket.label}</span>
          <span className="font-mono tabular-nums opacity-80">
            <FormattedCurrency value={bucket.amount} tooltip={false} /> ·{" "}
            {bucket.count} {pluralize(bucket.count, "facture")} ·{" "}
            {sharePct.toFixed(1)}%
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

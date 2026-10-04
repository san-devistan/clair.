"use client"

import { ExplainedCardTitle } from "@/components/fec/cards/explained-title"
import { useDashboardHref } from "@/components/fec/dashboard/mode"
import Link from "@/components/link"
import type {
  BalanceSheetLine,
  BalanceSheetLineKey,
  BalanceSheetSummary,
} from "@/lib/fec/balance-sheet-types"
import { formatEuroCompact, formatShortDate } from "@/lib/fec/format"
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
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRight } from "lucide-react"
import { useMemo, type ReactNode } from "react"

import { BalanceSheetRatioSummary } from "./ratios"

interface BalanceSheetVisualProps {
  balanceSheet: BalanceSheetSummary
  compact?: boolean
}

const LINE_COLORS: Record<BalanceSheetLineKey, string> = {
  fixedAssets: "var(--expense-4)",
  inventory: "var(--result)",
  customerReceivables: "var(--chart-1)",
  otherReceivables: "var(--expense-1)",
  cash: "var(--chart-3)",
  equity: "var(--result)",
  financialDebt: "var(--expense-5)",
  supplierPayables: "var(--expense-3)",
  otherPayables: "var(--expense-2)",
  negativeCash: "var(--destructive)",
}

export function BalanceSheetOverviewCard({
  balanceSheet,
}: {
  balanceSheet: BalanceSheetSummary
}) {
  const highlightedRatios = balanceSheet.ratios.filter((ratio) =>
    ["currentLiquidity", "debtToEquity", "cashRunway"].includes(ratio.key)
  )
  const balanceHref = useDashboardHref("/bilan")
  const balanceDetailLink = useMemo(
    () => <Link href={balanceHref} />,
    [balanceHref]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <ExplainedCardTitle description="Vue Actif / Passif issue des comptes 1 à 5 du FEC. Elle montre ce que l'entreprise possède, ce qui la finance et les premiers signaux de solidité financière.">
            Bilan simplifié
          </ExplainedCardTitle>
          <Button variant="ghost" size="sm" render={balanceDetailLink}>
            Détail
            <ArrowRight />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <BalanceSheetVisual balanceSheet={balanceSheet} compact />
          <div className="grid gap-3 md:grid-cols-3">
            {highlightedRatios.map((ratio) => (
              <BalanceSheetRatioSummary key={ratio.key} ratio={ratio} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BalanceSheetVisual({
  balanceSheet,
  compact = false,
}: BalanceSheetVisualProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-balance-sheet lg:items-stretch">
        <BalanceStack
          title="Actif"
          total={balanceSheet.totalAssets}
          lines={balanceSheet.assetLines}
          compact={compact}
        />
        <div className="hidden items-center justify-center text-2xl font-semibold text-muted-foreground lg:flex">
          =
        </div>
        <BalanceStack
          title="Passif"
          total={balanceSheet.totalFunding}
          lines={balanceSheet.fundingLines}
          compact={compact}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <BalanceIndicator
          label="Fonds de roulement"
          value={balanceSheet.workingCapital}
          help="Ressources stables moins immobilisations. Positif, l'activité a une base longue pour financer le quotidien."
        />
        <BalanceIndicator
          label="BFR"
          value={balanceSheet.workingCapitalRequirement}
          help="Stocks + créances - dettes d'exploitation. Positif, l'activité immobilise du cash."
        />
        <BalanceIndicator
          label="Trésorerie nette"
          value={balanceSheet.netCash}
          help="Ce qui reste entre fonds de roulement et BFR. C'est le coussin de cash visible au bilan."
        />
      </div>
    </div>
  )
}

export function BalanceSheetLineTable({
  title,
  lines,
  total,
}: {
  title: string
  lines: BalanceSheetLine[]
  total: number
}) {
  return (
    <Table layout="fixed" minWidth="sm">
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">{title}</TableHead>
          <TableHead className="w-28 text-right">Montant</TableHead>
          <TableHead width="note" className="text-left">
            Lecture
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line.key}>
            <TableCell className="text-left">
              <div className="flex min-w-0 items-center gap-2">
                <BalanceLineMarker lineKey={line.key} />
                <span className="truncate font-medium">{line.label}</span>
              </div>
            </TableCell>
            <TableCell
              variant="numeric"
              tone={line.amount < 0 ? "destructive" : "default"}
            >
              {formatEuroCompact(line.amount)}
            </TableCell>
            <TableCell
              variant="description"
              className="text-left whitespace-normal"
            >
              {line.description}
            </TableCell>
          </TableRow>
        ))}
        <TableRow variant="muted">
          <TableCell variant="strong">Total</TableCell>
          <TableCell variant="numeric-strong">
            {formatEuroCompact(total)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  )
}

export function BalanceSheetAsOf({
  balanceSheet,
}: {
  balanceSheet: BalanceSheetSummary
}) {
  return (
    <p className="text-sm text-muted-foreground">
      Bilan au {formatShortDate(balanceSheet.asOf)}
    </p>
  )
}

function BalanceStack({
  title,
  total,
  lines,
  compact,
}: {
  title: string
  total: number
  lines: BalanceSheetLine[]
  compact: boolean
}) {
  const visibleLines = lines.filter((line) => Math.abs(line.amount) > 0.005)
  const stackTotal = visibleLines.reduce(
    (sum, line) => sum + Math.abs(line.amount),
    0
  )
  const hasLines = visibleLines.length > 0 && stackTotal > 0

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-xl font-semibold">{title}</p>
        <p className="font-heading text-xl font-semibold tabular-nums">
          {formatEuroCompact(total)}
        </p>
      </div>
      <div
        className={cn(
          "flex overflow-hidden rounded-lg border border-border/60 bg-muted/20",
          compact ? "h-56" : "h-72"
        )}
      >
        {hasLines ? (
          <div className="flex min-h-0 w-full flex-col">
            {visibleLines.map((line, index) => (
              <BalanceStackSegment
                key={line.key}
                line={line}
                stackTotal={stackTotal}
                withSeparator={index > 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Aucun poste identifié
          </div>
        )}
      </div>
      <div className="grid gap-2 text-xs">
        {visibleLines.map((line) => (
          <div
            key={line.key}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <BalanceLineMarker lineKey={line.key} />
              <span className="truncate text-muted-foreground">
                {line.label}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 font-mono font-medium tabular-nums",
                line.amount < 0 && "text-destructive"
              )}
            >
              {formatEuroCompact(line.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BalanceStackSegment({
  line,
  stackTotal,
  withSeparator,
}: {
  line: BalanceSheetLine
  stackTotal: number
  withSeparator: boolean
}) {
  const share = stackTotal > 0 ? Math.abs(line.amount) / stackTotal : 0
  const showInline = share >= 0.11

  return (
    <div
      className={cn(
        "flex min-h-6 min-w-0 grow-segment flex-col justify-center px-3 py-1.5 text-white bg-marker",
        withSeparator && "border-t-2 border-background/70",
        line.amount < 0 && "text-destructive-foreground"
      )}
      style={{
        "--marker-color": LINE_COLORS[line.key],
        "--segment-grow": Math.max(Math.abs(line.amount), stackTotal * 0.045),
      }}
      title={`${line.label} : ${formatEuroCompact(line.amount)}`}
    >
      {showInline ? (
        <>
          <span className="truncate text-xs font-semibold">{line.label}</span>
          <span className="truncate font-mono text-xs tabular-nums">
            {formatEuroCompact(line.amount)}
          </span>
        </>
      ) : null}
    </div>
  )
}

function BalanceLineMarker({ lineKey }: { lineKey: BalanceSheetLineKey }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full bg-marker"
      style={{ "--marker-color": LINE_COLORS[lineKey] }}
    />
  )
}

function BalanceIndicator({
  label,
  value,
  help,
}: {
  label: string
  value: number
  help: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-heading text-2xl font-bold tabular-nums",
          value < 0 && "text-destructive"
        )}
      >
        {formatEuroCompact(value)}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {help}
      </p>
    </div>
  )
}

"use client"

import { FormattedCurrency } from "@/components/fec/numbers/formatted"
import type { CashProjection } from "@/lib/fec/analytics"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { Fragment } from "react"

interface CashProjectionCardProps {
  data: CashProjection
  className?: string
}

const TONE_CLASS: Record<"default" | "positive" | "negative", string> = {
  default: "text-foreground",
  positive: "text-emerald-600 dark:text-emerald-500",
  negative: "text-destructive",
}

export function CashProjectionCard({
  data,
  className,
}: CashProjectionCardProps) {
  const projectedDanger = data.projectedCash < 0

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_1ch_auto] items-baseline gap-x-2 gap-y-1.5 text-sm",
        className
      )}
    >
      <CascadeRow label="Solde actuel" amount={data.currentCash} bold />
      <CascadeRow
        label="TVA à décaisser"
        amount={data.vatPayable}
        op="sub"
        indent
        tone="negative"
      />
      <CascadeRow
        label="Salaires nets dus"
        amount={data.salariesPayable}
        op="sub"
        indent
        tone="negative"
      />
      <CascadeRow
        label="Charges sociales (URSSAF, mutuelle, retraite)"
        amount={data.socialChargesPayable}
        op="sub"
        indent
        tone="negative"
      />
      <CascadeRow
        label="Fournisseurs échus"
        amount={data.overduePayables}
        op="sub"
        indent
        tone="negative"
      />
      <CascadeRow
        label="Clients échus"
        amount={data.overdueReceivables}
        op="add"
        indent
        tone="positive"
      />
      <Separator className="col-span-3 my-1.5" />
      <CascadeRow
        label="Solde prévisionnel"
        amount={data.projectedCash}
        bold
        tone={projectedDanger ? "negative" : "default"}
      />
    </div>
  )
}

function CascadeRow({
  label,
  amount,
  op = "none",
  indent = false,
  bold = false,
  tone = "default",
}: {
  label: string
  amount: number
  op?: "add" | "sub" | "none"
  indent?: boolean
  bold?: boolean
  tone?: "default" | "positive" | "negative"
}) {
  const operator = op === "add" ? "+" : op === "sub" || amount < 0 ? "−" : ""
  const displayAmount = Math.abs(amount)
  // A zero engagement isn't positive or negative — neutralise the colour so
  // "− 0 €" doesn't read as a danger.
  const effectiveTone = amount === 0 ? "default" : tone
  return (
    <Fragment>
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          indent ? "pl-4 text-muted-foreground" : "font-medium"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-center font-mono tabular-nums",
          bold ? "font-semibold" : "font-medium",
          TONE_CLASS[effectiveTone]
        )}
      >
        {operator}
      </span>
      <span
        className={cn(
          "justify-self-end text-right font-mono tabular-nums",
          bold ? "font-semibold" : "font-medium",
          TONE_CLASS[effectiveTone]
        )}
      >
        <FormattedCurrency value={displayAmount} />
      </span>
    </Fragment>
  )
}

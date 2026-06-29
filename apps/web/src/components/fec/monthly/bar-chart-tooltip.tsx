import { formatEuroCompact } from "@/lib/fec/format"
import { useMemo } from "react"

interface TooltipPayloadItem {
  value?: unknown
  name?: unknown
  color?: string
  fill?: string
  dataKey?: unknown
  payload?: {
    monthLabel?: string
  }
}

interface MonthlyTooltipContentProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: unknown
}

interface TooltipRow {
  item: TooltipPayloadItem
  value: number
}

export function MonthlyTooltipContent({
  active,
  payload,
  label,
}: MonthlyTooltipContentProps) {
  if (!active || !payload?.length) return null

  const rows = buildTooltipRows(payload)
  if (rows.length === 0) return null

  const labelText = tooltipLabelText(label, rows)

  return (
    <div className="grid min-w-40 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {labelText ? <div className="font-medium">{labelText}</div> : null}
      <div className="grid gap-1.5">
        {rows.map(({ item, value }) => (
          <TooltipLine
            key={tooltipItemKey(item, value)}
            item={item}
            value={value}
          />
        ))}
      </div>
    </div>
  )
}

function buildTooltipRows(payload: TooltipPayloadItem[]): TooltipRow[] {
  const rows: TooltipRow[] = []
  for (const item of payload) {
    const value = tooltipNumericValue(item.value)
    if (value !== null) rows.push({ item, value })
  }

  if (rows.length > 0 || payload.length !== 1) return rows

  const value = tooltipNumericValue(payload[0].value, true)
  if (value !== null) rows.push({ item: payload[0], value })
  return rows
}

function tooltipLabelText(
  label: unknown,
  rows: TooltipRow[]
): string | undefined {
  return typeof label === "string" ? label : rows[0]?.item.payload?.monthLabel
}

function TooltipLine({ item, value }: TooltipRow) {
  const markerStyle = useMemo(
    () => ({ background: tooltipItemColor(item) }),
    [item]
  )

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <span className="size-2 shrink-0 rounded-[2px]" style={markerStyle} />
        <span className="truncate">{tooltipItemName(item)}</span>
      </span>
      <span className="font-mono font-medium tabular-nums">
        {formatEuroCompact(value)}
      </span>
    </div>
  )
}

function tooltipItemKey(item: TooltipPayloadItem, value: number) {
  const key = item.dataKey ?? item.name
  if (typeof key === "string" || typeof key === "number") return String(key)
  return String(value)
}

function tooltipItemName(item: TooltipPayloadItem) {
  if (typeof item.name === "string" || typeof item.name === "number") {
    return String(item.name)
  }
  return ""
}

function tooltipNumericValue(
  value: unknown,
  keepZero: boolean = false
): number | null {
  if (value === null || value === undefined) return null
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  if (!Number.isFinite(numeric)) return null
  if (!keepZero && numeric === 0) return null
  return numeric
}

function tooltipItemColor(item: TooltipPayloadItem): string {
  return item.color ?? item.fill ?? "var(--muted-foreground)"
}

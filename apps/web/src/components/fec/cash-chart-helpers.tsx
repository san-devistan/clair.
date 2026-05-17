// Helpers partages par CashBalanceChart et CashCombinedChart : axe Y et
// tooltips en euros compacts avec des libelles lisibles.

import { formatEuroCompact } from "@/lib/fec/format"
import { cn } from "@workspace/ui/lib/utils"

const tooltipLabels: Record<string, string> = {
  cashBalance: "Solde de trésorerie",
  cashFlow: "Flux net mensuel",
  cashBalanceComparison: "Solde comparé",
  cashFlowComparison: "Flux comparé",
  cashBalanceForecast: "Solde prévisionnel",
  cashFlowForecast: "Flux prévisionnel",
}

export function formatEuroAxis(value: number): string {
  return formatEuroCompact(value)
}

export function tooltipFormatter(value: unknown, name: unknown) {
  const numeric = Array.isArray(value) ? Number(value[0]) : Number(value)
  const amount = Number.isFinite(numeric) ? numeric : 0
  const nameText = tooltipName(name)
  const label = tooltipLabels[nameText] ?? nameText
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono font-medium",
          amount < 0 && "text-destructive"
        )}
      >
        {formatEuroCompact(amount)}
      </span>
    </div>
  )
}

function tooltipName(name: unknown) {
  if (typeof name === "string") return name
  if (typeof name === "number") return String(name)
  return ""
}

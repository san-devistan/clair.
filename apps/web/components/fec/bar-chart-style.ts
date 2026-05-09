export const SMALL_SEGMENT_SHARE_THRESHOLD = 5

export const OTHER_SEGMENT_LABEL = "Autres postes"

export const STACKED_BAR_CONTAINER_CLASS =
  "flex h-20 w-full overflow-hidden rounded-lg border border-border/40 bg-muted/30"

export const STACKED_BAR_SEPARATOR_CLASS = "border-l-2 border-background/60"

export type ChartColorMode = "light" | "dark"

const RANKED_FILL_PALETTES = {
  light: {
    expense: { strong: "#d65f16", soft: "#fdc48d" },
    revenue: { strong: "#2563eb", soft: "#93c5fd" },
  },
  dark: {
    expense: { strong: "#9f2d00", soft: "#ffb86a" },
    revenue: { strong: "#1e3a8a", soft: "#93c5fd" },
  },
} as const

export function rankedBarFill(base: string, index: number): string {
  const strength = Math.max(46, 100 - index * 8)
  return `color-mix(in srgb, ${base} ${String(strength)}%, var(--background))`
}

export function rankedExpenseBarFill(
  index: number,
  total: number,
  mode: ChartColorMode = "light"
): string {
  return rankedFill("expense", index, total, mode)
}

export function rankedRevenueBarFill(
  index: number,
  total: number,
  mode: ChartColorMode = "light"
): string {
  return rankedFill("revenue", index, total, mode)
}

function rankedFill(
  family: "expense" | "revenue",
  index: number,
  total: number,
  mode: ChartColorMode
): string {
  const palette = RANKED_FILL_PALETTES[mode][family]
  const ratio = total <= 1 ? 0 : Math.min(Math.max(index / (total - 1), 0), 1)

  return interpolateHexColor(palette.strong, palette.soft, ratio)
}

function interpolateHexColor(from: string, to: string, ratio: number): string {
  const start = hexToRgb(from)
  const end = hexToRgb(to)
  const r = interpolateChannel(start.r, end.r, ratio)
  const g = interpolateChannel(start.g, end.g, ratio)
  const b = interpolateChannel(start.b, end.b, ratio)

  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`
}

function interpolateChannel(from: number, to: number, ratio: number): number {
  return Math.round(from + (to - from) * ratio)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  }
}

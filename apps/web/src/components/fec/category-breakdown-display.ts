import {
  OTHER_SEGMENT_LABEL,
  SMALL_SEGMENT_SHARE_THRESHOLD,
} from "@/components/fec/bar-chart-style"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

export function groupSmallCategoryBreakdowns(
  items: CategoryBreakdown[]
): CategoryBreakdown[] {
  if (items.length === 0) return []

  const grouped: CategoryBreakdown[] = []
  let otherAmount = 0
  let otherShare = 0

  for (const item of items) {
    if (item.share < SMALL_SEGMENT_SHARE_THRESHOLD) {
      otherAmount += item.amount
      otherShare += item.share
      continue
    }
    grouped.push(item)
  }

  if (otherAmount <= 0) return grouped

  grouped.push({
    key: "other",
    label: OTHER_SEGMENT_LABEL,
    amount: otherAmount,
    share: otherShare,
    fill: "var(--muted-foreground)",
  })

  return grouped
}

import {
  type ChartColorMode,
  OTHER_SEGMENT_LABEL,
  rankedExpenseBarFill,
  rankedRevenueBarFill,
  SMALL_SEGMENT_SHARE_THRESHOLD,
} from "@/components/fec/bar-chart-style"
import type { AccountDetail } from "@/lib/fec/account-details"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

export type RepartitionVariant = "revenue" | "expenses"

export interface RepartitionGroup {
  key: string
  label: string
  fill: string
  amount: number
  share: number
  details: AccountDetail[]
}

export interface ChartSegment {
  key: string
  label: string
  amount: number
  share: number
  fill: string
  detailCount: number
  accountNum?: string
  auxNum?: string
}

export type InteractiveSegment = ChartSegment & {
  groupKey: string
  groupLabel: string
  kind: "category" | "detail"
}

interface GroupDraft {
  key: string
  label: string
  fill: string
  fallbackAmount: number
  positiveDetailAmount: number
  details: AccountDetail[]
}

const UNCATEGORIZED_KEY = "uncategorized"
const UNCATEGORIZED_LABEL = "Non catégorisé"
const UNCATEGORIZED_FILL = "var(--muted-foreground)"

export const MIN_INLINE_SHARE = 8

export function buildRepartitionGroups(
  categories: CategoryBreakdown[],
  details: AccountDetail[],
  variant: RepartitionVariant,
  colorMode: ChartColorMode = "light"
): RepartitionGroup[] {
  const drafts = new Map<string, GroupDraft>()

  for (const category of categories) {
    drafts.set(category.key, {
      key: category.key,
      label: category.label,
      fill: category.fill ?? UNCATEGORIZED_FILL,
      fallbackAmount: Math.max(0, category.amount),
      positiveDetailAmount: 0,
      details: [],
    })
  }

  for (const detail of details) {
    const key = detail.categoryKey || UNCATEGORIZED_KEY
    const draft = getOrCreateDraft(drafts, key, detail)
    draft.details.push(detail)
    if (detail.amount > 0) draft.positiveDetailAmount += detail.amount
  }

  const groups = Array.from(drafts.values())
    .map(buildGroup)
    .filter((group) => group.amount > 0 || group.details.length > 0)
    .sort((a, b) => b.amount - a.amount)

  for (const [index, group] of groups.entries())
    group.fill = repartitionFill(variant, index, groups.length, colorMode)

  const positiveTotal = computePositiveGroupTotal(groups)
  for (const group of groups)
    group.share = positiveTotal > 0 ? (group.amount / positiveTotal) * 100 : 0

  return groups
}

export function computePositiveGroupTotal(groups: RepartitionGroup[]): number {
  return groups.reduce((sum, group) => {
    if (group.amount <= 0) return sum
    return sum + group.amount
  }, 0)
}

export function buildDetailSegments(group: RepartitionGroup): ChartSegment[] {
  const segments: ChartSegment[] = []
  let otherAmount = 0
  let otherCount = 0

  for (const detail of group.details) {
    if (detail.amount <= 0) continue

    const share = group.amount > 0 ? (detail.amount / group.amount) * 100 : 0
    if (share < SMALL_SEGMENT_SHARE_THRESHOLD) {
      otherAmount += detail.amount
      otherCount += 1
      continue
    }

    segments.push({
      key: detail.id,
      label: detail.label,
      amount: detail.amount,
      share,
      fill: detailFill(group.fill, segments.length),
      detailCount: 1,
      accountNum: detail.accountNum,
      auxNum: detail.auxNum,
    })
  }

  if (otherAmount > 0) {
    segments.push({
      key: `${group.key}-other`,
      label: OTHER_SEGMENT_LABEL,
      amount: otherAmount,
      share: (otherAmount / group.amount) * 100,
      fill: "var(--muted-foreground)",
      detailCount: otherCount,
    })
  }

  return segments
}

export function buildMainSegments(
  groups: RepartitionGroup[],
  selectedGroupKey: string | null,
  total: number
): InteractiveSegment[] {
  const segments: InteractiveSegment[] = []

  for (const group of groups) {
    if (group.amount <= 0) continue

    if (group.key !== selectedGroupKey) {
      segments.push(buildCategorySegment(group))
      continue
    }

    const detailSegments = buildSelectedDetailSegments(group, total)
    if (detailSegments.length === 0) {
      segments.push(buildCategorySegment(group))
      continue
    }

    segments.push(...detailSegments)
  }

  return segments
}

export function selectionResetKey(groups: RepartitionGroup[]): string {
  let key = ""
  for (const group of groups) {
    key += `${group.key}:${String(group.amount)}:`
    for (const detail of group.details)
      key += `${detail.id}:${String(detail.amount)},`
    key += "|"
  }
  return key
}

function buildGroup(draft: GroupDraft): RepartitionGroup {
  return {
    key: draft.key,
    label: draft.label,
    fill: draft.fill,
    amount:
      draft.details.length > 0
        ? draft.positiveDetailAmount
        : draft.fallbackAmount,
    share: 0,
    details: [...draft.details].sort((a, b) => b.amount - a.amount),
  }
}

function buildCategorySegment(group: RepartitionGroup): InteractiveSegment {
  return {
    key: group.key,
    label: group.label,
    amount: group.amount,
    share: group.share,
    fill: group.fill,
    detailCount: group.details.length,
    groupKey: group.key,
    groupLabel: group.label,
    kind: "category",
  }
}

function buildSelectedDetailSegments(
  group: RepartitionGroup,
  total: number
): InteractiveSegment[] {
  const segments: InteractiveSegment[] = []

  for (const detail of buildDetailSegments(group)) {
    segments.push({
      key: `${group.key}-${detail.key}`,
      label: detail.label,
      amount: detail.amount,
      share: total > 0 ? (detail.amount / total) * 100 : 0,
      fill: group.fill,
      detailCount: detail.detailCount,
      accountNum: detail.accountNum,
      auxNum: detail.auxNum,
      groupKey: group.key,
      groupLabel: group.label,
      kind: "detail",
    })
  }

  return segments
}

function getOrCreateDraft(
  drafts: Map<string, GroupDraft>,
  key: string,
  detail: AccountDetail
): GroupDraft {
  const existing = drafts.get(key)
  if (existing) return existing

  const draft: GroupDraft = {
    key,
    label: detail.categoryLabel || UNCATEGORIZED_LABEL,
    fill: detail.categoryFill || UNCATEGORIZED_FILL,
    fallbackAmount: 0,
    positiveDetailAmount: 0,
    details: [],
  }
  drafts.set(key, draft)
  return draft
}

function detailFill(fill: string, index: number): string {
  const strength = Math.max(42, 100 - index * 14)
  return `color-mix(in srgb, ${fill} ${String(strength)}%, var(--background))`
}

function repartitionFill(
  variant: RepartitionVariant,
  index: number,
  total: number,
  colorMode: ChartColorMode
): string {
  if (variant === "expenses")
    return rankedExpenseBarFill(index, total, colorMode)
  return rankedRevenueBarFill(index, total, colorMode)
}

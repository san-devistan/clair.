import type {
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceInvoice,
} from "@/lib/fec/analytics"

export interface AgingGroup {
  key: AgedBalanceBucketKey
  label: string
  fill: string
  amount: number
  share: number
  count: number
  partyCount: number
  invoices: AgedBalanceInvoice[]
}

export type AgingBucketColorMap = Record<AgedBalanceBucketKey, string>

export const CUSTOMER_AGING_BUCKET_COLOR: AgingBucketColorMap = {
  notDue: "var(--bar-neutral)",
  "0_30": "var(--chart-1)",
  "31_60": "var(--chart-3)",
  "60plus": "var(--chart-5)",
}

export const SUPPLIER_AGING_BUCKET_COLOR: AgingBucketColorMap = {
  notDue: "var(--bar-neutral)",
  "0_30": "var(--expense-1)",
  "31_60": "var(--expense-3)",
  "60plus": "var(--expense-5)",
}

const BAR_BUCKET_ORDER: AgedBalanceBucketKey[] = [
  "60plus",
  "31_60",
  "0_30",
  "notDue",
]

export function pluralize(
  n: number,
  singular: string,
  plural?: string
): string {
  return n > 1 ? (plural ?? `${singular}s`) : singular
}

export function buildAgingGroups(
  data: AgedBalance,
  bucketColors: AgingBucketColorMap = SUPPLIER_AGING_BUCKET_COLOR
): AgingGroup[] {
  const invoicesByBucket = groupInvoicesByBucket(data.invoices)
  const groups: AgingGroup[] = []

  for (const key of BAR_BUCKET_ORDER) {
    const group = buildAgingGroup(key, data, bucketColors, invoicesByBucket)
    if (group) groups.push(group)
  }

  return groups
}

export function computeAgingTotal(groups: AgingGroup[]): number {
  return groups.reduce((sum, group) => sum + group.amount, 0)
}

export function agingSelectionResetKey(groups: AgingGroup[]): string {
  let key = ""
  for (const group of groups) {
    key += `${group.key}:${String(group.amount)}:`
    for (const invoice of group.invoices)
      key += `${invoice.id}:${String(invoice.amount)},`
    key += "|"
  }
  return key
}

function findBucket(
  buckets: AgedBalanceBucket[],
  key: AgedBalanceBucketKey
): AgedBalanceBucket | undefined {
  return buckets.find((bucket) => bucket.key === key)
}

function groupInvoicesByBucket(
  invoices: AgedBalanceInvoice[]
): Map<AgedBalanceBucketKey, AgedBalanceInvoice[]> {
  const invoicesByBucket = new Map<AgedBalanceBucketKey, AgedBalanceInvoice[]>()

  for (const invoice of invoices) {
    const bucketInvoices = invoicesByBucket.get(invoice.bucketKey) ?? []
    bucketInvoices.push(invoice)
    invoicesByBucket.set(invoice.bucketKey, bucketInvoices)
  }

  return invoicesByBucket
}

function buildAgingGroup(
  key: AgedBalanceBucketKey,
  data: AgedBalance,
  bucketColors: AgingBucketColorMap,
  invoicesByBucket: Map<AgedBalanceBucketKey, AgedBalanceInvoice[]>
): AgingGroup | null {
  const bucket = findBucket(data.buckets, key)
  const invoices = invoicesByBucket.get(key) ?? []
  const amount = bucket?.amount ?? sumInvoiceAmounts(invoices)
  if (amount <= 0) return null

  return {
    key,
    label: bucket?.label ?? bucketLabel(key),
    fill: bucketColors[key],
    amount,
    share: data.totalAmount > 0 ? (amount / data.totalAmount) * 100 : 0,
    count: bucket?.count ?? invoices.length,
    partyCount: countInvoiceParties(invoices),
    invoices: sortInvoicesForDisplay(invoices),
  }
}

function bucketLabel(key: AgedBalanceBucketKey): string {
  if (key === "notDue") return "Non échu"
  if (key === "0_30") return "0 à 30 j"
  if (key === "31_60") return "31 à 60 j"
  return "+ 60 j"
}

function sumInvoiceAmounts(invoices: AgedBalanceInvoice[]): number {
  return invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
}

function countInvoiceParties(invoices: AgedBalanceInvoice[]): number {
  return new Set(invoices.map((invoice) => invoice.accountNum)).size
}

function sortInvoicesForDisplay(
  invoices: AgedBalanceInvoice[]
): AgedBalanceInvoice[] {
  return [...invoices].toSorted((a, b) => {
    const dueDiff = a.dueDate.getTime() - b.dueDate.getTime()
    if (dueDiff !== 0) return dueDiff

    const amountDiff = b.amount - a.amount
    if (amountDiff !== 0) return amountDiff

    return a.label.localeCompare(b.label, "fr")
  })
}

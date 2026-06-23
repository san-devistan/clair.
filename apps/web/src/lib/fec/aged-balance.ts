/* oxlint-disable eslint/max-lines */
// Balance agee (aged balance) : pour chaque tiers, on isole les factures
// restant a payer en faisant un matching FIFO entre factures et reglements.
// Plus robuste que de se baser uniquement sur le lettrage (`ecritureLet`),
// souvent absent dans les FEC reels. Les totaux sont identiques quand le
// lettrage est correctement applique.

import { isCustomerAccount, isSupplierAccount } from "./accounts"
import type { FecEntry } from "./types"

export type AgedBalanceBucketKey = "notDue" | "0_30" | "31_60" | "60plus"

export interface AgedBalanceBucket {
  key: AgedBalanceBucketKey
  label: string
  count: number
  amount: number
}

export interface AgedBalanceCounterparty {
  accountNum: string
  label: string
  totalAmount: number
  overdueAmount: number
  oldestDaysOverdue: number
  oldestOpenDays: number
  invoiceCount: number
  worstBucketKey: AgedBalanceBucketKey
  worstBucketLabel: string
  worstBucketAmount: number
}

export interface AgedBalanceInvoice {
  id: string
  accountNum: string
  label: string
  ecritureNum: string
  ecritureLib: string
  pieceRef: string
  pieceDate: Date | null
  invoiceDate: Date
  dueDate: Date
  amount: number
  daysOverdue: number
  daysOpen: number
  bucketKey: AgedBalanceBucketKey
  bucketLabel: string
}

export interface AgedBalance {
  asOf: Date
  paymentDays: number
  totalAmount: number
  invoiceCount: number
  partyCount: number
  overdueAmount: number
  overdueInvoiceCount: number
  overduePartyCount: number
  notDueAmount: number
  notDueInvoiceCount: number
  notDuePartyCount: number
  buckets: AgedBalanceBucket[]
  invoices: AgedBalanceInvoice[]
  counterparties: AgedBalanceCounterparty[]
  topOverdueParties: AgedBalanceCounterparty[]
}

const PAYMENT_DAYS_DEFAULT = 30
const TOP_N_DEFAULT = 5
const AMOUNT_TOLERANCE = 0.01
const DAY_MS = 86_400_000
const BUCKET_PRIORITY: Record<AgedBalanceBucketKey, number> = {
  notDue: 0,
  "0_30": 1,
  "31_60": 2,
  "60plus": 3,
}

interface OpenInvoice {
  id: string
  partyKey: string
  partyLabel: string
  ecritureNum: string
  ecritureLib: string
  pieceRef: string
  pieceDate: Date | null
  date: Date
  amount: number
}

interface QueuedInvoice {
  id: string
  ecritureNum: string
  ecritureLib: string
  pieceRef: string
  pieceDate: Date | null
  date: Date
  amount: number
}

// Consomme les factures les plus anciennes a hauteur de `payment`.
// Retourne le residu de paiement non impute (avoir / acompte).
function applyPaymentFIFO(queue: QueuedInvoice[], payment: number): number {
  let remaining = payment
  while (remaining > 0 && queue.length > 0) {
    const front = queue[0]
    const consumed = Math.min(remaining, front.amount)
    front.amount -= consumed
    remaining -= consumed
    if (front.amount <= AMOUNT_TOLERANCE) queue.shift()
  }
  return remaining
}

// Pour un tiers, applique les regles de matching FIFO et renvoie la queue
// finale des factures restant ouvertes.
function netOneParty(
  partyEntries: FecEntry[],
  signMultiplier: 1 | -1
): QueuedInvoice[] {
  partyEntries.sort(
    (a, b) => a.ecritureDate.getTime() - b.ecritureDate.getTime()
  )

  const queue: QueuedInvoice[] = []
  // Avoirs / paiements anticipes pas encore imputes a une facture
  let creditPool = 0

  for (const [index, e] of partyEntries.entries()) {
    const value = signMultiplier === 1 ? e.debit - e.credit : e.credit - e.debit
    if (value > AMOUNT_TOLERANCE) {
      const applied = Math.min(value, creditPool)
      creditPool -= applied
      const remaining = value - applied
      if (remaining > AMOUNT_TOLERANCE)
        queue.push({
          id: invoiceId(e, index),
          ecritureNum: e.ecritureNum,
          ecritureLib: e.ecritureLib,
          pieceRef: e.pieceRef,
          pieceDate: e.pieceDate,
          date: e.ecritureDate,
          amount: remaining,
        })
    } else if (value < -AMOUNT_TOLERANCE) {
      const residue = applyPaymentFIFO(queue, -value)
      if (residue > AMOUNT_TOLERANCE) creditPool += residue
    }
  }

  return queue
}

function netOpenInvoicesByParty(
  entries: FecEntry[],
  isAccountFn: (compteNum: string) => boolean,
  signMultiplier: 1 | -1
): OpenInvoice[] {
  const byParty = new Map<string, { label: string; entries: FecEntry[] }>()
  for (const e of entries) {
    if (!isAccountFn(e.compteNum)) continue
    const key = e.compAuxNum || e.compteNum
    const label = e.compAuxLib || e.compteLib || key
    let group = byParty.get(key)
    if (!group) {
      group = { label, entries: [] }
      byParty.set(key, group)
    }
    group.entries.push(e)
  }

  const open: OpenInvoice[] = []
  for (const [partyKey, { label, entries: partyEntries }] of byParty) {
    const queue = netOneParty(partyEntries, signMultiplier)
    for (const inv of queue) {
      if (inv.amount > AMOUNT_TOLERANCE)
        open.push({
          id: inv.id,
          partyKey,
          partyLabel: label,
          ecritureNum: inv.ecritureNum,
          ecritureLib: inv.ecritureLib,
          pieceRef: inv.pieceRef,
          pieceDate: inv.pieceDate,
          date: inv.date,
          amount: inv.amount,
        })
    }
  }

  return open
}

function makeBuckets(): Record<AgedBalanceBucketKey, AgedBalanceBucket> {
  return {
    notDue: { key: "notDue", label: "Non échu", count: 0, amount: 0 },
    "0_30": { key: "0_30", label: "0 à 30 j", count: 0, amount: 0 },
    "31_60": { key: "31_60", label: "31 à 60 j", count: 0, amount: 0 },
    "60plus": { key: "60plus", label: "+ 60 j", count: 0, amount: 0 },
  }
}

function bucketForDays(
  buckets: Record<AgedBalanceBucketKey, AgedBalanceBucket>,
  daysOverdue: number
): AgedBalanceBucket {
  if (daysOverdue < 0) return buckets.notDue
  if (daysOverdue <= 30) return buckets["0_30"]
  if (daysOverdue <= 60) return buckets["31_60"]
  return buckets["60plus"]
}

interface AgedBalanceOptions {
  asOf: Date
  paymentDays?: number
  topN?: number
}

interface AccountSelector {
  isAccountFn: (compteNum: string) => boolean
  signMultiplier: 1 | -1
}

interface AgedBalanceAggregate {
  buckets: Record<AgedBalanceBucketKey, AgedBalanceBucket>
  invoices: AgedBalanceInvoice[]
  partyAgg: Map<string, AgedBalanceCounterparty>
  partySet: Set<string>
  overduePartySet: Set<string>
  notDuePartySet: Set<string>
  totals: {
    totalAmount: number
    invoiceCount: number
    overdueAmount: number
    overdueInvoiceCount: number
    notDueAmount: number
    notDueInvoiceCount: number
  }
}

interface InvoiceAge {
  daysOverdue: number
  daysOpen: number
}

function createAgedBalanceAggregate(): AgedBalanceAggregate {
  return {
    buckets: makeBuckets(),
    invoices: [],
    partyAgg: new Map(),
    partySet: new Set(),
    overduePartySet: new Set(),
    notDuePartySet: new Set(),
    totals: {
      totalAmount: 0,
      invoiceCount: 0,
      overdueAmount: 0,
      overdueInvoiceCount: 0,
      notDueAmount: 0,
      notDueInvoiceCount: 0,
    },
  }
}

function getOrCreateCounterpartyAgg(
  aggregate: AgedBalanceAggregate,
  inv: OpenInvoice,
  bucket: AgedBalanceBucket,
  age: InvoiceAge
): AgedBalanceCounterparty {
  let agg = aggregate.partyAgg.get(inv.partyKey)
  if (!agg) {
    agg = {
      accountNum: inv.partyKey,
      label: inv.partyLabel,
      totalAmount: 0,
      overdueAmount: 0,
      oldestDaysOverdue: age.daysOverdue,
      oldestOpenDays: age.daysOpen,
      invoiceCount: 0,
      worstBucketKey: bucket.key,
      worstBucketLabel: bucket.label,
      worstBucketAmount: 0,
    }
    aggregate.partyAgg.set(inv.partyKey, agg)
  }
  return agg
}

function updateWorstBucket(
  agg: AgedBalanceCounterparty,
  bucket: AgedBalanceBucket,
  amount: number
) {
  const bucketPriority = BUCKET_PRIORITY[bucket.key]
  const worstPriority = BUCKET_PRIORITY[agg.worstBucketKey]
  if (bucketPriority > worstPriority) {
    agg.worstBucketKey = bucket.key
    agg.worstBucketLabel = bucket.label
    agg.worstBucketAmount = amount
  } else if (bucketPriority === worstPriority) {
    agg.worstBucketAmount += amount
  }
}

function addOpenInvoiceToAggregate(
  aggregate: AgedBalanceAggregate,
  inv: OpenInvoice,
  asOfMs: number,
  paymentDays: number
) {
  const dueMs = inv.date.getTime() + paymentDays * DAY_MS
  const daysOverdue = Math.floor((asOfMs - dueMs) / DAY_MS)
  const daysOpen = Math.max(
    0,
    Math.floor((asOfMs - inv.date.getTime()) / DAY_MS)
  )
  const bucket = bucketForDays(aggregate.buckets, daysOverdue)
  const agg = getOrCreateCounterpartyAgg(aggregate, inv, bucket, {
    daysOpen,
    daysOverdue,
  })
  const dueDate = new Date(dueMs)

  aggregate.totals.totalAmount += inv.amount
  aggregate.totals.invoiceCount += 1
  aggregate.partySet.add(inv.partyKey)
  aggregate.invoices.push({
    id: inv.id,
    accountNum: inv.partyKey,
    label: inv.partyLabel,
    ecritureNum: inv.ecritureNum,
    ecritureLib: inv.ecritureLib,
    pieceRef: inv.pieceRef,
    pieceDate: inv.pieceDate,
    invoiceDate: inv.date,
    dueDate,
    amount: inv.amount,
    daysOverdue,
    daysOpen,
    bucketKey: bucket.key,
    bucketLabel: bucket.label,
  })
  agg.totalAmount += inv.amount
  agg.invoiceCount += 1
  if (daysOverdue > agg.oldestDaysOverdue) agg.oldestDaysOverdue = daysOverdue
  if (daysOpen > agg.oldestOpenDays) agg.oldestOpenDays = daysOpen
  updateWorstBucket(agg, bucket, inv.amount)

  bucket.count += 1
  bucket.amount += inv.amount

  if (daysOverdue < 0) {
    aggregate.totals.notDueAmount += inv.amount
    aggregate.totals.notDueInvoiceCount += 1
    aggregate.notDuePartySet.add(inv.partyKey)
  } else {
    aggregate.totals.overdueAmount += inv.amount
    aggregate.totals.overdueInvoiceCount += 1
    aggregate.overduePartySet.add(inv.partyKey)
    agg.overdueAmount += inv.amount
  }
}

function aggregateOpenInvoices(
  open: OpenInvoice[],
  asOfMs: number,
  paymentDays: number
): AgedBalanceAggregate {
  const aggregate = createAgedBalanceAggregate()
  for (const inv of open)
    addOpenInvoiceToAggregate(aggregate, inv, asOfMs, paymentDays)
  return aggregate
}

function computeAgedBalance(
  entries: FecEntry[],
  selector: AccountSelector,
  options: AgedBalanceOptions
): AgedBalance {
  const paymentDays = options.paymentDays ?? PAYMENT_DAYS_DEFAULT
  const topN = options.topN ?? TOP_N_DEFAULT
  const open = netOpenInvoicesByParty(
    entries,
    selector.isAccountFn,
    selector.signMultiplier
  )
  const {
    buckets,
    invoices,
    partyAgg,
    partySet,
    overduePartySet,
    notDuePartySet,
    totals,
  } = aggregateOpenInvoices(open, options.asOf.getTime(), paymentDays)

  const counterparties = Array.from(partyAgg.values()).toSorted(
    (a, b) => b.totalAmount - a.totalAmount
  )

  const topOverdueParties = counterparties
    .filter((p) => p.overdueAmount > 0)
    .toSorted((a, b) => b.overdueAmount - a.overdueAmount)
    .slice(0, topN)

  return {
    asOf: options.asOf,
    paymentDays,
    totalAmount: totals.totalAmount,
    invoiceCount: totals.invoiceCount,
    partyCount: partySet.size,
    overdueAmount: totals.overdueAmount,
    overdueInvoiceCount: totals.overdueInvoiceCount,
    overduePartyCount: overduePartySet.size,
    notDueAmount: totals.notDueAmount,
    notDueInvoiceCount: totals.notDueInvoiceCount,
    notDuePartyCount: notDuePartySet.size,
    buckets: Object.values(buckets),
    invoices: sortAgedBalanceInvoices(invoices),
    counterparties,
    topOverdueParties,
  }
}

function invoiceId(entry: FecEntry, index: number): string {
  return [
    entry.compAuxNum || entry.compteNum,
    entry.ecritureNum,
    entry.pieceRef,
    entry.ecritureDate.toISOString(),
    String(index),
  ]
    .filter(Boolean)
    .join(":")
}

function sortAgedBalanceInvoices(
  invoices: AgedBalanceInvoice[]
): AgedBalanceInvoice[] {
  return [...invoices].toSorted((a, b) => {
    const bucketDiff =
      BUCKET_PRIORITY[b.bucketKey] - BUCKET_PRIORITY[a.bucketKey]
    if (bucketDiff !== 0) return bucketDiff

    const dueDiff = a.dueDate.getTime() - b.dueDate.getTime()
    if (dueDiff !== 0) return dueDiff

    const amountDiff = b.amount - a.amount
    if (amountDiff !== 0) return amountDiff

    return a.label.localeCompare(b.label, "fr")
  })
}

export function computeAgedReceivables(
  entries: FecEntry[],
  asOf: Date
): AgedBalance {
  return computeAgedBalance(
    entries,
    { isAccountFn: isCustomerAccount, signMultiplier: 1 },
    { asOf }
  )
}

export function computeAgedPayables(
  entries: FecEntry[],
  asOf: Date
): AgedBalance {
  return computeAgedBalance(
    entries,
    { isAccountFn: isSupplierAccount, signMultiplier: -1 },
    { asOf }
  )
}

// Balance agee (aged balance) : pour chaque tiers, on isole les factures
// restant a payer en faisant un matching FIFO entre factures et reglements.
// Plus robuste que de se baser uniquement sur le lettrage (`ecritureLet`),
// souvent absent dans les FEC reels. Les totaux sont identiques quand le
// lettrage est correctement applique.

import { isCustomerAccount, isSupplierAccount } from "./accounts"
import {
  netOpenInvoicesByParty,
  type OpenInvoice,
} from "./aged-balance-matching"
import type {
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
} from "./aged-balance-types"
import type { FecEntry } from "./types"

const PAYMENT_DAYS_DEFAULT = 30
const TOP_N_DEFAULT = 5
const DAY_MS = 86_400_000
const BUCKET_PRIORITY: Record<AgedBalanceBucketKey, number> = {
  notDue: 0,
  "0_30": 1,
  "31_60": 2,
  "60plus": 3,
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

export type {
  AgedBalance,
  AgedBalanceBucket,
  AgedBalanceBucketKey,
  AgedBalanceCounterparty,
  AgedBalanceInvoice,
} from "./aged-balance-types"

import type { FecEntry } from "./types"

const AMOUNT_TOLERANCE = 0.01

export interface OpenInvoice {
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

export function netOpenInvoicesByParty(
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
      if (inv.amount > AMOUNT_TOLERANCE) {
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
  }

  return open
}

function netOneParty(
  partyEntries: FecEntry[],
  signMultiplier: 1 | -1
): QueuedInvoice[] {
  partyEntries.sort(
    (a, b) => a.ecritureDate.getTime() - b.ecritureDate.getTime()
  )

  const queue: QueuedInvoice[] = []
  let creditPool = 0

  for (const [index, e] of partyEntries.entries()) {
    const value = signMultiplier === 1 ? e.debit - e.credit : e.credit - e.debit
    if (value > AMOUNT_TOLERANCE) {
      creditPool = addInvoiceToQueue(queue, e, index, value, creditPool)
    } else if (value < -AMOUNT_TOLERANCE) {
      const residue = applyPaymentFIFO(queue, -value)
      if (residue > AMOUNT_TOLERANCE) creditPool += residue
    }
  }

  return queue
}

function addInvoiceToQueue(
  queue: QueuedInvoice[],
  entry: FecEntry,
  index: number,
  value: number,
  creditPool: number
): number {
  const applied = Math.min(value, creditPool)
  const remainingCredit = creditPool - applied
  const remainingInvoice = value - applied

  if (remainingInvoice > AMOUNT_TOLERANCE) {
    queue.push({
      id: invoiceId(entry, index),
      ecritureNum: entry.ecritureNum,
      ecritureLib: entry.ecritureLib,
      pieceRef: entry.pieceRef,
      pieceDate: entry.pieceDate,
      date: entry.ecritureDate,
      amount: remainingInvoice,
    })
  }

  return remainingCredit
}

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

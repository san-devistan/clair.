import { isCashAccount, isCustomerAccount, isSupplierAccount } from "./accounts"
import type { TopCounterparty } from "./analytics-types"
import { resolvePlanComptableEntry } from "./plan-comptable-2026"
import type { FecEntry } from "./types"

const ALL_COUNTERPARTIES_LIMIT = Number.MAX_SAFE_INTEGER

export function computeOfficialPlanWarnings(entries: FecEntry[]): string[] {
  const unknownAccounts = new Map<string, string>()
  for (const entry of entries) {
    if (resolvePlanComptableEntry(entry.compteNum)) continue
    if (!unknownAccounts.has(entry.compteNum)) {
      unknownAccounts.set(entry.compteNum, entry.compteLib)
    }
  }

  if (unknownAccounts.size === 0) return []

  const preview = Array.from(unknownAccounts.entries())
    .slice(0, 8)
    .map(([code, label]) => (label ? `${code} (${label})` : code))
  const suffix = unknownAccounts.size > preview.length ? ", ..." : ""

  return [
    `${unknownAccounts.size} compte(s) non rattaché(s) au plan de comptes officiel 2026 : ${preview.join(", ")}${suffix}. Ces comptes sont exclus des catégories métier.`,
  ]
}

export function computeTopCustomers(entries: FecEntry[]): TopCounterparty[] {
  return computeTopCounterparties(
    entries,
    (entry) =>
      isCustomerAccount(entry.compteNum) &&
      (entry.compAuxNum.length > 0 || entry.compteNum.length > 3),
    (entry) => entry.debit,
    ALL_COUNTERPARTIES_LIMIT
  )
}

export function computeTopSuppliers(entries: FecEntry[]): TopCounterparty[] {
  return computeTopCounterparties(
    entries,
    (entry) =>
      isSupplierAccount(entry.compteNum) &&
      (entry.compAuxNum.length > 0 || entry.compteNum.length > 3),
    (entry) => entry.credit,
    ALL_COUNTERPARTIES_LIMIT
  )
}

export function computeCashByAccount(entries: FecEntry[]): TopCounterparty[] {
  const map = new Map<string, TopCounterparty>()
  for (const entry of entries) {
    if (!isCashAccount(entry.compteNum)) continue
    const item = getOrCreateCounterparty(map, {
      key: entry.compteNum,
      label: entry.compteLib || entry.compteNum,
      date: entry.ecritureDate,
    })
    item.amount += entry.debit - entry.credit
    item.entryCount += 1
    updateCounterpartyDates(item, entry.ecritureDate)
  }
  return Array.from(map.values()).toSorted((a, b) => b.amount - a.amount)
}

function computeTopCounterparties(
  entries: FecEntry[],
  predicate: (entry: FecEntry) => boolean,
  amountFn: (entry: FecEntry) => number,
  limit: number
): TopCounterparty[] {
  const map = new Map<string, TopCounterparty>()
  for (const entry of entries) {
    if (!predicate(entry)) continue
    const key = entry.compAuxNum || entry.compteNum
    const amount = amountFn(entry)
    if (amount === 0) continue
    const item = getOrCreateCounterparty(map, {
      key,
      label: entry.compAuxLib || entry.compteLib || key,
      date: entry.ecritureDate,
    })
    item.amount += amount
    item.entryCount += 1
    updateCounterpartyDates(item, entry.ecritureDate)
  }

  return Array.from(map.values())
    .filter((counterparty) => counterparty.amount > 0)
    .toSorted((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function getOrCreateCounterparty(
  map: Map<string, TopCounterparty>,
  input: { key: string; label: string; date: Date }
): TopCounterparty {
  const existing = map.get(input.key)
  if (existing) return existing

  const item = {
    accountNum: input.key,
    label: input.label,
    amount: 0,
    entryCount: 0,
    firstDate: input.date,
    lastDate: input.date,
  }
  map.set(input.key, item)
  return item
}

function updateCounterpartyDates(item: TopCounterparty, date: Date) {
  if (date < item.firstDate) item.firstDate = date
  if (date > item.lastDate) item.lastDate = date
}

import type { FecEntry } from "./types"

export interface AccountDetail {
  id: string
  accountNum: string
  accountLabel: string
  categoryKey: string
  categoryLabel: string
  categoryFill: string
  auxNum: string
  auxLabel: string
  label: string
  amount: number
  entryCount: number
  lastDate: Date
}

interface AccountDetailDraft {
  id: string
  accountNum: string
  accountLabel: string
  categoryKey: string
  categoryLabel: string
  categoryFill: string
  auxNum: string
  auxLabel: string
  amount: number
  lastDate: Date
}

interface AuxiliaryContext {
  auxNum: string
  auxLabel: string
}

interface DetailCategoryContext {
  categoryKey: string
  categoryLabel: string
  categoryFill: string
}

interface AccountDetailOptions {
  auxiliaryPredicate?: (e: FecEntry) => boolean
  categoryForAccount?: (accountNum: string) => DetailCategoryContext | null
}

function buildAccountDetailLabel({
  accountLabel,
  accountNum,
  auxLabel,
  auxNum,
}: {
  accountLabel: string
  accountNum: string
  auxLabel: string
  auxNum: string
}): string {
  return auxLabel || auxNum || accountLabel || accountNum
}

function entryKey(entry: FecEntry): string {
  return `${entry.journalCode}::${entry.ecritureNum}`
}

function auxiliaryContextFromEntry(entry: FecEntry): AuxiliaryContext | null {
  const auxNum = entry.compAuxNum.trim()
  const auxLabel = entry.compAuxLib.trim()
  if (!auxNum && !auxLabel) return null
  return { auxNum, auxLabel }
}

function emptyAuxiliaryContext(): AuxiliaryContext {
  return { auxNum: "", auxLabel: "" }
}

function emptyCategoryContext(): DetailCategoryContext {
  return {
    categoryKey: "",
    categoryLabel: "",
    categoryFill: "var(--muted-foreground)",
  }
}

function detailId(accountNum: string, context: AuxiliaryContext): string {
  const auxKey = context.auxNum || context.auxLabel
  return auxKey ? `${accountNum}::${auxKey}` : accountNum
}

function buildAuxiliaryContextByEntry(
  entries: FecEntry[],
  predicate: ((e: FecEntry) => boolean) | undefined
): Map<string, AuxiliaryContext> {
  const map = new Map<string, AuxiliaryContext>()
  if (!predicate) return map

  for (const entry of entries) {
    if (!predicate(entry)) continue
    const context = auxiliaryContextFromEntry(entry)
    if (context && !map.has(entryKey(entry))) map.set(entryKey(entry), context)
  }

  return map
}

function buildAccountDetailDraft(
  entry: FecEntry,
  amount: number,
  fallbackContext: AuxiliaryContext | null,
  options: AccountDetailOptions
): AccountDetailDraft | null {
  if (amount === 0) return null

  const accountNum = entry.compteNum.trim()
  const accountLabel = entry.compteLib.trim()
  const category = options.categoryForAccount?.(accountNum)
  const auxContext =
    auxiliaryContextFromEntry(entry) ??
    fallbackContext ??
    emptyAuxiliaryContext()
  const categoryContext = category ?? emptyCategoryContext()

  return {
    id: detailId(accountNum, auxContext),
    accountNum,
    accountLabel,
    ...categoryContext,
    ...auxContext,
    amount,
    lastDate: entry.ecritureDate,
  }
}

function createAccountDetail(draft: AccountDetailDraft): AccountDetail {
  return {
    ...draft,
    label: buildAccountDetailLabel(draft),
    amount: 0,
    entryCount: 0,
  }
}

function mergeAccountDetail(
  item: AccountDetail,
  draft: AccountDetailDraft
): void {
  mergeMissingText(item, draft, "accountLabel")
  mergeMissingText(item, draft, "categoryKey")
  mergeMissingText(item, draft, "categoryLabel")
  mergeMissingText(item, draft, "categoryFill")
  mergeMissingText(item, draft, "auxNum")
  mergeMissingText(item, draft, "auxLabel")
  item.label = buildAccountDetailLabel(item)
  item.amount += draft.amount
  item.entryCount += 1
  if (draft.lastDate > item.lastDate) item.lastDate = draft.lastDate
}

function mergeMissingText(
  item: AccountDetail,
  draft: AccountDetailDraft,
  key: keyof Pick<
    AccountDetail,
    | "accountLabel"
    | "categoryKey"
    | "categoryLabel"
    | "categoryFill"
    | "auxNum"
    | "auxLabel"
  >
): void {
  if (!item[key] && draft[key]) item[key] = draft[key]
}

function upsertAccountDetail(
  map: Map<string, AccountDetail>,
  draft: AccountDetailDraft
): void {
  let item = map.get(draft.id)
  if (!item) {
    item = createAccountDetail(draft)
    map.set(draft.id, item)
  }
  mergeAccountDetail(item, draft)
}

export function computeAccountDetails(
  entries: FecEntry[],
  predicate: (e: FecEntry) => boolean,
  amountFn: (e: FecEntry) => number,
  options: AccountDetailOptions = {}
): AccountDetail[] {
  const map = new Map<string, AccountDetail>()
  const contexts = buildAuxiliaryContextByEntry(
    entries,
    options.auxiliaryPredicate
  )

  for (const e of entries) {
    if (!predicate(e)) continue

    const draft = buildAccountDetailDraft(
      e,
      amountFn(e),
      contexts.get(entryKey(e)) ?? null,
      options
    )
    if (!draft) continue

    upsertAccountDetail(map, draft)
  }

  const list = Array.from(map.values()).filter((c) => c.amount !== 0)
  list.sort((a, b) => b.amount - a.amount)
  return list
}

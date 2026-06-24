import type { DataSource } from "./data-source"
import { isMonthKey, type MonthRange } from "./date-ranges"
import type { FecEntry, FecParseResult } from "./types"

const STORAGE_KEY = "clair.fec.dashboard"
const STORAGE_VERSION = 2

export interface PersistedFecStore {
  source: DataSource | null
  selectedRange: MonthRange | null
  comparisonRange: MonthRange | null
}

type SerializedFecEntry = Omit<
  FecEntry,
  "ecritureDate" | "pieceDate" | "dateLet" | "validDate"
> & {
  ecritureDate: string
  pieceDate: string | null
  dateLet: string | null
  validDate: string | null
}

type SerializedFecParseResult = Omit<FecParseResult, "entries" | "meta"> & {
  entries: SerializedFecEntry[]
  meta: Omit<FecParseResult["meta"], "minDate" | "maxDate"> & {
    minDate: string | null
    maxDate: string | null
  }
}

type SerializedDataSource = {
  kind: "fec"
  parseResult: SerializedFecParseResult
}

interface SerializedStore {
  version: typeof STORAGE_VERSION
  source: SerializedDataSource | null
  selectedRange: MonthRange | null
  comparisonRange: MonthRange | null
}

export function loadStore(): PersistedFecStore {
  if (typeof window === "undefined") return EMPTY_PERSISTED_STORE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PERSISTED_STORE

    const store = parseSerializedStore(raw)
    if (!store) {
      window.localStorage.removeItem(STORAGE_KEY)
      return EMPTY_PERSISTED_STORE
    }

    return store
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return EMPTY_PERSISTED_STORE
  }
}

export function saveStore(store: PersistedFecStore) {
  if (typeof window === "undefined") return
  const serialized: SerializedStore = {
    version: STORAGE_VERSION,
    source: store.source ? serializeDataSource(store.source) : null,
    selectedRange: store.selectedRange,
    comparisonRange: store.comparisonRange,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
}

export function clearStore() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function clearLegacyStorage() {
  if (typeof window === "undefined") return

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if (
      key.startsWith("clair.fec.dashboard.v") ||
      key.startsWith("clair.fec.dashboard.comparison.v")
    ) {
      window.localStorage.removeItem(key)
    }
  }
}

export async function buildDemoFile(): Promise<File> {
  const { generateDemoFecText } = await import("./demo")
  const text = generateDemoFecText()
  const blob = new Blob([text], { type: "text/plain" })
  return new File([blob], "demo-clair.txt", { type: "text/plain" })
}

const EMPTY_PERSISTED_STORE: PersistedFecStore = {
  source: null,
  selectedRange: null,
  comparisonRange: null,
}

function serializeDataSource(source: DataSource): SerializedDataSource {
  return {
    kind: "fec",
    parseResult: serializeParseResult(source.parseResult),
  }
}

function serializeParseResult(
  parseResult: FecParseResult
): SerializedFecParseResult {
  return {
    entries: parseResult.entries.map(serializeFecEntry),
    warnings: parseResult.warnings,
    meta: {
      ...parseResult.meta,
      minDate: parseResult.meta.minDate?.toISOString() ?? null,
      maxDate: parseResult.meta.maxDate?.toISOString() ?? null,
    },
  }
}

function serializeFecEntry(entry: FecEntry): SerializedFecEntry {
  return {
    ...entry,
    ecritureDate: entry.ecritureDate.toISOString(),
    pieceDate: entry.pieceDate?.toISOString() ?? null,
    dateLet: entry.dateLet?.toISOString() ?? null,
    validDate: entry.validDate?.toISOString() ?? null,
  }
}

function parseSerializedStore(raw: string): PersistedFecStore | null {
  const parsed: unknown = JSON.parse(raw)
  const record = asRecord(parsed)
  if (!record || record.version !== STORAGE_VERSION) return null

  return {
    source: deserializeDataSource(record.source),
    selectedRange: deserializeMonthRange(record.selectedRange),
    comparisonRange: deserializeMonthRange(record.comparisonRange),
  }
}

function deserializeDataSource(value: unknown): DataSource | null {
  if (value === null || value === undefined) return null

  const record = asRecord(value)
  if (!record || record.kind !== "fec") return null

  const parseResult = deserializeParseResult(record.parseResult)
  return parseResult ? { kind: "fec", parseResult } : null
}

function deserializeParseResult(value: unknown): FecParseResult | null {
  const record = asRecord(value)
  const meta = asRecord(record?.meta)
  if (!record || !meta || !Array.isArray(record.entries)) return null

  const entries: FecEntry[] = []
  for (const entryValue of record.entries) {
    const entry = deserializeFecEntry(entryValue)
    if (!entry) return null
    entries.push(entry)
  }

  if (entries.length === 0 || !Array.isArray(record.warnings)) return null

  const separator = deserializeSeparator(meta.separator)
  if (!separator) return null

  return {
    entries,
    warnings: record.warnings.filter((warning) => typeof warning === "string"),
    meta: {
      fileName: stringValue(meta.fileName),
      fileSizeBytes: numberValue(meta.fileSizeBytes),
      encoding: stringValue(meta.encoding),
      separator,
      rowCount: numberValue(meta.rowCount),
      parsedAt: numberValue(meta.parsedAt),
      minDate: nullableDate(meta.minDate),
      maxDate: nullableDate(meta.maxDate),
    },
  }
}

function deserializeFecEntry(value: unknown): FecEntry | null {
  const record = asRecord(value)
  if (!record) return null

  const ecritureDate = dateValue(record.ecritureDate)
  if (!ecritureDate) return null

  return {
    journalCode: stringValue(record.journalCode),
    journalLib: stringValue(record.journalLib),
    ecritureNum: stringValue(record.ecritureNum),
    ecritureDate,
    ecritureLib: stringValue(record.ecritureLib),
    compteNum: stringValue(record.compteNum),
    compteLib: stringValue(record.compteLib),
    compAuxNum: stringValue(record.compAuxNum),
    compAuxLib: stringValue(record.compAuxLib),
    pieceRef: stringValue(record.pieceRef),
    pieceDate: nullableDate(record.pieceDate),
    debit: numberValue(record.debit),
    credit: numberValue(record.credit),
    ecritureLet: stringValue(record.ecritureLet),
    dateLet: nullableDate(record.dateLet),
    validDate: nullableDate(record.validDate),
    montantDevise:
      record.montantDevise === null ? null : numberValue(record.montantDevise),
    idevise: stringValue(record.idevise),
  }
}

function deserializeMonthRange(value: unknown): MonthRange | null {
  const record = asRecord(value)
  if (!record) return null

  const startMonth = record.startMonth
  const endMonth = record.endMonth
  return typeof startMonth === "string" &&
    typeof endMonth === "string" &&
    isMonthKey(startMonth) &&
    isMonthKey(endMonth)
    ? { startMonth, endMonth }
    : null
}

function deserializeSeparator(
  value: unknown
): FecParseResult["meta"]["separator"] | null {
  return value === "\t" || value === ";" || value === "|" || value === ","
    ? value
    : null
}

function nullableDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null
  return dateValue(value)
}

function dateValue(value: unknown): Date | null {
  if (typeof value !== "string") return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

import {
  assignExpenseFills,
  assignRevenueFills,
  type DashboardData,
} from "./analytics"
import { computeInsights } from "./insights"

const STORAGE_KEY = "clair.fec.dashboard"

type SerializedAgedBalance = Omit<
  DashboardData["agedReceivables"],
  "asOf" | "invoices"
> & {
  asOf: string
  invoices: Array<
    Omit<
      DashboardData["agedReceivables"]["invoices"][number],
      "pieceDate" | "invoiceDate" | "dueDate"
    > & {
      pieceDate: string | null
      invoiceDate: string
      dueDate: string
    }
  >
}

type SerializedBalanceSheet = Omit<DashboardData["balanceSheet"], "asOf"> & {
  asOf: string
}

interface SerializedSnapshot {
  meta: DashboardData["meta"]
  period: {
    startDate: string
    endDate: string
    fiscalYear: number
    monthsCovered: number
  }
  kpi: DashboardData["kpi"]
  monthly: DashboardData["monthly"]
  expenseCategories: DashboardData["expenseCategories"]
  revenueCategories: DashboardData["revenueCategories"]
  topCustomers: Array<
    Omit<DashboardData["topCustomers"][number], "firstDate" | "lastDate"> & {
      firstDate: string
      lastDate: string
    }
  >
  topSuppliers: Array<
    Omit<DashboardData["topSuppliers"][number], "firstDate" | "lastDate"> & {
      firstDate: string
      lastDate: string
    }
  >
  expenseDetails: Array<
    Omit<DashboardData["expenseDetails"][number], "lastDate"> & {
      lastDate: string
    }
  >
  revenueDetails: Array<
    Omit<DashboardData["revenueDetails"][number], "lastDate"> & {
      lastDate: string
    }
  >
  cashByAccount: Array<
    Omit<DashboardData["cashByAccount"][number], "firstDate" | "lastDate"> & {
      firstDate: string
      lastDate: string
    }
  >
  insights: DashboardData["insights"]
  agedReceivables: SerializedAgedBalance
  agedPayables: SerializedAgedBalance
  cashProjection: Omit<DashboardData["cashProjection"], "asOf"> & {
    asOf: string
  }
  balanceSheet: SerializedBalanceSheet
  warnings: string[]
}

interface SerializedStore {
  primary: SerializedSnapshot | null
  comparison: SerializedSnapshot | null
}

export function loadStore(): {
  primary: DashboardData | null
  comparison: DashboardData | null
} {
  if (typeof window === "undefined") return { primary: null, comparison: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { primary: null, comparison: null }
    const store = parseSerializedStore(raw)
    if (!store) return { primary: null, comparison: null }
    return {
      primary: store.primary ? deserialize(store.primary) : null,
      comparison: store.comparison ? deserialize(store.comparison) : null,
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return { primary: null, comparison: null }
  }
}

export function saveStore(
  primary: DashboardData | null,
  comparison: DashboardData | null
) {
  if (typeof window === "undefined") return
  const store: SerializedStore = {
    primary: primary ? serialize(primary) : null,
    comparison: comparison ? serialize(comparison) : null,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
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

function serialize(data: DashboardData): SerializedSnapshot {
  return {
    meta: data.meta,
    period: {
      startDate: data.period.startDate.toISOString(),
      endDate: data.period.endDate.toISOString(),
      fiscalYear: data.period.fiscalYear,
      monthsCovered: data.period.monthsCovered,
    },
    kpi: data.kpi,
    monthly: data.monthly,
    expenseCategories: stripFill(data.expenseCategories),
    revenueCategories: stripFill(data.revenueCategories),
    topCustomers: data.topCustomers.map(serializeDatedCounterparty),
    topSuppliers: data.topSuppliers.map(serializeDatedCounterparty),
    expenseDetails: data.expenseDetails.map((c) => ({
      ...c,
      lastDate: c.lastDate.toISOString(),
    })),
    revenueDetails: data.revenueDetails.map((c) => ({
      ...c,
      lastDate: c.lastDate.toISOString(),
    })),
    cashByAccount: data.cashByAccount.map(serializeDatedCounterparty),
    insights: data.insights,
    agedReceivables: serializeAgedBalance(data.agedReceivables),
    agedPayables: serializeAgedBalance(data.agedPayables),
    cashProjection: {
      ...data.cashProjection,
      asOf: data.cashProjection.asOf.toISOString(),
    },
    balanceSheet: serializeBalanceSheet(data.balanceSheet),
    warnings: data.warnings,
  }
}

function deserialize(snap: SerializedSnapshot): DashboardData {
  const data: DashboardData = {
    meta: {
      ...snap.meta,
      minDate: snap.meta.minDate ? new Date(String(snap.meta.minDate)) : null,
      maxDate: snap.meta.maxDate ? new Date(String(snap.meta.maxDate)) : null,
    },
    period: {
      startDate: new Date(snap.period.startDate),
      endDate: new Date(snap.period.endDate),
      fiscalYear: snap.period.fiscalYear,
      monthsCovered: snap.period.monthsCovered,
    },
    kpi: snap.kpi,
    monthly: snap.monthly,
    expenseCategories: assignExpenseFills(snap.expenseCategories),
    revenueCategories: assignRevenueFills(snap.revenueCategories),
    topCustomers: snap.topCustomers.map(deserializeDatedCounterparty),
    topSuppliers: snap.topSuppliers.map(deserializeDatedCounterparty),
    expenseDetails: snap.expenseDetails.map((c) => ({
      ...c,
      lastDate: new Date(c.lastDate),
    })),
    revenueDetails: snap.revenueDetails.map((c) => ({
      ...c,
      lastDate: new Date(c.lastDate),
    })),
    cashByAccount: snap.cashByAccount.map(deserializeDatedCounterparty),
    insights: snap.insights,
    agedReceivables: deserializeAgedBalance(snap.agedReceivables),
    agedPayables: deserializeAgedBalance(snap.agedPayables),
    cashProjection: {
      ...snap.cashProjection,
      asOf: new Date(snap.cashProjection.asOf),
    },
    balanceSheet: deserializeBalanceSheet(snap.balanceSheet),
    warnings: snap.warnings,
  }

  return refreshInsights(data)
}

function stripFill(items: DashboardData["expenseCategories"]) {
  return items.map(({ key, label, amount, share }) => ({
    key,
    label,
    amount,
    share,
  }))
}

function serializeAgedBalance(
  data: DashboardData["agedReceivables"]
): SerializedAgedBalance {
  return {
    ...data,
    asOf: data.asOf.toISOString(),
    invoices: data.invoices.map((invoice) => ({
      ...invoice,
      pieceDate: invoice.pieceDate?.toISOString() ?? null,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
    })),
  }
}

function deserializeAgedBalance(
  snap: SerializedAgedBalance
): DashboardData["agedReceivables"] {
  return {
    ...snap,
    asOf: new Date(snap.asOf),
    invoices: snap.invoices.map((invoice) => ({
      ...invoice,
      pieceDate: invoice.pieceDate ? new Date(invoice.pieceDate) : null,
      invoiceDate: new Date(invoice.invoiceDate),
      dueDate: new Date(invoice.dueDate),
    })),
  }
}

function serializeBalanceSheet(
  data: DashboardData["balanceSheet"]
): SerializedBalanceSheet {
  return {
    ...data,
    asOf: data.asOf.toISOString(),
  }
}

function deserializeBalanceSheet(
  snap: SerializedBalanceSheet
): DashboardData["balanceSheet"] {
  return {
    ...snap,
    asOf: new Date(snap.asOf),
  }
}

function serializeDatedCounterparty<
  T extends { firstDate: Date; lastDate: Date },
>(counterparty: T) {
  return {
    ...counterparty,
    firstDate: counterparty.firstDate.toISOString(),
    lastDate: counterparty.lastDate.toISOString(),
  }
}

function deserializeDatedCounterparty<
  T extends { firstDate: string; lastDate: string },
>(counterparty: T) {
  return {
    ...counterparty,
    firstDate: new Date(counterparty.firstDate),
    lastDate: new Date(counterparty.lastDate),
  }
}

function refreshInsights(data: DashboardData): DashboardData {
  return {
    ...data,
    insights: computeInsights({
      kpi: data.kpi,
      expenseCategories: data.expenseCategories,
      topCustomers: data.topCustomers,
      topSuppliers: data.topSuppliers,
      monthly: data.monthly,
    }),
  }
}

function parseSerializedStore(raw: string): SerializedStore | null {
  const parsed: unknown = JSON.parse(raw)
  if (!isSerializedStore(parsed)) return null
  return parsed
}

function isSerializedStore(value: unknown): value is SerializedStore {
  if (typeof value !== "object" || value === null) return false
  return "primary" in value && "comparison" in value
}

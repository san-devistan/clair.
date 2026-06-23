/* oxlint-disable eslint/max-lines */
"use client"

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react"

import {
  assignExpenseFills,
  assignRevenueFills,
  buildDashboardData,
  type DashboardData,
} from "./analytics"
import { computeInsights } from "./insights"
import { parseFecFile } from "./parser"

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
    // `fill` est de la presentation, on le retire avant persistence pour qu'un
    // changement de palette dans globals.css prenne effet sans re-upload.
    expenseCategories: stripFill(data.expenseCategories),
    revenueCategories: stripFill(data.revenueCategories),
    topCustomers: data.topCustomers.map((c) => ({
      ...c,
      firstDate: c.firstDate.toISOString(),
      lastDate: c.lastDate.toISOString(),
    })),
    topSuppliers: data.topSuppliers.map((c) => ({
      ...c,
      firstDate: c.firstDate.toISOString(),
      lastDate: c.lastDate.toISOString(),
    })),
    expenseDetails: data.expenseDetails.map((c) => ({
      ...c,
      lastDate: c.lastDate.toISOString(),
    })),
    revenueDetails: data.revenueDetails.map((c) => ({
      ...c,
      lastDate: c.lastDate.toISOString(),
    })),
    cashByAccount: data.cashByAccount.map((c) => ({
      ...c,
      firstDate: c.firstDate.toISOString(),
      lastDate: c.lastDate.toISOString(),
    })),
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
    // Les fills ne sont pas persistes : on les recalcule a partir de la palette
    // courante. Cela garantit la coherence visuelle apres chaque changement de
    // theme sans necessiter de re-upload du FEC.
    expenseCategories: assignExpenseFills(snap.expenseCategories),
    revenueCategories: assignRevenueFills(snap.revenueCategories),
    topCustomers: snap.topCustomers.map((c) => ({
      ...c,
      firstDate: new Date(c.firstDate),
      lastDate: new Date(c.lastDate),
    })),
    topSuppliers: snap.topSuppliers.map((c) => ({
      ...c,
      firstDate: new Date(c.firstDate),
      lastDate: new Date(c.lastDate),
    })),
    expenseDetails: snap.expenseDetails.map((c) => ({
      ...c,
      lastDate: new Date(c.lastDate),
    })),
    revenueDetails: snap.revenueDetails.map((c) => ({
      ...c,
      lastDate: new Date(c.lastDate),
    })),
    cashByAccount: snap.cashByAccount.map((c) => ({
      ...c,
      firstDate: new Date(c.firstDate),
      lastDate: new Date(c.lastDate),
    })),
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

function clearLegacyStorage() {
  if (typeof window === "undefined") return

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if (
      key.startsWith("clair.fec.dashboard.v") ||
      key.startsWith("clair.fec.dashboard.comparison.v")
    )
      window.localStorage.removeItem(key)
  }
}

function loadStore(): {
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

function parseSerializedStore(raw: string): SerializedStore | null {
  const parsed: unknown = JSON.parse(raw)
  if (!isSerializedStore(parsed)) return null
  return parsed
}

function isSerializedStore(value: unknown): value is SerializedStore {
  if (typeof value !== "object" || value === null) return false
  return "primary" in value && "comparison" in value
}

function saveStore(
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

async function buildDemoFile(): Promise<File> {
  const { generateDemoFecText } = await import("./demo")
  const text = generateDemoFecText()
  const blob = new Blob([text], { type: "text/plain" })
  return new File([blob], "demo-clair.txt", { type: "text/plain" })
}

type ImportState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "ready" }
  | { status: "error"; message: string }

interface FecStoreValue {
  data: DashboardData | null
  hydrated: boolean
  importState: ImportState
  importFile: (file: File) => Promise<void>
  importDemo: () => Promise<void>
  importDashboardData: (data: DashboardData) => void
  reset: () => void
  // Slot secondaire utilise pour comparer un second FEC au FEC principal.
  comparisonData: DashboardData | null
  comparisonImportState: ImportState
  importComparisonFile: (file: File) => Promise<void>
  importComparisonDemo: () => Promise<void>
  resetComparison: () => void
}

const FecStoreContext = createContext<FecStoreValue | null>(null)

interface FecStoreState {
  data: DashboardData | null
  comparisonData: DashboardData | null
  hydrated: boolean
  importState: ImportState
  comparisonImportState: ImportState
}

type ImportSlot = "primary" | "comparison"

type FecStoreAction =
  | {
      type: "hydrate"
      primary: DashboardData | null
      comparison: DashboardData | null
    }
  | { type: "set-import-state"; slot: ImportSlot; importState: ImportState }
  | { type: "set-dashboard"; slot: ImportSlot; data: DashboardData }
  | { type: "reset-comparison" }
  | { type: "reset-all" }

const IDLE_IMPORT_STATE: ImportState = { status: "idle" }
const READY_IMPORT_STATE: ImportState = { status: "ready" }
const INITIAL_FEC_STORE_STATE: FecStoreState = {
  data: null,
  comparisonData: null,
  hydrated: false,
  importState: IDLE_IMPORT_STATE,
  comparisonImportState: IDLE_IMPORT_STATE,
}

function fecStoreReducer(
  state: FecStoreState,
  action: FecStoreAction
): FecStoreState {
  switch (action.type) {
    case "hydrate":
      return {
        data: action.primary,
        comparisonData: action.comparison,
        hydrated: true,
        importState: action.primary ? READY_IMPORT_STATE : IDLE_IMPORT_STATE,
        comparisonImportState: action.comparison
          ? READY_IMPORT_STATE
          : IDLE_IMPORT_STATE,
      }
    case "set-import-state":
      return action.slot === "primary"
        ? { ...state, importState: action.importState }
        : { ...state, comparisonImportState: action.importState }
    case "set-dashboard":
      return action.slot === "primary"
        ? { ...state, data: action.data, importState: READY_IMPORT_STATE }
        : {
            ...state,
            comparisonData: action.data,
            comparisonImportState: READY_IMPORT_STATE,
          }
    case "reset-comparison":
      return {
        ...state,
        comparisonData: null,
        comparisonImportState: IDLE_IMPORT_STATE,
      }
    case "reset-all":
      return { ...INITIAL_FEC_STORE_STATE, hydrated: state.hydrated }
  }
  return state
}

export function FecStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fecStoreReducer, INITIAL_FEC_STORE_STATE)

  useEffect(() => {
    clearLegacyStorage()
    const store = loadStore()
    dispatch({
      type: "hydrate",
      primary: store.primary,
      comparison: store.comparison,
    })
  }, [])

  const parseDashboardFile = useCallback(
    async (file: File, slot: ImportSlot, fallbackError: string) => {
      dispatch({
        type: "set-import-state",
        slot,
        importState: { status: "parsing", fileName: file.name },
      })
      try {
        const parsed = await parseFecFile(file)
        return buildDashboardData(parsed)
      } catch (error) {
        const message = error instanceof Error ? error.message : fallbackError
        dispatch({
          type: "set-import-state",
          slot,
          importState: { status: "error", message },
        })
        throw error
      }
    },
    []
  )

  const importFile = useCallback(
    async (file: File) => {
      const dashboard = await parseDashboardFile(
        file,
        "primary",
        "Une erreur est survenue lors de l'analyse du fichier."
      )
      dispatch({ type: "set-dashboard", slot: "primary", data: dashboard })
      saveStore(dashboard, state.comparisonData)
    },
    [parseDashboardFile, state.comparisonData]
  )

  const importDemo = useCallback(async () => {
    const file = await buildDemoFile()
    const dashboard = await parseDashboardFile(
      file,
      "primary",
      "Erreur lors du chargement du jeu de demonstration."
    )
    dispatch({ type: "set-dashboard", slot: "primary", data: dashboard })
    saveStore(dashboard, state.comparisonData)
  }, [parseDashboardFile, state.comparisonData])

  const importComparisonFile = useCallback(
    async (file: File) => {
      const dashboard = await parseDashboardFile(
        file,
        "comparison",
        "Une erreur est survenue lors de l'analyse du fichier."
      )
      dispatch({ type: "set-dashboard", slot: "comparison", data: dashboard })
      saveStore(state.data, dashboard)
    },
    [parseDashboardFile, state.data]
  )

  const importComparisonDemo = useCallback(async () => {
    const file = await buildDemoFile()
    const dashboard = await parseDashboardFile(
      file,
      "comparison",
      "Erreur lors du chargement du jeu de demonstration."
    )
    dispatch({ type: "set-dashboard", slot: "comparison", data: dashboard })
    saveStore(state.data, dashboard)
  }, [parseDashboardFile, state.data])

  const importDashboardData = useCallback(
    (next: DashboardData) => {
      dispatch({ type: "set-dashboard", slot: "primary", data: next })
      saveStore(next, state.comparisonData)
    },
    [state.comparisonData]
  )

  const resetComparison = useCallback(() => {
    dispatch({ type: "reset-comparison" })
    saveStore(state.data, null)
  }, [state.data])

  const reset = useCallback(() => {
    dispatch({ type: "reset-all" })
    if (typeof window !== "undefined")
      window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo<FecStoreValue>(
    () => ({
      data: state.data,
      hydrated: state.hydrated,
      importState: state.importState,
      importFile,
      importDemo,
      importDashboardData,
      reset,
      comparisonData: state.comparisonData,
      comparisonImportState: state.comparisonImportState,
      importComparisonFile,
      importComparisonDemo,
      resetComparison,
    }),
    [
      state.data,
      state.hydrated,
      state.importState,
      importFile,
      importDemo,
      importDashboardData,
      reset,
      state.comparisonData,
      state.comparisonImportState,
      importComparisonFile,
      importComparisonDemo,
      resetComparison,
    ]
  )

  return (
    <FecStoreContext.Provider value={value}>
      {children}
    </FecStoreContext.Provider>
  )
}

export function useFecStore(): FecStoreValue {
  const ctx = use(FecStoreContext)
  if (!ctx) {
    throw new Error("useFecStore must be used within a FecStoreProvider")
  }
  return ctx
}

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

import { buildDashboardData, type DashboardData } from "./analytics"
import { parseFecFile } from "./parser"
import {
  buildDemoFile,
  clearLegacyStorage,
  clearStore,
  loadStore,
  saveStore,
} from "./store-persistence"

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
    clearStore()
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

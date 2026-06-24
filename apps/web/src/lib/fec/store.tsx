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

import { buildDashboardDataOrNull, type DashboardData } from "./analytics"
import {
  createFecDataSource,
  type DataSource,
  sourceAvailableRange,
} from "./data-source"
import {
  coerceComparisonRange,
  isMonthRangeInside,
  normalizeMonthRange,
  type MonthRange,
} from "./date-ranges"
import { parseFecFile } from "./parser"
import {
  buildDemoFile,
  clearLegacyStorage,
  clearStore,
  loadStore,
  type PersistedFecStore,
  saveStore,
} from "./store-persistence"

type ImportState =
  | { status: "idle" }
  | { status: "parsing"; fileName: string }
  | { status: "ready" }
  | { status: "error"; message: string }

interface FecStoreValue {
  source: DataSource | null
  data: DashboardData | null
  comparisonData: DashboardData | null
  hydrated: boolean
  importState: ImportState
  availableRange: MonthRange | null
  selectedRange: MonthRange | null
  comparisonRange: MonthRange | null
  importFile: (file: File) => Promise<void>
  importDemo: () => Promise<void>
  setSelectedRange: (range: MonthRange) => void
  setComparisonRange: (range: MonthRange | null) => void
  resetComparison: () => void
  reset: () => void
}

const FecStoreContext = createContext<FecStoreValue | null>(null)

interface FecStoreState {
  source: DataSource | null
  selectedRange: MonthRange | null
  comparisonRange: MonthRange | null
  hydrated: boolean
  importState: ImportState
}

type FecStoreAction =
  | { type: "hydrate"; store: PersistedFecStore }
  | { type: "set-import-state"; importState: ImportState }
  | { type: "set-source"; source: DataSource }
  | { type: "set-selected-range"; range: MonthRange }
  | { type: "set-comparison-range"; range: MonthRange | null }
  | { type: "reset-comparison" }
  | { type: "reset-all" }

const IDLE_IMPORT_STATE: ImportState = { status: "idle" }
const READY_IMPORT_STATE: ImportState = { status: "ready" }
const INITIAL_FEC_STORE_STATE: FecStoreState = {
  source: null,
  selectedRange: null,
  comparisonRange: null,
  hydrated: false,
  importState: IDLE_IMPORT_STATE,
}

function fecStoreReducer(
  state: FecStoreState,
  action: FecStoreAction
): FecStoreState {
  switch (action.type) {
    case "hydrate":
      return hydrateState(action.store)
    case "set-import-state":
      return { ...state, importState: action.importState }
    case "set-source":
      return setSourceState(state, action.source)
    case "set-selected-range":
      return setSelectedRangeState(state, action.range)
    case "set-comparison-range":
      return setComparisonRangeState(state, action.range)
    case "reset-comparison":
      return { ...state, comparisonRange: null }
    case "reset-all":
      return { ...INITIAL_FEC_STORE_STATE, hydrated: state.hydrated }
  }
  return state
}

export function FecStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(fecStoreReducer, INITIAL_FEC_STORE_STATE)

  useEffect(() => {
    clearLegacyStorage()
    dispatch({ type: "hydrate", store: loadStore() })
  }, [])

  useEffect(() => {
    if (!state.hydrated) return

    if (!state.source) {
      clearStore()
      return
    }

    saveStore({
      source: state.source,
      selectedRange: state.selectedRange,
      comparisonRange: state.comparisonRange,
    })
  }, [state.comparisonRange, state.hydrated, state.selectedRange, state.source])

  const availableRange = useMemo(
    () => (state.source ? sourceAvailableRange(state.source) : null),
    [state.source]
  )

  const data = useMemo(
    () => buildRangeDashboardData(state.source, state.selectedRange),
    [state.source, state.selectedRange]
  )

  const comparisonData = useMemo(
    () => buildRangeDashboardData(state.source, state.comparisonRange),
    [state.comparisonRange, state.source]
  )

  const parseSourceFile = useCallback(
    async (file: File, fallbackError: string) => {
      dispatch({
        type: "set-import-state",
        importState: { status: "parsing", fileName: file.name },
      })
      try {
        const parsed = await parseFecFile(file)
        return createFecDataSource(parsed)
      } catch (error) {
        const message = error instanceof Error ? error.message : fallbackError
        dispatch({
          type: "set-import-state",
          importState: { status: "error", message },
        })
        throw error
      }
    },
    []
  )

  const importFile = useCallback(
    async (file: File) => {
      const source = await parseSourceFile(
        file,
        "Une erreur est survenue lors de l'analyse du fichier."
      )
      dispatch({ type: "set-source", source })
    },
    [parseSourceFile]
  )

  const importDemo = useCallback(async () => {
    const file = await buildDemoFile()
    const source = await parseSourceFile(
      file,
      "Erreur lors du chargement du jeu de demonstration."
    )
    dispatch({ type: "set-source", source })
  }, [parseSourceFile])

  const setSelectedRange = useCallback((range: MonthRange) => {
    dispatch({ type: "set-selected-range", range })
  }, [])

  const setComparisonRange = useCallback((range: MonthRange | null) => {
    dispatch({ type: "set-comparison-range", range })
  }, [])

  const resetComparison = useCallback(() => {
    dispatch({ type: "reset-comparison" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "reset-all" })
    clearStore()
  }, [])

  const value = useMemo<FecStoreValue>(
    () => ({
      source: state.source,
      data,
      comparisonData,
      hydrated: state.hydrated,
      importState: state.importState,
      availableRange,
      selectedRange: state.selectedRange,
      comparisonRange: state.comparisonRange,
      importFile,
      importDemo,
      setSelectedRange,
      setComparisonRange,
      resetComparison,
      reset,
    }),
    [
      state.source,
      data,
      comparisonData,
      state.hydrated,
      state.importState,
      availableRange,
      state.selectedRange,
      state.comparisonRange,
      importFile,
      importDemo,
      setSelectedRange,
      setComparisonRange,
      resetComparison,
      reset,
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

function hydrateState(store: PersistedFecStore): FecStoreState {
  if (!store.source) {
    return {
      ...INITIAL_FEC_STORE_STATE,
      hydrated: true,
    }
  }

  const availableRange = sourceAvailableRange(store.source)
  if (!availableRange) {
    return {
      ...INITIAL_FEC_STORE_STATE,
      hydrated: true,
    }
  }

  const selectedRange = resolveSelectedRange(
    store.selectedRange,
    availableRange
  )

  return {
    source: store.source,
    selectedRange,
    comparisonRange: coerceComparisonRange(
      store.comparisonRange,
      selectedRange,
      availableRange
    ),
    hydrated: true,
    importState: READY_IMPORT_STATE,
  }
}

function setSourceState(
  state: FecStoreState,
  source: DataSource
): FecStoreState {
  const availableRange = sourceAvailableRange(source)
  return {
    ...state,
    source,
    selectedRange: availableRange,
    comparisonRange: null,
    importState: READY_IMPORT_STATE,
  }
}

function setSelectedRangeState(
  state: FecStoreState,
  range: MonthRange
): FecStoreState {
  if (!state.source) return state

  const availableRange = sourceAvailableRange(state.source)
  if (!availableRange) return state

  const selectedRange = resolveSelectedRange(range, availableRange)
  return {
    ...state,
    selectedRange,
    comparisonRange: coerceComparisonRange(
      state.comparisonRange,
      selectedRange,
      availableRange
    ),
  }
}

function setComparisonRangeState(
  state: FecStoreState,
  range: MonthRange | null
): FecStoreState {
  if (!state.source || !state.selectedRange || !range) {
    return { ...state, comparisonRange: null }
  }

  const availableRange = sourceAvailableRange(state.source)
  if (!availableRange) return { ...state, comparisonRange: null }

  return {
    ...state,
    comparisonRange: coerceComparisonRange(
      range,
      state.selectedRange,
      availableRange
    ),
  }
}

function resolveSelectedRange(
  range: MonthRange | null,
  availableRange: MonthRange
): MonthRange {
  if (!range) return availableRange

  const normalized = normalizeMonthRange(range)
  return isMonthRangeInside(normalized, availableRange)
    ? normalized
    : availableRange
}

function buildRangeDashboardData(
  source: DataSource | null,
  range: MonthRange | null
): DashboardData | null {
  if (!source || !range) return null
  return buildDashboardDataOrNull(source.parseResult, { range })
}

import { monthRangeFromDates, type MonthRange } from "./date-ranges"
import type { FecParseResult } from "./types"

export interface FecDataSource {
  kind: "fec"
  parseResult: FecParseResult
}

export type DataSource = FecDataSource

export function createFecDataSource(
  parseResult: FecParseResult
): FecDataSource {
  return { kind: "fec", parseResult }
}

export function sourceAvailableRange(source: DataSource): MonthRange | null {
  return parseResultAvailableRange(source.parseResult)
}

function parseResultAvailableRange(
  parseResult: FecParseResult
): MonthRange | null {
  const { minDate, maxDate } = parseResult.meta
  if (minDate && maxDate) return monthRangeFromDates(minDate, maxDate)

  const dates = parseResult.entries.map((entry) => entry.ecritureDate)
  const firstDate = dates.toSorted((a, b) => a.getTime() - b.getTime()).at(0)
  const lastDate = dates.toSorted((a, b) => b.getTime() - a.getTime()).at(0)

  return firstDate && lastDate ? monthRangeFromDates(firstDate, lastDate) : null
}

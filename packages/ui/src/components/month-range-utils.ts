export interface MonthRangePickerValue {
  startMonth: string
  endMonth: string
}

const MONTHS_PER_YEAR = 12
const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

export function formatMonthRange(range: MonthRangePickerValue): string {
  const normalized = normalizeMonthRange(range)
  const start = parseMonthKey(normalized.startMonth)
  const end = parseMonthKey(normalized.endMonth)

  if (start.year === end.year && start.monthIndex === end.monthIndex) {
    return formatMonthYear(start)
  }

  if (start.year === end.year) {
    return `${formatMonthNumber(start)}-${formatMonthYear(end)}`
  }

  return `${formatMonthYear(start)} - ${formatMonthYear(end)}`
}

export function monthsForYear(year: number): string[] {
  return Array.from({ length: MONTHS_PER_YEAR }, (_, index) =>
    monthKeyFromParts(year, index)
  )
}

export function monthRangeWithLength(
  startMonth: string,
  monthsCovered: number
): MonthRangePickerValue {
  return {
    startMonth,
    endMonth: monthKeyFromOrdinal(monthOrdinal(startMonth) + monthsCovered - 1),
  }
}

export function monthCount(range: MonthRangePickerValue): number {
  const normalized = normalizeMonthRange(range)
  return (
    monthOrdinal(normalized.endMonth) - monthOrdinal(normalized.startMonth) + 1
  )
}

export function normalizeMonthRange(
  range: MonthRangePickerValue
): MonthRangePickerValue {
  return compareMonthKey(range.startMonth, range.endMonth) <= 0
    ? range
    : { startMonth: range.endMonth, endMonth: range.startMonth }
}

export function isSelectableMonth(
  month: string,
  minMonth: string,
  maxMonth: string
): boolean {
  return (
    compareMonthKey(month, minMonth) >= 0 &&
    compareMonthKey(month, maxMonth) <= 0
  )
}

export function monthSelectionState(
  month: string,
  range: MonthRangePickerValue
): "edge" | "middle" | "none" {
  const normalized = normalizeMonthRange(range)
  if (month === normalized.startMonth || month === normalized.endMonth) {
    return "edge"
  }

  return compareMonthKey(month, normalized.startMonth) > 0 &&
    compareMonthKey(month, normalized.endMonth) < 0
    ? "middle"
    : "none"
}

export function monthStartDate(month: string): Date {
  const { year, monthIndex } = parseMonthKey(month)
  return new Date(Date.UTC(year, monthIndex, 1))
}

export function yearFromMonth(month: string): number {
  return parseMonthKey(month).year
}

function compareMonthKey(left: string, right: string): number {
  return monthOrdinal(left) - monthOrdinal(right)
}

function formatMonthYear(month: { year: number; monthIndex: number }): string {
  return `${formatMonthNumber(month)}/${formatShortYear(month.year)}`
}

function formatMonthNumber(month: { monthIndex: number }): string {
  return String(month.monthIndex + 1).padStart(2, "0")
}

function formatShortYear(year: number): string {
  return String(year).slice(-2)
}

function monthOrdinal(month: string): number {
  const { year, monthIndex } = parseMonthKey(month)
  return year * MONTHS_PER_YEAR + monthIndex
}

function monthKeyFromOrdinal(ordinal: number): string {
  const year = Math.floor(ordinal / MONTHS_PER_YEAR)
  const monthIndex = ordinal - year * MONTHS_PER_YEAR
  return monthKeyFromParts(year, monthIndex)
}

function monthKeyFromParts(year: number, monthIndex: number): string {
  return `${String(year)}-${String(monthIndex + 1).padStart(2, "0")}`
}

function parseMonthKey(month: string): { year: number; monthIndex: number } {
  const match = MONTH_KEY_PATTERN.exec(month)
  if (!match) throw new Error(`Invalid month key: ${month}`)

  return {
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
  }
}

export interface MonthRange {
  startMonth: string
  endMonth: string
}

const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

export function isMonthKey(value: string): boolean {
  return MONTH_KEY_PATTERN.test(value)
}

export function monthKeyFromDate(date: Date): string {
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

export function monthRangeFromDates(
  startDate: Date,
  endDate: Date
): MonthRange {
  return normalizeMonthRange({
    startMonth: monthKeyFromDate(startDate),
    endMonth: monthKeyFromDate(endDate),
  })
}

export function normalizeMonthRange(range: MonthRange): MonthRange {
  return compareMonthKey(range.startMonth, range.endMonth) <= 0
    ? range
    : { startMonth: range.endMonth, endMonth: range.startMonth }
}

export function monthStartDate(month: string): Date {
  const { year, monthIndex } = parseMonthKey(month)
  return new Date(Date.UTC(year, monthIndex, 1))
}

export function monthEndDate(month: string): Date {
  const { year, monthIndex } = parseMonthKey(month)
  return new Date(Date.UTC(year, monthIndex + 1, 1) - 1)
}

export function monthRangeDates(range: MonthRange): {
  startDate: Date
  endDate: Date
} {
  const normalized = normalizeMonthRange(range)
  return {
    startDate: monthStartDate(normalized.startMonth),
    endDate: monthEndDate(normalized.endMonth),
  }
}

function compareMonthKey(left: string, right: string): number {
  return monthOrdinal(left) - monthOrdinal(right)
}

export function monthCount(range: MonthRange): number {
  const normalized = normalizeMonthRange(range)
  return (
    monthOrdinal(normalized.endMonth) - monthOrdinal(normalized.startMonth) + 1
  )
}

function addMonthsToMonthKey(month: string, delta: number): string {
  return monthKeyFromOrdinal(monthOrdinal(month) + delta)
}

function monthRangeWithLength(
  startMonth: string,
  monthsCovered: number
): MonthRange {
  if (monthsCovered < 1) {
    throw new Error("Month ranges must contain at least one month.")
  }

  return {
    startMonth,
    endMonth: addMonthsToMonthKey(startMonth, monthsCovered - 1),
  }
}

export function monthKeysInRange(range: MonthRange): string[] {
  const normalized = normalizeMonthRange(range)
  const start = monthOrdinal(normalized.startMonth)
  const end = monthOrdinal(normalized.endMonth)
  const keys: string[] = []
  for (let ordinal = start; ordinal <= end; ordinal += 1) {
    keys.push(monthKeyFromOrdinal(ordinal))
  }
  return keys
}

export function isMonthRangeInside(
  range: MonthRange,
  bounds: MonthRange
): boolean {
  const normalized = normalizeMonthRange(range)
  const normalizedBounds = normalizeMonthRange(bounds)
  return (
    compareMonthKey(normalized.startMonth, normalizedBounds.startMonth) >= 0 &&
    compareMonthKey(normalized.endMonth, normalizedBounds.endMonth) <= 0
  )
}

export function monthRangesEqual(left: MonthRange, right: MonthRange): boolean {
  const normalizedLeft = normalizeMonthRange(left)
  const normalizedRight = normalizeMonthRange(right)
  return (
    normalizedLeft.startMonth === normalizedRight.startMonth &&
    normalizedLeft.endMonth === normalizedRight.endMonth
  )
}

export function coerceComparisonRange(
  comparisonRange: MonthRange | null,
  selectedRange: MonthRange,
  availableRange: MonthRange
): MonthRange | null {
  if (!comparisonRange) return null

  const range = monthRangeWithLength(
    normalizeMonthRange(comparisonRange).startMonth,
    monthCount(selectedRange)
  )

  if (!isMonthRangeInside(range, availableRange)) return null
  return monthRangesEqual(range, selectedRange) ? null : range
}

export function comparisonStartBounds(
  selectedRange: MonthRange,
  availableRange: MonthRange
): MonthRange | null {
  const monthsCovered = monthCount(selectedRange)
  const latestStartMonth = addMonthsToMonthKey(
    normalizeMonthRange(availableRange).endMonth,
    1 - monthsCovered
  )

  if (
    compareMonthKey(
      latestStartMonth,
      normalizeMonthRange(availableRange).startMonth
    ) < 0
  ) {
    return null
  }

  return {
    startMonth: normalizeMonthRange(availableRange).startMonth,
    endMonth: latestStartMonth,
  }
}

export function suggestComparisonRange(
  selectedRange: MonthRange,
  availableRange: MonthRange
): MonthRange | null {
  const selected = normalizeMonthRange(selectedRange)
  const monthsCovered = monthCount(selected)

  const previous = monthRangeWithLength(
    addMonthsToMonthKey(selected.startMonth, -monthsCovered),
    monthsCovered
  )
  if (isUsableComparisonRange(previous, selected, availableRange)) {
    return previous
  }

  const next = monthRangeWithLength(
    addMonthsToMonthKey(selected.endMonth, 1),
    monthsCovered
  )
  if (isUsableComparisonRange(next, selected, availableRange)) return next

  const startBounds = comparisonStartBounds(selected, availableRange)
  if (!startBounds) return null

  for (const startMonth of monthKeysInRange(startBounds)) {
    const candidate = monthRangeWithLength(startMonth, monthsCovered)
    if (isUsableComparisonRange(candidate, selected, availableRange)) {
      return candidate
    }
  }

  return null
}

function isUsableComparisonRange(
  range: MonthRange,
  selectedRange: MonthRange,
  availableRange: MonthRange
): boolean {
  return (
    isMonthRangeInside(range, availableRange) &&
    !monthRangesEqual(range, selectedRange)
  )
}

function monthOrdinal(month: string): number {
  const { year, monthIndex } = parseMonthKey(month)
  return year * 12 + monthIndex
}

function monthKeyFromOrdinal(ordinal: number): string {
  const year = Math.floor(ordinal / 12)
  const monthIndex = ordinal - year * 12
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

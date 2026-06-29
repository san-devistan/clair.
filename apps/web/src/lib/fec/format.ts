// Helpers de formatage pour l'UI dashboard.

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const euroExactFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
})

const accurateNumberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
})

const compactIntegerFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
})

const compactMillionFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatDatePart(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatEuro(value: number): string {
  return euroFormatter.format(value)
}

export function formatEuroExact(value: number): string {
  return euroExactFormatter.format(value)
}

export function formatCompactNumber(
  value: number,
  options: { suffix?: string } = {}
): string {
  const finiteValue = Number.isFinite(value) ? value : 0
  const absoluteValue = Math.abs(finiteValue)
  const suffix = options.suffix ?? ""

  if (absoluteValue >= 1_000_000) {
    return `${compactMillionFormatter.format(finiteValue / 1_000_000)}M${suffix}`
  }

  if (absoluteValue >= 1_000) {
    const sign = finiteValue < 0 ? -1 : 1
    const roundedThousands = sign * Math.round(absoluteValue / 1_000)
    return `${compactIntegerFormatter.format(roundedThousands)}K${suffix}`
  }

  return `${compactIntegerFormatter.format(Math.round(finiteValue))}${suffix}`
}

export function formatEuroCompact(value: number): string {
  return formatCompactNumber(value, { suffix: "€" })
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatAccurateNumber(value: number): string {
  return accurateNumberFormatter.format(value)
}

export function formatShortDate(value: Date): string {
  if (Number.isNaN(value.getTime())) throw new RangeError("Invalid date")

  const day = formatDatePart(value.getUTCDate())
  const month = formatDatePart(value.getUTCMonth() + 1)
  const year = String(value.getUTCFullYear())
  return `${day}/${month}/${year}`
}

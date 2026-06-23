import { DAY_MS } from "./demo-constants"
import type { Customer, RevenueLine, Supplier } from "./demo-types"

export function dateStr(date: Date): string {
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

export function fr(value: number): string {
  return roundMoney(value).toFixed(2).replace(".", ",")
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function pseudoRandom(seed: number): () => number {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

export function monthDay(monthDate: Date, day: number): Date {
  const end = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)
  )
  return new Date(
    Date.UTC(
      monthDate.getUTCFullYear(),
      monthDate.getUTCMonth(),
      Math.min(day, end.getUTCDate())
    )
  )
}

export function splitByShares(
  total: number,
  shares: readonly number[]
): number[] {
  const amounts: number[] = []
  let allocated = 0
  for (let index = 0; index < shares.length; index++) {
    if (index === shares.length - 1) {
      amounts.push(roundMoney(total - allocated))
      break
    }
    const amount = roundMoney(total * shares[index])
    amounts.push(amount)
    allocated += amount
  }
  return amounts
}

export function monthKey(date: Date): string {
  return `${String(date.getUTCFullYear()).slice(2)}${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`
}

export function computeMonthlyRevenueTarget(
  monthIndex: number,
  monthDate: Date
) {
  const base = 88_000
  const growth = Math.pow(1.045, monthIndex)
  const month = monthDate.getUTCMonth()
  const summer = month === 6 ? 0.9 : month === 7 ? 0.84 : 1
  const december = month === 11 ? 1.12 : 1
  const launch = launchMultiplier(monthIndex)
  return roundMoney(base * growth * summer * december * launch)
}

export function revenueLinesForCustomer(customer: Customer): RevenueLine[] {
  const hardwareShare = clamp(0.2 + customer.hardwareBias, 0.12, 0.32)
  const projectShare = clamp(customer.projectBias, 0.12, 0.3)
  const transportShare = hardwareShare > 0.22 ? 0.035 : 0.02
  const supportShare = 0.055
  const subscriptionShare =
    1 - hardwareShare - projectShare - transportShare - supportShare

  return [
    {
      account: {
        compteNum: "706100",
        compteLib: "Abonnements plateforme ClairView",
      },
      share: subscriptionShare,
    },
    {
      account: {
        compteNum: "704000",
        compteLib: "Etudes et installations",
      },
      share: projectShare,
    },
    {
      account: {
        compteNum: "707100",
        compteLib: "Vente kits capteurs lumineux",
      },
      share: hardwareShare,
    },
    {
      account: {
        compteNum: "708500",
        compteLib: "Ports et frais accessoires factures",
      },
      share: transportShare,
    },
    {
      account: {
        compteNum: "708800",
        compteLib: "Support premium et formations",
      },
      share: supportShare,
    },
  ]
}

export function supplierAmount(
  supplier: Supplier,
  monthlyTarget: number,
  monthIndex: number,
  random: () => number
): number {
  if (
    supplier.activeMonths &&
    !supplier.activeMonths.includes(monthIndex % 12)
  ) {
    return 0
  }

  if (supplier.amount.kind === "revenue-share") {
    const noise = 0.92 + random() * 0.18
    return roundMoney(monthlyTarget * supplier.amount.share * noise)
  }

  const noise = 0.92 + random() * 0.16
  const base =
    supplier.amount.min + (supplier.amount.max - supplier.amount.min) * random()
  const growth = 1 + (supplier.amount.growth ?? 0) * monthIndex
  return roundMoney(base * noise * growth)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function launchMultiplier(monthIndex: number): number {
  if (monthIndex >= 11) return 1.22
  if (monthIndex === 10) return 1.18
  if (monthIndex === 9) return 1.12
  return 1
}

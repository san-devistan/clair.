import { OPENING_VAT_PAYABLE } from "./demo-constants"
import { addMonthlyEntries } from "./demo-month"
import {
  addOpenAgedInvoices,
  addOpeningEntries,
  addOpeningPayments,
} from "./demo-period-postings"
import type { DemoEntry } from "./demo-types"
import { computeMonthlyRevenueTarget, pseudoRandom } from "./demo-utils"

export function generateDemoEntries(): DemoEntry[] {
  const random = pseudoRandom(84)
  const entries: DemoEntry[] = []
  const nextNum = createEntryNumberGenerator()
  const { startMonth, endMonth } = demoPeriod()

  addOpeningEntries(entries, nextNum(), startMonth)
  addOpeningPayments(entries, nextNum, startMonth)

  let vatDueFromPreviousMonth = OPENING_VAT_PAYABLE
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthDate = new Date(
      Date.UTC(
        startMonth.getUTCFullYear(),
        startMonth.getUTCMonth() + monthIndex,
        1
      )
    )
    vatDueFromPreviousMonth = addMonthlyEntries({
      entries,
      nextNum,
      random,
      monthDate,
      monthIndex,
      endMonth,
      monthlyTarget: computeMonthlyRevenueTarget(monthIndex, monthDate),
      vatDueFromPreviousMonth,
    })
  }

  addOpenAgedInvoices(entries, nextNum, endMonth)

  return entries
}

function createEntryNumberGenerator() {
  let entryCounter = 1
  return () => String(entryCounter++).padStart(6, "0")
}

function demoPeriod() {
  const now = new Date()
  const endMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)
  )
  const startMonth = new Date(
    Date.UTC(endMonth.getUTCFullYear() - 1, endMonth.getUTCMonth() + 1, 1)
  )

  return { startMonth, endMonth }
}

import {
  SALARY_PAYABLE,
  SOCIAL_RETIREMENT,
  SOCIAL_URSSAF,
} from "./demo-accounts"
import { addLiabilityPayment, addLines, entryLine } from "./demo-ledger"
import type { DemoEntry, PayrollInput } from "./demo-types"
import { addDays, monthDay, monthKey, roundMoney } from "./demo-utils"

export function addPayroll({
  entries,
  nextNum,
  monthDate,
  monthIndex,
  endMonth,
}: PayrollInput) {
  const payrollDate = monthDay(monthDate, 31)
  const gross = roundMoney(21_200 * (1 + 0.012 * monthIndex))
  const bonus = monthDate.getUTCMonth() === 11 ? 4_800 : 0
  const grossWithBonus = gross + bonus
  const urssaf = roundMoney(grossWithBonus * 0.34)
  const retirement = roundMoney(grossWithBonus * 0.075)
  const benefits = roundMoney(1_150 * (1 + 0.008 * monthIndex))
  const netSalary = roundMoney(grossWithBonus * 0.78)
  const urssafPayable = roundMoney(grossWithBonus * 0.22 + urssaf)
  const retirementPayable = roundMoney(retirement + benefits)
  const ref = `PAIE-${monthKey(monthDate)}`

  addPayrollAccrual(entries, nextNum(), payrollDate, ref, {
    grossWithBonus,
    urssaf,
    retirement,
    benefits,
    netSalary,
    urssafPayable,
    retirementPayable,
  })
  payPayrollLiabilities({
    entries,
    nextNum,
    payrollDate,
    monthDate,
    endMonth,
    ref,
    netSalary,
    urssafPayable,
    retirementPayable,
  })
}

function addPayrollAccrual(
  entries: DemoEntry[],
  ecritureNum: string,
  payrollDate: Date,
  ref: string,
  amounts: {
    grossWithBonus: number
    urssaf: number
    retirement: number
    benefits: number
    netSalary: number
    urssafPayable: number
    retirementPayable: number
  }
) {
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum,
      ecritureDate: payrollDate,
      pieceRef: ref,
      pieceDate: payrollDate,
      ecritureLib: "Paie et charges sociales",
    },
    [
      entryLine(
        { compteNum: "641100", compteLib: "Salaires bruts" },
        amounts.grossWithBonus,
        0
      ),
      entryLine(
        { compteNum: "645100", compteLib: "Cotisations URSSAF" },
        amounts.urssaf,
        0
      ),
      entryLine(
        { compteNum: "645300", compteLib: "Retraite et prevoyance" },
        amounts.retirement,
        0
      ),
      entryLine(
        { compteNum: "647000", compteLib: "Mutuelle et avantages" },
        amounts.benefits,
        0
      ),
      entryLine(SALARY_PAYABLE, 0, amounts.netSalary),
      entryLine(SOCIAL_URSSAF, 0, amounts.urssafPayable),
      entryLine(SOCIAL_RETIREMENT, 0, amounts.retirementPayable),
    ]
  )
}

function payPayrollLiabilities(input: {
  entries: DemoEntry[]
  nextNum: () => string
  payrollDate: Date
  monthDate: Date
  endMonth: Date
  ref: string
  netSalary: number
  urssafPayable: number
  retirementPayable: number
}) {
  const salaryPaymentDate = addDays(input.payrollDate, 4)
  if (salaryPaymentDate <= input.endMonth) {
    addLiabilityPayment({
      entries: input.entries,
      ecritureNum: input.nextNum(),
      paymentDate: salaryPaymentDate,
      account: SALARY_PAYABLE,
      amount: input.netSalary,
      ref: input.ref,
      label: "Virement salaires",
    })
  }

  const socialPaymentDate = new Date(
    Date.UTC(
      input.monthDate.getUTCFullYear(),
      input.monthDate.getUTCMonth() + 1,
      15
    )
  )
  if (socialPaymentDate <= input.endMonth) {
    paySocialLiabilities(input, socialPaymentDate)
  }
}

function paySocialLiabilities(
  input: Parameters<typeof payPayrollLiabilities>[0],
  paymentDate: Date
) {
  addLiabilityPayment({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    paymentDate,
    account: SOCIAL_URSSAF,
    amount: input.urssafPayable,
    ref: `${input.ref}-URSSAF`,
    label: "Reglement URSSAF",
  })
  addLiabilityPayment({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    paymentDate,
    account: SOCIAL_RETIREMENT,
    amount: input.retirementPayable,
    ref: `${input.ref}-RET`,
    label: "Reglement retraite et prevoyance",
  })
}

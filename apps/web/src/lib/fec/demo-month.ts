import { DEFAULT_VAT_RATE } from "./demo-constants"
import { CUSTOMERS } from "./demo-customers"
import {
  addCustomerInvoice,
  addCustomerPayment,
  addSupplierInvoice,
  addSupplierPayment,
  addVatPayment,
} from "./demo-ledger"
import { addPayroll } from "./demo-payroll"
import {
  addDepreciation,
  addEquipmentPurchase,
  addIncomeTaxProvision,
  addLoanPayment,
  addTaxAccrual,
} from "./demo-period-postings"
import { SUPPLIERS } from "./demo-suppliers"
import type { Customer, DemoEntry, Supplier } from "./demo-types"
import {
  addDays,
  monthDay,
  monthKey,
  roundMoney,
  supplierAmount,
} from "./demo-utils"

interface MonthInput {
  entries: DemoEntry[]
  nextNum: () => string
  random: () => number
  monthDate: Date
  monthIndex: number
  endMonth: Date
  monthlyTarget: number
  vatDueFromPreviousMonth: number
}

export function addMonthlyEntries(input: MonthInput): number {
  payPreviousVat(input)
  const collectedVat = addCustomerEntries(input)
  const deductibleVat = addSupplierEntries(input)
  addOperationalEntries(input)

  return roundMoney(Math.max(0, collectedVat - deductibleVat))
}

function payPreviousVat({
  entries,
  nextNum,
  monthDate,
  endMonth,
  vatDueFromPreviousMonth,
}: MonthInput) {
  if (vatDueFromPreviousMonth <= 0) return

  const vatPaymentDate = monthDay(monthDate, 20)
  if (vatPaymentDate > endMonth) return

  addVatPayment({
    entries,
    ecritureNum: nextNum(),
    paymentDate: vatPaymentDate,
    amount: vatDueFromPreviousMonth,
    ref: `TVA-${monthKey(monthDate)}`,
  })
}

function addCustomerEntries(input: MonthInput): number {
  let collectedVat = 0
  for (const customer of CUSTOMERS) {
    collectedVat += addCustomerMonthInvoice(input, customer)
  }
  return collectedVat
}

function addCustomerMonthInvoice(
  input: MonthInput,
  customer: Customer
): number {
  const invoiceDay = 5 + Math.floor(input.random() * 17)
  const invoiceDate = monthDay(input.monthDate, invoiceDay)
  const noise = 0.88 + input.random() * 0.24
  const amountHt = roundMoney(input.monthlyTarget * customer.weight * noise)
  const ref = `FAC-${monthKey(input.monthDate)}-${customer.compAuxNum?.slice(3)}`
  const amountTtc = addCustomerInvoice({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    invoiceDate,
    customer,
    amountHt,
    ref,
  })
  addCustomerMonthPayment(input, customer, invoiceDate, amountTtc, ref)
  return roundMoney(amountHt * DEFAULT_VAT_RATE)
}

function addCustomerMonthPayment(
  input: MonthInput,
  customer: Customer,
  invoiceDate: Date,
  amountTtc: number,
  ref: string
) {
  const paymentDelay =
    customer.paymentDays +
    Math.floor(input.random() * 10) -
    (input.random() > 0.65 ? 4 : 0)
  const paymentDate = addDays(invoiceDate, Math.max(18, paymentDelay))
  if (paymentDate > input.endMonth) return

  addCustomerPayment({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    paymentDate,
    account: customer,
    amount: amountTtc,
    ref,
    label: `Reglement ${customer.compteLib}`,
  })
}

function addSupplierEntries(input: MonthInput): number {
  let deductibleVat = 0
  for (const supplier of SUPPLIERS) {
    deductibleVat += addSupplierMonthInvoice(input, supplier)
  }
  return deductibleVat
}

function addSupplierMonthInvoice(
  input: MonthInput,
  supplier: Supplier
): number {
  const amountHt = supplierAmount(
    supplier,
    input.monthlyTarget,
    input.monthIndex,
    input.random
  )
  if (amountHt <= 0) return 0

  const invoiceDate = monthDay(
    input.monthDate,
    8 + Math.floor(input.random() * 16)
  )
  const ref = `${supplier.compAuxNum}-${monthKey(input.monthDate)}`
  const amountTtc = addSupplierInvoice({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    invoiceDate,
    supplier,
    amountHt,
    ref,
  })
  addSupplierMonthPayment(input, supplier, invoiceDate, amountTtc, ref)
  return roundMoney(amountHt * supplier.vatRate)
}

function addSupplierMonthPayment(
  input: MonthInput,
  supplier: Supplier,
  invoiceDate: Date,
  amountTtc: number,
  ref: string
) {
  const paymentDelay = supplier.paymentDays + Math.floor(input.random() * 6)
  const paymentDate = addDays(invoiceDate, paymentDelay)
  if (paymentDate > input.endMonth) return

  addSupplierPayment({
    entries: input.entries,
    ecritureNum: input.nextNum(),
    paymentDate,
    account: supplier,
    amount: amountTtc,
    ref,
    label: `Reglement ${supplier.compteLib}`,
  })
}

function addOperationalEntries(input: MonthInput) {
  if (input.monthIndex === 4) {
    addEquipmentPurchase(
      input.entries,
      input.nextNum,
      input.monthDate,
      input.endMonth
    )
  }

  addPayroll({
    entries: input.entries,
    nextNum: input.nextNum,
    monthDate: input.monthDate,
    monthIndex: input.monthIndex,
    endMonth: input.endMonth,
  })
  addTaxAccrual({
    entries: input.entries,
    nextNum: input.nextNum,
    monthDate: input.monthDate,
    monthlyTarget: input.monthlyTarget,
    endMonth: input.endMonth,
  })
  addLoanPayment(
    input.entries,
    input.nextNum(),
    input.monthDate,
    input.monthIndex
  )
  addDepreciation(input.entries, input.nextNum(), input.monthDate)

  if (input.monthIndex === 11) {
    addIncomeTaxProvision(input.entries, input.nextNum, input.monthDate)
  }
}

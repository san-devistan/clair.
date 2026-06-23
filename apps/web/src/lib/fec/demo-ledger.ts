import { BANK_OPERATING, VAT_COLLECTED, VAT_DEDUCTIBLE } from "./demo-accounts"
import { DEFAULT_VAT_RATE } from "./demo-constants"
import type {
  AccountRef,
  CustomerInvoiceInput,
  DemoEntry,
  EntryBase,
  EntryLine,
  PaymentInput,
  SupplierInvoiceInput,
  VatPaymentInput,
} from "./demo-types"
import {
  revenueLinesForCustomer,
  roundMoney,
  splitByShares,
} from "./demo-utils"

export function addLines(
  entries: DemoEntry[],
  base: EntryBase,
  lines: readonly EntryLine[]
) {
  for (const item of lines) {
    entries.push({
      ...base,
      compteNum: item.compteNum,
      compteLib: item.compteLib,
      compAuxNum: item.compAuxNum ?? "",
      compAuxLib: item.compAuxLib ?? "",
      debit: roundMoney(item.debit),
      credit: roundMoney(item.credit),
    })
  }
}

export function entryLine(
  account: AccountRef,
  debit: number,
  credit: number
): EntryLine {
  return {
    ...account,
    debit,
    credit,
  }
}

export function addCustomerInvoice({
  entries,
  ecritureNum,
  invoiceDate,
  customer,
  amountHt,
  ref,
}: CustomerInvoiceInput): number {
  const revenueLines = revenueLinesForCustomer(customer)
  const amounts = splitByShares(
    amountHt,
    revenueLines.map((item) => item.share)
  )
  const tva = roundMoney(amountHt * DEFAULT_VAT_RATE)
  const amountTtc = roundMoney(amountHt + tva)

  addLines(
    entries,
    {
      journalCode: "VE",
      journalLib: "Ventes",
      ecritureNum,
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: `Facture ${customer.compteLib}`,
    },
    [
      entryLine(customer, amountTtc, 0),
      ...revenueLines.map((item, index) =>
        entryLine(item.account, 0, amounts[index])
      ),
      entryLine(VAT_COLLECTED, 0, tva),
    ]
  )

  return amountTtc
}

export function addCustomerPayment(input: PaymentInput) {
  addBankPayment(input, [
    entryLine(BANK_OPERATING, input.amount, 0),
    entryLine(input.account, 0, input.amount),
  ])
}

export function addSupplierInvoice({
  entries,
  ecritureNum,
  invoiceDate,
  supplier,
  amountHt,
  ref,
}: SupplierInvoiceInput): number {
  const tva = roundMoney(amountHt * supplier.vatRate)
  const amountTtc = roundMoney(amountHt + tva)
  const vatLine = tva > 0 ? [entryLine(VAT_DEDUCTIBLE, tva, 0)] : []

  addLines(
    entries,
    {
      journalCode: "AC",
      journalLib: "Achats",
      ecritureNum,
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: supplier.account.compteLib,
    },
    [
      entryLine(supplier.account, amountHt, 0),
      ...vatLine,
      entryLine(supplier, 0, amountTtc),
    ]
  )

  return amountTtc
}

export function addSupplierPayment(input: PaymentInput) {
  addBankPayment(input, [
    entryLine(input.account, input.amount, 0),
    entryLine(BANK_OPERATING, 0, input.amount),
  ])
}

export function addLiabilityPayment(input: PaymentInput) {
  addSupplierPayment(input)
}

export function addVatPayment({
  entries,
  ecritureNum,
  paymentDate,
  amount,
  ref,
}: VatPaymentInput) {
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: paymentDate,
      pieceRef: ref,
      pieceDate: paymentDate,
      ecritureLib: "Reglement TVA",
    },
    [entryLine(VAT_COLLECTED, amount, 0), entryLine(BANK_OPERATING, 0, amount)]
  )
}

function addBankPayment(input: PaymentInput, lines: readonly EntryLine[]) {
  addLines(
    input.entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum: input.ecritureNum,
      ecritureDate: input.paymentDate,
      pieceRef: input.ref,
      pieceDate: input.paymentDate,
      ecritureLib: input.label,
    },
    lines
  )
}

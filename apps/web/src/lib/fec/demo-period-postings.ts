import {
  BANK_OPERATING,
  BANK_RESERVE,
  CASH_REGISTER,
  EQUIPMENT_SUPPLIER,
  INCOME_TAX_PAYABLE,
  LOAN_ACCOUNT,
  SOCIAL_URSSAF,
  TAX_PAYABLE,
  VAT_COLLECTED,
  VAT_DEDUCTIBLE,
} from "./demo-accounts"
import { DEFAULT_VAT_RATE, OPENING_VAT_PAYABLE } from "./demo-constants"
import { AGED_RECEIVABLES, OPENING_RECEIVABLES } from "./demo-customers"
import {
  addCustomerInvoice,
  addCustomerPayment,
  addLiabilityPayment,
  addLines,
  addSupplierInvoice,
  addSupplierPayment,
  entryLine,
} from "./demo-ledger"
import { AGED_PAYABLES, OPENING_PAYABLES } from "./demo-suppliers"
import type { DemoEntry, TaxAccrualInput } from "./demo-types"
import { addDays, monthDay, monthKey, roundMoney } from "./demo-utils"

export function addOpeningEntries(
  entries: DemoEntry[],
  ecritureNum: string,
  startMonth: Date
) {
  addLines(
    entries,
    {
      journalCode: "AN",
      journalLib: "A-Nouveaux",
      ecritureNum,
      ecritureDate: startMonth,
      pieceRef: "AN-OUV",
      pieceDate: startMonth,
      ecritureLib: "Reprise des soldes d'ouverture",
    },
    [
      entryLine(BANK_OPERATING, 96_000, 0),
      entryLine(BANK_RESERVE, 42_000, 0),
      entryLine(CASH_REGISTER, 1_200, 0),
      entryLine(
        {
          compteNum: "218300",
          compteLib: "Materiel showroom et bancs de test",
        },
        86_000,
        0
      ),
      entryLine(
        {
          compteNum: "281830",
          compteLib: "Amortissements materiel industriel",
        },
        0,
        18_500
      ),
      entryLine(
        { compteNum: "371000", compteLib: "Stock kits connectes" },
        48_000,
        0
      ),
      ...OPENING_RECEIVABLES.map(({ customer, amount }) =>
        entryLine(customer, amount, 0)
      ),
      entryLine(
        { compteNum: "486000", compteLib: "Charges constatees d'avance" },
        7_800,
        0
      ),
      ...OPENING_PAYABLES.map(({ supplier, amount }) =>
        entryLine(supplier, 0, amount)
      ),
      entryLine(VAT_COLLECTED, 0, OPENING_VAT_PAYABLE),
      entryLine(SOCIAL_URSSAF, 0, 9_500),
      entryLine(LOAN_ACCOUNT, 0, 58_000),
      entryLine(
        { compteNum: "101000", compteLib: "Capital social" },
        0,
        80_000
      ),
      entryLine(
        { compteNum: "106100", compteLib: "Reserve legale" },
        0,
        72_000
      ),
      entryLine(
        { compteNum: "110000", compteLib: "Report a nouveau crediteur" },
        0,
        53_100
      ),
    ]
  )
}

export function addOpeningPayments(
  entries: DemoEntry[],
  nextNum: () => string,
  startMonth: Date
) {
  for (const [
    index,
    { customer, amount, ref },
  ] of OPENING_RECEIVABLES.entries()) {
    addCustomerPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: addDays(startMonth, 14 + index * 9),
      account: customer,
      amount,
      ref,
      label: `Encaissement solde d'ouverture ${customer.compteLib}`,
    })
  }

  for (const [index, { supplier, amount, ref }] of OPENING_PAYABLES.entries()) {
    addSupplierPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate: addDays(startMonth, 6 + index * 5),
      account: supplier,
      amount,
      ref,
      label: `Reglement solde d'ouverture ${supplier.compteLib}`,
    })
  }

  addLiabilityPayment({
    entries,
    ecritureNum: nextNum(),
    paymentDate: addDays(startMonth, 13),
    account: SOCIAL_URSSAF,
    amount: 9_500,
    ref: "AN-SOC",
    label: "Reglement charges sociales d'ouverture",
  })
}

export function addTaxAccrual({
  entries,
  nextNum,
  monthDate,
  monthlyTarget,
  endMonth,
}: TaxAccrualInput) {
  if ((monthDate.getUTCMonth() + 1) % 3 !== 0) return

  const taxDate = monthDay(monthDate, 28)
  const amount = roundMoney(monthlyTarget * 0.008)
  const ref = `TAX-${monthKey(monthDate)}`
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum: nextNum(),
      ecritureDate: taxDate,
      pieceRef: ref,
      pieceDate: taxDate,
      ecritureLib: "Provision taxes locales et formation",
    },
    [
      entryLine(
        { compteNum: "633300", compteLib: "Formation professionnelle" },
        amount,
        0
      ),
      entryLine(TAX_PAYABLE, 0, amount),
    ]
  )

  const paymentDate = addDays(taxDate, 24)
  if (paymentDate <= endMonth) {
    addLiabilityPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate,
      account: TAX_PAYABLE,
      amount,
      ref,
      label: "Reglement taxes locales et formation",
    })
  }
}

export function addIncomeTaxProvision(
  entries: DemoEntry[],
  nextNum: () => string,
  monthDate: Date
) {
  const provisionDate = monthDay(monthDate, 30)
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum: nextNum(),
      ecritureDate: provisionDate,
      pieceRef: `IS-${monthKey(monthDate)}`,
      pieceDate: provisionDate,
      ecritureLib: "Provision impot sur les societes",
    },
    [
      entryLine(
        { compteNum: "695100", compteLib: "Impots sur les benefices" },
        31_000,
        0
      ),
      entryLine(INCOME_TAX_PAYABLE, 0, 31_000),
    ]
  )
}

export function addDepreciation(
  entries: DemoEntry[],
  ecritureNum: string,
  monthDate: Date
) {
  const date = monthDay(monthDate, 31)
  addLines(
    entries,
    {
      journalCode: "OD",
      journalLib: "Operations diverses",
      ecritureNum,
      ecritureDate: date,
      pieceRef: `AMORT-${monthKey(monthDate)}`,
      pieceDate: date,
      ecritureLib: "Dotation aux amortissements",
    },
    [
      entryLine(
        {
          compteNum: "681120",
          compteLib: "Dotations amortissements immobilisations",
        },
        1_850,
        0
      ),
      entryLine(
        {
          compteNum: "281830",
          compteLib: "Amortissements materiel industriel",
        },
        0,
        1_850
      ),
    ]
  )
}

export function addLoanPayment(
  entries: DemoEntry[],
  ecritureNum: string,
  monthDate: Date,
  monthIndex: number
) {
  const date = monthDay(monthDate, 18)
  const principal = 1_450
  const interest = roundMoney(Math.max(210, 430 - monthIndex * 14))
  addLines(
    entries,
    {
      journalCode: "BQ",
      journalLib: "Banque",
      ecritureNum,
      ecritureDate: date,
      pieceRef: `PRET-${monthKey(monthDate)}`,
      pieceDate: date,
      ecritureLib: "Echeance emprunt bancaire",
    },
    [
      entryLine(LOAN_ACCOUNT, principal, 0),
      entryLine(
        { compteNum: "661100", compteLib: "Interets des emprunts" },
        interest,
        0
      ),
      entryLine(BANK_OPERATING, 0, principal + interest),
    ]
  )
}

export function addEquipmentPurchase(
  entries: DemoEntry[],
  nextNum: () => string,
  monthDate: Date,
  endMonth: Date
) {
  const invoiceDate = monthDay(monthDate, 12)
  const amountHt = 18_600
  const vat = roundMoney(amountHt * DEFAULT_VAT_RATE)
  const amountTtc = roundMoney(amountHt + vat)
  const ref = `IMMO-${monthKey(monthDate)}`

  addLines(
    entries,
    {
      journalCode: "AC",
      journalLib: "Achats",
      ecritureNum: nextNum(),
      ecritureDate: invoiceDate,
      pieceRef: ref,
      pieceDate: invoiceDate,
      ecritureLib: "Banc de test showroom",
    },
    [
      entryLine(
        {
          compteNum: "218300",
          compteLib: "Materiel showroom et bancs de test",
        },
        amountHt,
        0
      ),
      entryLine(VAT_DEDUCTIBLE, vat, 0),
      entryLine(EQUIPMENT_SUPPLIER, 0, amountTtc),
    ]
  )

  const paymentDate = addDays(invoiceDate, 45)
  if (paymentDate <= endMonth) {
    addSupplierPayment({
      entries,
      ecritureNum: nextNum(),
      paymentDate,
      account: EQUIPMENT_SUPPLIER,
      amount: amountTtc,
      ref,
      label: "Reglement investissement showroom",
    })
  }
}

export function addOpenAgedInvoices(
  entries: DemoEntry[],
  nextNum: () => string,
  endMonth: Date
) {
  for (const { customer, invoiceDaysOpen, amountHt, ref } of AGED_RECEIVABLES) {
    addCustomerInvoice({
      entries,
      ecritureNum: nextNum(),
      invoiceDate: addDays(endMonth, -invoiceDaysOpen),
      customer,
      amountHt,
      ref,
    })
  }

  for (const { supplier, invoiceDaysOpen, amountHt, ref } of AGED_PAYABLES) {
    addSupplierInvoice({
      entries,
      ecritureNum: nextNum(),
      invoiceDate: addDays(endMonth, -invoiceDaysOpen),
      supplier,
      amountHt,
      ref,
    })
  }
}

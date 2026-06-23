export interface DemoEntry {
  journalCode: string
  journalLib: string
  ecritureNum: string
  ecritureDate: Date
  compteNum: string
  compteLib: string
  compAuxNum: string
  compAuxLib: string
  pieceRef: string
  pieceDate: Date
  ecritureLib: string
  debit: number
  credit: number
}

export interface AccountRef {
  compteNum: string
  compteLib: string
  compAuxNum?: string
  compAuxLib?: string
}

export interface EntryBase {
  journalCode: string
  journalLib: string
  ecritureNum: string
  ecritureDate: Date
  pieceRef: string
  pieceDate: Date
  ecritureLib: string
}

export interface EntryLine extends AccountRef {
  debit: number
  credit: number
}

export interface Customer extends AccountRef {
  weight: number
  paymentDays: number
  hardwareBias: number
  projectBias: number
}

export interface Supplier extends AccountRef {
  account: AccountRef
  amount:
    | {
        kind: "fixed"
        min: number
        max: number
        growth?: number
      }
    | {
        kind: "revenue-share"
        share: number
      }
  paymentDays: number
  vatRate: number
  activeMonths?: readonly number[]
}

export interface RevenueLine {
  account: AccountRef
  share: number
}

export interface CustomerInvoiceInput {
  entries: DemoEntry[]
  ecritureNum: string
  invoiceDate: Date
  customer: Customer
  amountHt: number
  ref: string
}

export interface SupplierInvoiceInput {
  entries: DemoEntry[]
  ecritureNum: string
  invoiceDate: Date
  supplier: Supplier
  amountHt: number
  ref: string
}

export interface PaymentInput {
  entries: DemoEntry[]
  ecritureNum: string
  paymentDate: Date
  account: AccountRef
  amount: number
  ref: string
  label: string
}

export interface VatPaymentInput {
  entries: DemoEntry[]
  ecritureNum: string
  paymentDate: Date
  amount: number
  ref: string
}

export interface PayrollInput {
  entries: DemoEntry[]
  nextNum: () => string
  monthDate: Date
  monthIndex: number
  endMonth: Date
}

export interface TaxAccrualInput {
  entries: DemoEntry[]
  nextNum: () => string
  monthDate: Date
  monthlyTarget: number
  endMonth: Date
}

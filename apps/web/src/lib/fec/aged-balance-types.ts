export type AgedBalanceBucketKey = "notDue" | "0_30" | "31_60" | "60plus"

export interface AgedBalanceBucket {
  key: AgedBalanceBucketKey
  label: string
  count: number
  amount: number
}

export interface AgedBalanceCounterparty {
  accountNum: string
  label: string
  totalAmount: number
  overdueAmount: number
  oldestDaysOverdue: number
  oldestOpenDays: number
  invoiceCount: number
  worstBucketKey: AgedBalanceBucketKey
  worstBucketLabel: string
  worstBucketAmount: number
}

export interface AgedBalanceInvoice {
  id: string
  accountNum: string
  label: string
  ecritureNum: string
  ecritureLib: string
  pieceRef: string
  pieceDate: Date | null
  invoiceDate: Date
  dueDate: Date
  amount: number
  daysOverdue: number
  daysOpen: number
  bucketKey: AgedBalanceBucketKey
  bucketLabel: string
}

export interface AgedBalance {
  asOf: Date
  paymentDays: number
  totalAmount: number
  invoiceCount: number
  partyCount: number
  overdueAmount: number
  overdueInvoiceCount: number
  overduePartyCount: number
  notDueAmount: number
  notDueInvoiceCount: number
  notDuePartyCount: number
  buckets: AgedBalanceBucket[]
  invoices: AgedBalanceInvoice[]
  counterparties: AgedBalanceCounterparty[]
  topOverdueParties: AgedBalanceCounterparty[]
}

export type BalanceSheetLineKey =
  | "fixedAssets"
  | "inventory"
  | "customerReceivables"
  | "otherReceivables"
  | "cash"
  | "equity"
  | "financialDebt"
  | "supplierPayables"
  | "otherPayables"
  | "negativeCash"

export interface BalanceSheetLine {
  key: BalanceSheetLineKey
  label: string
  amount: number
  description: string
}

export type BalanceSheetRatioStatus = "good" | "watch" | "risk" | "info"

export interface BalanceSheetRatio {
  key:
    | "currentLiquidity"
    | "debtToEquity"
    | "inventoryTurnover"
    | "cashRunway"
    | "equityRatio"
  label: string
  value: number | null
  unit: "ratio" | "times" | "months" | "percent"
  status: BalanceSheetRatioStatus
  formula: string
}

export interface BalanceSheetSummary {
  asOf: Date
  assets: {
    fixedAssets: number
    inventory: number
    customerReceivables: number
    otherReceivables: number
    cash: number
  }
  funding: {
    equity: number
    financialDebt: number
    supplierPayables: number
    otherPayables: number
    negativeCash: number
  }
  assetLines: BalanceSheetLine[]
  fundingLines: BalanceSheetLine[]
  totalAssets: number
  totalFunding: number
  balanceGap: number
  currentAssets: number
  currentLiabilities: number
  totalDebt: number
  workingCapital: number
  workingCapitalRequirement: number
  netCash: number
  averageInventory: number
  ratios: BalanceSheetRatio[]
}

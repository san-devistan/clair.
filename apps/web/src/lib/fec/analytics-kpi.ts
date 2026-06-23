import {
  getExpenseCategory,
  isAmortizationAccount,
  isCashAccount,
  isCustomerAccount,
  isExpenseAccount,
  isExternalChargeAccount,
  isFinancialChargeAccount,
  isPayrollAccount,
  isPurchaseAccount,
  isRevenueAccount,
  isSupplierAccount,
  isTaxAccount,
} from "./accounts"
import type { KpiSummary } from "./analytics-types"
import type { FecEntry } from "./types"

export function computeKpi(entries: FecEntry[]): KpiSummary {
  const revenue = sumRevenue(entries)
  const expenses = sumExpenses(entries)
  const netResult = revenue - expenses
  const margin = revenue > 0 ? (netResult / revenue) * 100 : 0

  const purchases = sumByPredicate(entries, (e) =>
    isPurchaseAccount(e.compteNum)
  )
  const externalCharges = sumByPredicate(entries, (e) =>
    isExternalChargeAccount(e.compteNum)
  )
  const payroll = sumByPredicate(entries, (e) => isPayrollAccount(e.compteNum))
  const taxes = sumByPredicate(entries, (e) => isTaxAccount(e.compteNum))
  const financialCharges = sumByPredicate(entries, (e) =>
    isFinancialChargeAccount(e.compteNum)
  )
  const amortizations = sumByPredicate(entries, (e) =>
    isAmortizationAccount(e.compteNum)
  )
  const balance = computeBalanceKpis(entries)
  const grossMargin = revenue - purchases
  const contribution = computeContributionMargin(entries, revenue, expenses)

  return {
    revenue,
    expenses,
    netResult,
    margin,
    purchases,
    externalCharges,
    payroll,
    taxes,
    financialCharges,
    amortizations,
    ...balance,
    grossMargin,
    grossMarginRate: revenue > 0 ? (grossMargin / revenue) * 100 : 0,
    ebe: revenue - purchases - externalCharges - payroll - taxes,
    ...contribution,
  }
}

function sumRevenue(entries: FecEntry[]): number {
  let total = 0
  for (const e of entries) {
    if (isRevenueAccount(e.compteNum)) total += e.credit - e.debit
  }
  return total
}

function sumExpenses(entries: FecEntry[]): number {
  let total = 0
  for (const e of entries) {
    if (isExpenseAccount(e.compteNum)) total += e.debit - e.credit
  }
  return total
}

function sumByPredicate(
  entries: FecEntry[],
  predicate: (e: FecEntry) => boolean
): number {
  let total = 0
  for (const e of entries) {
    if (predicate(e)) total += e.debit - e.credit
  }
  return total
}

function computeBalanceKpis(entries: FecEntry[]) {
  let cashBalance = 0
  let customerReceivables = 0
  let supplierPayables = 0
  for (const e of entries) {
    if (isCashAccount(e.compteNum)) cashBalance += e.debit - e.credit
    if (isCustomerAccount(e.compteNum))
      customerReceivables += e.debit - e.credit
    if (isSupplierAccount(e.compteNum)) supplierPayables += e.credit - e.debit
  }

  return { cashBalance, customerReceivables, supplierPayables }
}

function computeContributionMargin(
  entries: FecEntry[],
  revenue: number,
  expenses: number
) {
  const variableCosts = sumByPredicate(entries, (e) => {
    const cat = getExpenseCategory(e.compteNum)
    return cat?.key === "variables"
  })
  const fixedCosts = expenses - variableCosts
  const contributionMargin = revenue - variableCosts
  const contributionMarginRate =
    revenue > 0 ? (contributionMargin / revenue) * 100 : 0
  const breakevenPoint =
    contributionMarginRate > 0 ? fixedCosts / (contributionMarginRate / 100) : 0
  const safetyMargin = breakevenPoint > 0 ? revenue - breakevenPoint : 0
  const safetyMarginRate = revenue > 0 ? (safetyMargin / revenue) * 100 : 0

  return {
    variableCosts,
    fixedCosts,
    contributionMargin,
    contributionMarginRate,
    breakevenPoint,
    safetyMargin,
    safetyMarginRate,
  }
}

"use client"

import { CombinedRepartitionBreakdown } from "@/components/fec/combined-repartition-breakdown"
import type { AccountDetail } from "@/lib/fec/account-details"
import type { CategoryBreakdown } from "@/lib/fec/analytics"

interface ResultBreakdownProps {
  revenueCategories: CategoryBreakdown[]
  revenueDetails: AccountDetail[]
  expenseCategories: CategoryBreakdown[]
  expenseDetails: AccountDetail[]
}

export function ResultBreakdown({
  revenueCategories,
  revenueDetails,
  expenseCategories,
  expenseDetails,
}: ResultBreakdownProps) {
  return (
    <CombinedRepartitionBreakdown
      revenueCategories={revenueCategories}
      revenueDetails={revenueDetails}
      expenseCategories={expenseCategories}
      expenseDetails={expenseDetails}
    />
  )
}

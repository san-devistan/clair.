"use client"

import {
  comparisonStartBounds,
  monthCount,
  suggestComparisonRange,
} from "@/lib/fec/date-ranges"
import { useFecStore } from "@/lib/fec/store"
import { usePathname } from "@/lib/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import {
  MonthRangePicker,
  type MonthRangePickerValue,
} from "@workspace/ui/components/month-range-picker"
import { useCallback, useMemo } from "react"

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/dashboard/insights": "Actions à mener",
  "/dashboard/bilan": "Bilan",
  "/dashboard/revenus": "Revenus",
  "/dashboard/charges": "Charges",
  "/dashboard/tresorerie": "Trésorerie",
  "/dashboard/clients": "Clients",
  "/dashboard/fournisseurs": "Fournisseurs",
}

export function DashboardHeader() {
  const pathname = usePathname() ?? "/dashboard"
  const {
    availableRange,
    selectedRange,
    comparisonRange,
    setSelectedRange,
    setComparisonRange,
  } = useFecStore()
  const pageLabel = PAGE_LABELS[pathname] ?? "Tableau de bord"
  const isOverview = pathname === "/dashboard"
  const comparisonStartRange = useMemo(
    () =>
      selectedRange && availableRange
        ? comparisonStartBounds(selectedRange, availableRange)
        : null,
    [availableRange, selectedRange]
  )
  const comparisonSuggestion = useMemo(
    () =>
      selectedRange && availableRange
        ? suggestComparisonRange(selectedRange, availableRange)
        : null,
    [availableRange, selectedRange]
  )
  const changeSelectedRange = useCallback(
    (value: MonthRangePickerValue) => setSelectedRange(value),
    [setSelectedRange]
  )
  const changeComparisonRange = useCallback(
    (value: MonthRangePickerValue | null) => setComparisonRange(value),
    [setComparisonRange]
  )
  const comparison = useMemo(
    () =>
      selectedRange && comparisonStartRange
        ? {
            value: comparisonRange,
            onValueChange: changeComparisonRange,
            suggestedValue: comparisonSuggestion,
            minStartMonth: comparisonStartRange.startMonth,
            maxStartMonth: comparisonStartRange.endMonth,
            monthsCovered: monthCount(selectedRange),
            label: "Comparaison",
            addLabel: "Ajouter une comparaison",
            removeLabel: "Retirer la comparaison",
          }
        : undefined,
    [
      comparisonRange,
      comparisonStartRange,
      comparisonSuggestion,
      changeComparisonRange,
      selectedRange,
    ]
  )

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
          </BreadcrumbItem>
          {isOverview ? null : (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {isOverview ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="md:hidden">{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      {selectedRange && availableRange ? (
        <MonthRangePicker
          value={selectedRange}
          onValueChange={changeSelectedRange}
          minMonth={availableRange.startMonth}
          maxMonth={availableRange.endMonth}
          label="Période affichée"
          className="max-w-[13rem] md:max-w-none"
          comparison={comparison}
        />
      ) : null}
    </div>
  )
}

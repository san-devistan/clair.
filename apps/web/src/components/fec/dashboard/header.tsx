"use client"

import Link from "@/components/link"
import {
  comparisonStartBounds,
  monthCount,
  suggestComparisonRange,
} from "@/lib/fec/date-ranges"
import { useFecStore } from "@/lib/fec/store-context"
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

import { DemoFecUploadButton } from "./demo-fec-upload-button"
import { useDashboardHref, useDashboardMode } from "./mode"

const PAGE_LABELS: Record<string, string> = {
  "": "Vue d'ensemble",
  "/insights": "Actions à mener",
  "/bilan": "Bilan",
  "/revenus": "Revenus",
  "/charges": "Charges",
  "/tresorerie": "Trésorerie",
  "/clients": "Clients",
  "/fournisseurs": "Fournisseurs",
}

export function DashboardHeader() {
  const mode = useDashboardMode()
  const rootHref = useDashboardHref()
  const pathname = usePathname() ?? rootHref
  const {
    availableRange,
    selectedRange,
    comparisonRange,
    setSelectedRange,
    setComparisonRange,
  } = useFecStore()
  const routePath = pathname.slice(rootHref.length)
  const rootLink = useMemo(() => <Link href={rootHref} />, [rootHref])
  const pageLabel = PAGE_LABELS[routePath] ?? "Tableau de bord"
  const isOverview = routePath === ""
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
            <BreadcrumbLink render={rootLink}>
              {mode === "demo" ? "Démo" : "Tableau de bord"}
            </BreadcrumbLink>
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

      <div className="flex min-w-0 items-center justify-end gap-2">
        {selectedRange && availableRange ? (
          <div className="max-w-header-select min-w-0 md:max-w-none">
            <MonthRangePicker
              value={selectedRange}
              onValueChange={changeSelectedRange}
              minMonth={availableRange.startMonth}
              maxMonth={availableRange.endMonth}
              label="Période affichée"
              comparison={comparison}
            />
          </div>
        ) : null}
        {mode === "demo" ? <DemoFecUploadButton /> : null}
      </div>
    </div>
  )
}

"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  X,
} from "lucide-react"
import * as React from "react"

import {
  formatMonthRange,
  isSelectableMonth,
  monthCount,
  monthRangeWithLength,
  monthSelectionState,
  monthsForYear,
  monthStartDate,
  normalizeMonthRange,
  type MonthRangePickerValue,
  yearFromMonth,
} from "./month-range-utils"

interface MonthRangePickerComparison {
  value: MonthRangePickerValue | null
  onValueChange: (value: MonthRangePickerValue | null) => void
  suggestedValue: MonthRangePickerValue | null
  minStartMonth: string
  maxStartMonth: string
  monthsCovered: number
  label?: string
  addLabel?: string
  removeLabel?: string
}

interface MonthRangePickerProps {
  value: MonthRangePickerValue
  onValueChange: (value: MonthRangePickerValue) => void
  minMonth: string
  maxMonth: string
  label?: string
  locale?: string
  className?: string
  disabled?: boolean
  align?: React.ComponentProps<typeof PopoverContent>["align"]
  side?: React.ComponentProps<typeof PopoverContent>["side"]
  comparison?: MonthRangePickerComparison
}

interface MonthRangePanelProps {
  value: MonthRangePickerValue
  onValueChange: (value: MonthRangePickerValue) => void
  minMonth: string
  maxMonth: string
  locale: string
  fixedMonthCount?: number
  initialMonth?: string
}

interface MonthButtonProps {
  month: string
  disabled: boolean
  range: MonthRangePickerValue
  formatter: Intl.DateTimeFormat
  onSelectMonth: (month: string) => void
}

const DEFAULT_LABEL = "Période"
const DEFAULT_COMPARISON_LABEL = "Comparaison"
const DEFAULT_ADD_COMPARISON_LABEL = "Ajouter une comparaison"
const DEFAULT_REMOVE_COMPARISON_LABEL = "Retirer la comparaison"
const DEFAULT_LOCALE = "fr-FR"

function MonthRangePicker({
  value,
  onValueChange,
  minMonth,
  maxMonth,
  label = DEFAULT_LABEL,
  locale = DEFAULT_LOCALE,
  className,
  disabled = false,
  align = "end",
  side = "bottom",
  comparison,
}: MonthRangePickerProps) {
  const valueLabel = formatMonthRange(value)
  const comparisonLabel = comparison?.value
    ? formatMonthRange(comparison.value)
    : null
  const trigger = React.useMemo(
    () => (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        className={cn(
          "h-8 max-w-full min-w-0 justify-start gap-1.5 px-2.5",
          className
        )}
      />
    ),
    [className, disabled]
  )

  return (
    <Popover>
      <PopoverTrigger render={trigger}>
        <CalendarRange className="size-3.5" />
        <span className="min-w-0 truncate">{valueLabel}</span>
        {comparisonLabel ? (
          <span className="hidden min-w-0 truncate text-muted-foreground lg:inline">
            vs {comparisonLabel}
          </span>
        ) : null}
        <ChevronDown className="ml-auto size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] gap-3 p-3"
      >
        <PopoverHeader>
          <PopoverTitle>{label}</PopoverTitle>
        </PopoverHeader>
        <MonthRangePanel
          value={value}
          onValueChange={onValueChange}
          minMonth={minMonth}
          maxMonth={maxMonth}
          locale={locale}
        />
        {comparison ? (
          <ComparisonPanel
            comparison={comparison}
            selectedRange={value}
            locale={locale}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function ComparisonPanel({
  comparison,
  locale,
  selectedRange,
}: {
  comparison: MonthRangePickerComparison
  locale: string
  selectedRange: MonthRangePickerValue
}) {
  const addComparison = React.useCallback(() => {
    if (comparison.suggestedValue) {
      comparison.onValueChange(comparison.suggestedValue)
    }
  }, [comparison])

  const removeComparison = React.useCallback(() => {
    comparison.onValueChange(null)
  }, [comparison])

  return (
    <div className="border-t border-border pt-3">
      {comparison.value ? (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {comparison.label ?? DEFAULT_COMPARISON_LABEL}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {formatMonthRange(comparison.value)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={removeComparison}
              aria-label={
                comparison.removeLabel ?? DEFAULT_REMOVE_COMPARISON_LABEL
              }
              className="text-muted-foreground"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <MonthRangePanel
            value={comparison.value}
            onValueChange={comparison.onValueChange}
            minMonth={comparison.minStartMonth}
            maxMonth={comparison.maxStartMonth}
            fixedMonthCount={comparison.monthsCovered}
            initialMonth={comparison.value.startMonth}
            locale={locale}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-auto w-full justify-center gap-2 border-dashed py-2.5 text-muted-foreground hover:text-foreground"
          disabled={!comparison.suggestedValue || monthCount(selectedRange) < 1}
          onClick={addComparison}
        >
          <GitCompareArrows className="size-3.5" />
          <span>{comparison.addLabel ?? DEFAULT_ADD_COMPARISON_LABEL}</span>
        </Button>
      )}
    </div>
  )
}

function MonthRangePanel({
  value,
  onValueChange,
  minMonth,
  maxMonth,
  locale,
  fixedMonthCount,
  initialMonth,
}: MonthRangePanelProps) {
  const normalizedValue = normalizeMonthRange(value)
  const anchorMonthRef = React.useRef<string | null>(null)
  const [visibleYear, setVisibleYear] = React.useState(() =>
    yearFromMonth(initialMonth ?? normalizedValue.startMonth)
  )
  const formatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short" }),
    [locale]
  )
  const minYear = yearFromMonth(minMonth)
  const maxYear = yearFromMonth(maxMonth)

  const showPreviousYear = React.useCallback(() => {
    setVisibleYear((year) => Math.max(minYear, year - 1))
  }, [minYear])

  const showNextYear = React.useCallback(() => {
    setVisibleYear((year) => Math.min(maxYear, year + 1))
  }, [maxYear])

  const selectMonth = React.useCallback(
    (month: string) => {
      if (fixedMonthCount) {
        onValueChange(monthRangeWithLength(month, fixedMonthCount))
        return
      }

      const anchorMonth = anchorMonthRef.current
      if (!anchorMonth) {
        anchorMonthRef.current = month
        onValueChange({ startMonth: month, endMonth: month })
        return
      }

      onValueChange(
        normalizeMonthRange({ startMonth: anchorMonth, endMonth: month })
      )
      anchorMonthRef.current = null
    },
    [fixedMonthCount, onValueChange]
  )

  const months = React.useMemo(() => monthsForYear(visibleYear), [visibleYear])

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={showPreviousYear}
          disabled={visibleYear <= minYear}
          aria-label="Année précédente"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="text-sm font-medium tabular-nums">{visibleYear}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={showNextYear}
          disabled={visibleYear >= maxYear}
          aria-label="Année suivante"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {months.map((month) => (
          <MonthButton
            key={month}
            month={month}
            disabled={!isSelectableMonth(month, minMonth, maxMonth)}
            range={normalizedValue}
            formatter={formatter}
            onSelectMonth={selectMonth}
          />
        ))}
      </div>
    </div>
  )
}

function MonthButton({
  month,
  disabled,
  range,
  formatter,
  onSelectMonth,
}: MonthButtonProps) {
  const state = monthSelectionState(month, range)
  const selectMonth = React.useCallback(() => {
    onSelectMonth(month)
  }, [month, onSelectMonth])

  return (
    <Button
      type="button"
      variant={state === "edge" ? "default" : "ghost"}
      size="sm"
      disabled={disabled}
      onClick={selectMonth}
      data-range-middle={state === "middle"}
      className="h-8 justify-center rounded-md px-2 text-xs capitalize data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground"
    >
      {formatter.format(monthStartDate(month))}
    </Button>
  )
}

export { MonthRangePicker }
export type { MonthRangePickerValue }

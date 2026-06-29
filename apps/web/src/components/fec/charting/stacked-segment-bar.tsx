"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useCallback,
} from "react"

import {
  STACKED_BAR_CONTAINER_CLASS,
  STACKED_BAR_SEPARATOR_CLASS,
} from "./bar-style"

export interface StackedSegmentBarSegment {
  key: string
  label: string
  share: number
  fill: string
}

interface StackedSegmentBarProps<TSegment extends StackedSegmentBarSegment> {
  segments: TSegment[]
  ariaLabel: string
  getTooltipContent: (segment: TSegment) => ReactNode
  className?: string
  minInlineShare?: number
  onSegmentClick?: (segment: TSegment) => void
  getSegmentAriaLabel?: (segment: TSegment) => string
  getSegmentPressed?: (segment: TSegment) => boolean | undefined
  getForceInlineLabel?: (segment: TSegment) => boolean
  getLabelClassName?: (segment: TSegment) => string
}

const DEFAULT_MIN_INLINE_SHARE = 8
const DEFAULT_LABEL_CLASS_NAME =
  "max-w-full truncate text-xs font-semibold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"

export function StackedSegmentBar<TSegment extends StackedSegmentBarSegment>({
  segments,
  ariaLabel,
  getTooltipContent,
  className,
  minInlineShare = DEFAULT_MIN_INLINE_SHARE,
  onSegmentClick,
  getSegmentAriaLabel,
  getSegmentPressed,
  getForceInlineLabel,
  getLabelClassName,
}: StackedSegmentBarProps<TSegment>) {
  return (
    <div
      className={cn(STACKED_BAR_CONTAINER_CLASS, className)}
      aria-label={ariaLabel}
    >
      {segments.map((segment, idx) => (
        <StackedSegment
          key={segment.key}
          segment={segment}
          isFirst={idx === 0}
          minInlineShare={minInlineShare}
          getTooltipContent={getTooltipContent}
          onSegmentClick={onSegmentClick}
          getSegmentAriaLabel={getSegmentAriaLabel}
          getSegmentPressed={getSegmentPressed}
          getForceInlineLabel={getForceInlineLabel}
          getLabelClassName={getLabelClassName}
        />
      ))}
    </div>
  )
}

function StackedSegment<TSegment extends StackedSegmentBarSegment>({
  segment,
  isFirst,
  minInlineShare,
  getTooltipContent,
  onSegmentClick,
  getSegmentAriaLabel,
  getSegmentPressed,
  getForceInlineLabel,
  getLabelClassName,
}: {
  segment: TSegment
  isFirst: boolean
  minInlineShare: number
  getTooltipContent: (segment: TSegment) => ReactNode
  onSegmentClick?: (segment: TSegment) => void
  getSegmentAriaLabel?: (segment: TSegment) => string
  getSegmentPressed?: (segment: TSegment) => boolean | undefined
  getForceInlineLabel?: (segment: TSegment) => boolean
  getLabelClassName?: (segment: TSegment) => string
}) {
  const showInline = shouldShowInline(
    segment,
    minInlineShare,
    getForceInlineLabel
  )
  const labelClassName = segmentLabelClassName(segment, getLabelClassName)
  const blockClassName = segmentBlockClassName(Boolean(onSegmentClick), isFirst)
  const style: CSSProperties = {
    width: `${String(segment.share)}%`,
    background: segment.fill,
  }
  const clickSegment = useCallback(() => {
    onSegmentClick?.(segment)
  }, [onSegmentClick, segment])

  return (
    <Tooltip>
      <TooltipTrigger
        render={segmentTrigger({
          segment,
          style,
          className: blockClassName,
          onSegmentClick: onSegmentClick ? clickSegment : undefined,
          getSegmentAriaLabel,
          getSegmentPressed,
        })}
      >
        {showInline ? (
          <span className={labelClassName}>{segment.label}</span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>{getTooltipContent(segment)}</TooltipContent>
    </Tooltip>
  )
}

function segmentTrigger<TSegment extends StackedSegmentBarSegment>({
  segment,
  style,
  className,
  onSegmentClick,
  getSegmentAriaLabel,
  getSegmentPressed,
}: {
  segment: TSegment
  style: CSSProperties
  className: string
  onSegmentClick?: () => void
  getSegmentAriaLabel?: (segment: TSegment) => string
  getSegmentPressed?: (segment: TSegment) => boolean | undefined
}): ReactElement {
  if (onSegmentClick)
    return (
      <button
        type="button"
        style={style}
        className={className}
        aria-label={segmentAriaLabel(segment, getSegmentAriaLabel)}
        aria-pressed={getSegmentPressed?.(segment)}
        onClick={onSegmentClick}
      />
    )

  return <div style={style} className={className} />
}

function segmentBlockClassName(
  isInteractive: boolean,
  isFirst: boolean
): string {
  return cn(
    "flex min-w-0 items-center justify-center px-2 text-center transition-all",
    isInteractive
      ? "cursor-pointer appearance-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      : "cursor-default",
    !isFirst && STACKED_BAR_SEPARATOR_CLASS
  )
}

function shouldShowInline<TSegment extends StackedSegmentBarSegment>(
  segment: TSegment,
  minInlineShare: number,
  getForceInlineLabel?: (segment: TSegment) => boolean
): boolean {
  if (getForceInlineLabel?.(segment)) return true
  return segment.share >= minInlineShare
}

function segmentLabelClassName<TSegment extends StackedSegmentBarSegment>(
  segment: TSegment,
  getLabelClassName?: (segment: TSegment) => string
): string {
  if (getLabelClassName) return getLabelClassName(segment)
  return DEFAULT_LABEL_CLASS_NAME
}

function segmentAriaLabel<TSegment extends StackedSegmentBarSegment>(
  segment: TSegment,
  getSegmentAriaLabel?: (segment: TSegment) => string
): string {
  if (getSegmentAriaLabel) return getSegmentAriaLabel(segment)
  return segment.label
}

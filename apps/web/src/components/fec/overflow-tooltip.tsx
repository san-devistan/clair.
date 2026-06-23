"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { createElement, useCallback, useEffect, useRef, useState } from "react"

interface OverflowTooltipProps {
  text: string
  className?: string
  wrapperClassName?: string
}

export function OverflowTooltip({
  text,
  className,
  wrapperClassName,
}: OverflowTooltipProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const updateOverflow = useCallback((element: HTMLSpanElement) => {
    setIsOverflowing(element.scrollWidth > element.clientWidth)
  }, [])
  const setTextElement = useCallback(
    (element: HTMLSpanElement | null) => {
      ref.current = element
      if (element) updateOverflow(element)
    },
    [updateOverflow]
  )

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new ResizeObserver(() => updateOverflow(element))
    observer.observe(element)
    return () => observer.disconnect()
  }, [updateOverflow])

  const content = (
    <span
      key={text}
      ref={setTextElement}
      className={cn("block max-w-full min-w-0 truncate", className)}
    >
      {text}
    </span>
  )
  const wrapperClass = cn("block max-w-full min-w-0", wrapperClassName)

  const trigger = createElement("span", { className: wrapperClass })

  return isOverflowing ? (
    <Tooltip>
      <TooltipTrigger render={trigger}>{content}</TooltipTrigger>
      <TooltipContent align="start" className="max-w-80">
        {text}
      </TooltipContent>
    </Tooltip>
  ) : (
    <span className={wrapperClass}>{content}</span>
  )
}

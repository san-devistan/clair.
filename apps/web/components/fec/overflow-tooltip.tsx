"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useRef, useState } from "react"

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

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function updateOverflow() {
      if (!element) return
      setIsOverflowing(element.scrollWidth > element.clientWidth)
    }

    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  const content = (
    <span
      ref={ref}
      className={cn("block max-w-full min-w-0 truncate", className)}
    >
      {text}
    </span>
  )
  const wrapperClass = cn("block max-w-full min-w-0", wrapperClassName)

  if (!isOverflowing) return <span className={wrapperClass}>{content}</span>

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={wrapperClass} />}>
        {content}
      </TooltipTrigger>
      <TooltipContent align="start" className="max-w-80">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

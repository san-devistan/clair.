"use client"

import { CardTitle } from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import { type ReactNode, useMemo } from "react"

interface ExplainedCardTitleProps {
  children: ReactNode
  description: ReactNode
  className?: string
  label?: string
}

export function ExplainedCardTitle({
  children,
  description,
  className,
  label = "ce bloc",
}: ExplainedCardTitleProps) {
  const ariaLabel = `${label} : aide à l'interprétation`
  const trigger = useMemo(
    () => (
      <CardTitle
        aria-label={ariaLabel}
        className={cn("w-fit cursor-help", className)}
        tabIndex={0}
      >
        {children}
      </CardTitle>
    ),
    [ariaLabel, children, className]
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent align="start" className="max-w-72" side="top">
        <div className="leading-relaxed">{description}</div>
      </TooltipContent>
    </Tooltip>
  )
}

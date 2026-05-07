"use client"

import { CardTitle } from "@workspace/ui/components/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

interface ExplainedCardTitleProps {
  children: ReactNode
  description: ReactNode
  className?: string
}

export function ExplainedCardTitle({
  children,
  description,
  className,
}: ExplainedCardTitleProps) {
  const label = typeof children === "string" ? children : "ce bloc"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <CardTitle
            aria-label={`${label} : aide à l'interprétation`}
            className={cn("w-fit cursor-help", className)}
            tabIndex={0}
          >
            {children}
          </CardTitle>
        }
      />
      <TooltipContent align="start" className="max-w-72" side="top">
        <div className="leading-relaxed">{description}</div>
      </TooltipContent>
    </Tooltip>
  )
}

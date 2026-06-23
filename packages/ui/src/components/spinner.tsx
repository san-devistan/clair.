import { cn } from "@workspace/ui/lib/utils"
import { Loader2Icon } from "lucide-react"
import type { ComponentProps } from "react"

function Spinner({ className, ...props }: ComponentProps<"output">) {
  return (
    <output
      aria-label="Loading"
      className={cn("inline-flex", className)}
      {...props}
    >
      <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
    </output>
  )
}

export { Spinner }

import {
  ChartContext,
  type ChartConfig,
} from "@workspace/ui/components/chart-context"
import { ChartLegendContent } from "@workspace/ui/components/chart-legend"
import { ChartStyle } from "@workspace/ui/components/chart-style"
import { ChartTooltipContent } from "@workspace/ui/components/chart-tooltip"
import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

const INITIAL_DIMENSION = { width: 320, height: 200 } as const
type ChartDimension = {
  width: number
  height: number
}
type RechartsComponents = Awaited<ReturnType<typeof loadRechartsComponents>>
type ChartComponents = Omit<RechartsComponents, "ResponsiveContainer">
type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig
  children: (components: ChartComponents) => React.ReactNode
  initialDimension?: ChartDimension
}

async function loadRechartsComponents() {
  const module = await import("recharts")

  return {
    Area: module.Area,
    AreaChart: module.AreaChart,
    Bar: module.Bar,
    BarChart: module.BarChart,
    CartesianGrid: module.CartesianGrid,
    Cell: module.Cell,
    ChartLegend: module.Legend,
    ChartTooltip: module.Tooltip,
    ComposedChart: module.ComposedChart,
    LabelList: module.LabelList,
    ResponsiveContainer: module.ResponsiveContainer,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
  }
}

const RechartsRoot = React.lazy(async () => {
  const { ResponsiveContainer, ...components } = await loadRechartsComponents()

  function LoadedRechartsRoot({
    children,
    initialDimension,
  }: {
    children: (components: ChartComponents) => React.ReactNode
    initialDimension: ChartDimension
  }) {
    return (
      <ResponsiveContainer initialDimension={initialDimension}>
        {children(components)}
      </ResponsiveContainer>
    )
  }

  return { default: LoadedRechartsRoot }
})

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`
  const contextValue = React.useMemo(() => ({ config }), [config])

  return (
    <ChartContext.Provider value={contextValue}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <React.Suspense fallback={null}>
          <RechartsRoot initialDimension={initialDimension}>
            {children}
          </RechartsRoot>
        </React.Suspense>
      </div>
    </ChartContext.Provider>
  )
}

export {
  type ChartConfig,
  type ChartComponents,
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
}

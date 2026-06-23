import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import type { Config as RouterPluginConfig } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig, type Rollup } from "vite"
import viteTsConfigPaths from "vite-tsconfig-paths"

const ignoredRollupWarningCodes = new Set([
  "EMPTY_BUNDLE",
  "MODULE_LEVEL_DIRECTIVE",
])

const handleRollupWarning: Rollup.WarningHandlerWithDefault = (
  warning,
  warn
) => {
  if (ignoredRollupWarningCodes.has(warning.code ?? "")) {
    return
  }

  warn(warning)
}

const routerConfig = {
  routeFileIgnorePattern: "\\.js$",
} satisfies Partial<RouterPluginConfig>

const vendorChunkRules = [
  {
    chunkName: "react-vendor",
    packages: ["react", "react-dom", "scheduler", "use-sync-external-store"],
  },
  {
    chunkName: "router-vendor",
    packages: [
      "@tanstack/history",
      "@tanstack/query-core",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "@tanstack/react-router-ssr-query",
      "@tanstack/react-store",
      "@tanstack/router-core",
      "@tanstack/router-ssr-query-core",
      "@tanstack/start",
      "@tanstack/store",
    ],
  },
  {
    chunkName: "charts-vendor",
    packages: ["recharts"],
  },
  {
    chunkName: "d3-vendor",
    packages: [
      "d3-array",
      "d3-color",
      "d3-format",
      "d3-interpolate",
      "d3-path",
      "d3-scale",
      "d3-shape",
      "d3-time",
      "d3-time-format",
      "internmap",
      "victory-vendor",
    ],
  },
  {
    chunkName: "convex-vendor",
    packages: ["@convex-dev/react-query", "convex"],
  },
  {
    chunkName: "ui-vendor",
    packages: ["@base-ui", "lucide-react", "next-themes", "sonner"],
  },
] as const

function isPackageId(id: string, packageName: string) {
  return id.includes(`/node_modules/${packageName}/`)
}

function manualChunks(id: string) {
  const normalizedId = id.replaceAll("\\", "/")
  if (!normalizedId.includes("/node_modules/")) return undefined

  for (const rule of vendorChunkRules) {
    if (
      rule.packages.some((packageName) =>
        isPackageId(normalizedId, packageName)
      )
    ) {
      return rule.chunkName
    }
  }

  return undefined
}

const config = defineConfig({
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
      onwarn: handleRollupWarning,
    },
  },
  plugins: [
    nitro({
      rollupConfig: {
        onwarn: handleRollupWarning,
      },
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      router: routerConfig,
    }),
    viteReact(),
  ],
})

export default config

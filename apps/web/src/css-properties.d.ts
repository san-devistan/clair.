import type { CSSProperties as ReactCSSProperties } from "react"

declare module "react" {
  interface CSSProperties extends Pick<ReactCSSProperties, never> {
    [property: `--${string}`]: string | number | undefined
  }
}

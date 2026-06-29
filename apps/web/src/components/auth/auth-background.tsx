import type { CSSProperties } from "react"

const DOT_BACKGROUND_STYLE = {
  backgroundImage:
    "radial-gradient(color-mix(in oklch, var(--primary) 24%, transparent) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
} satisfies CSSProperties

export function AuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--primary)_30%,transparent)_0%,transparent_58%),linear-gradient(to_bottom,var(--background),var(--background))]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={DOT_BACKGROUND_STYLE}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-primary/10 to-transparent" />
    </>
  )
}

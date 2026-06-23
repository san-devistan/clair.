import { formatNumber, oklchToHsl } from "./color.mjs"
import { COLOR_TOKENS, FONT_WEIGHT, expectRecord } from "./tokens.mjs"

const GENERATED_HEADER =
  "/* Generated from packages/ui/src/tokens/design-tokens.json. Do not edit by hand. */"
const DEFAULT_WEB_FONT_IMPORTS = ["@fontsource-variable/inter"]

function toCamelCase(token) {
  return token.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
}

function formatPropertyName(name) {
  return /^[A-Za-z_$][\w$]*$/u.test(name) ? name : JSON.stringify(name)
}

function formatTsValue(value, indent = 0) {
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number") return value.toString()

  const record = expectRecord(value, "generated value")
  const indentation = " ".repeat(indent)
  const childIndentation = " ".repeat(indent + 2)
  const lines = ["{"]

  for (const [name, childValue] of Object.entries(record)) {
    lines.push(
      `${childIndentation}${formatPropertyName(name)}: ${formatTsValue(
        childValue,
        indent + 2
      )},`
    )
  }

  lines.push(`${indentation}}`)

  return lines.join("\n")
}

function optionalRecord(value, pathName) {
  if (value === undefined) return {}

  return expectRecord(value, pathName)
}

function optionalString(value, fallback, pathName) {
  if (value === undefined) return fallback
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${pathName} must be a non-empty string`)
  }

  return value
}

function optionalStringArray(value, fallback, pathName) {
  if (value === undefined) return fallback
  if (!Array.isArray(value)) throw new Error(`${pathName} must be an array`)

  for (const [index, childValue] of value.entries()) {
    if (typeof childValue !== "string" || childValue.length === 0) {
      throw new Error(`${pathName}.${String(index)} must be a non-empty string`)
    }
  }

  return value
}

function getWebConfig(tokens) {
  const web = optionalRecord(tokens.web, "web")

  return {
    bodyApply: optionalString(
      web.bodyApply,
      "@apply bg-background text-foreground;",
      "web.bodyApply"
    ),
    darkVars: optionalRecord(web.darkVars, "web.darkVars"),
    imports: optionalStringArray(
      web.imports,
      DEFAULT_WEB_FONT_IMPORTS,
      "web.imports"
    ),
    lightVars: optionalRecord(web.lightVars, "web.lightVars"),
    themeVars: optionalRecord(web.themeVars, "web.themeVars"),
  }
}

function buildImportLines(imports) {
  return imports
    .map((specifier) => `@import ${JSON.stringify(specifier)};`)
    .join("\n")
}

function pxToRem(value) {
  return `${formatNumber(value / 16)}rem`
}

export function buildMobileColors(colors) {
  return Object.fromEntries(
    COLOR_TOKENS.map((token) => [token, oklchToHsl(colors[token])])
  )
}

function buildCssVars(vars, indent = 4) {
  const spaces = " ".repeat(indent)

  return Object.entries(vars)
    .map(([name, value]) => `${spaces}--${name}: ${String(value)};`)
    .join("\n")
}

function buildColorVars(colors) {
  return Object.fromEntries(COLOR_TOKENS.map((token) => [token, colors[token]]))
}

function buildRadiusVars(radius) {
  return {
    radius: radius.base,
    ...Object.fromEntries(
      Object.entries(radius.scale).map(([name, value]) => [
        `radius-${name}`,
        value,
      ])
    ),
  }
}

function buildFontVars(fonts) {
  return {
    "font-heading": fonts.web.heading,
    "font-sans": fonts.web.sans,
  }
}

function buildMotionVars(motion) {
  return {
    ...Object.fromEntries(
      Object.entries(motion.durationMs).map(([name, value]) => [
        `duration-${name}`,
        `${String(value)}ms`,
      ])
    ),
    ...Object.fromEntries(
      Object.entries(motion.easing).map(([name, value]) => [
        `ease-${name}`,
        value,
      ])
    ),
  }
}

function buildShadowVars(shadow) {
  return Object.fromEntries(
    Object.entries(shadow).map(([name, value]) => [`shadow-${name}`, value])
  )
}

function buildTypographyVars(typography) {
  return Object.fromEntries(
    Object.entries(typography).flatMap(([name, token]) => [
      [`text-${name}-size`, pxToRem(token.fontSize)],
      [`text-${name}-line-height`, pxToRem(token.lineHeight)],
      [`text-${name}-font-weight`, FONT_WEIGHT[token.font].toString()],
    ])
  )
}

function buildThemeInlineVars(tokens) {
  return {
    ...buildFontVars(tokens.fonts),
    ...Object.fromEntries(
      COLOR_TOKENS.map((token) => [`color-${token}`, `var(--${token})`])
    ),
    ...Object.fromEntries(
      Object.keys(tokens.radius.scale).map((name) => [
        `radius-${name}`,
        tokens.radius.scale[name],
      ])
    ),
    ...Object.fromEntries(
      Object.keys(tokens.shadow).map((name) => [
        `shadow-${name}`,
        tokens.shadow[name],
      ])
    ),
  }
}

export function buildWebCss(tokens) {
  const web = getWebConfig(tokens)
  const rootVars = {
    ...buildColorVars(tokens.colors.light),
    ...buildRadiusVars(tokens.radius),
    ...buildMotionVars(tokens.motion),
    ...buildShadowVars(tokens.shadow),
    ...buildTypographyVars(tokens.typography),
    ...web.lightVars,
  }
  const darkVars = {
    ...buildColorVars(tokens.colors.dark),
    ...web.darkVars,
  }
  const themeVars = {
    ...buildThemeInlineVars(tokens),
    ...web.themeVars,
  }

  return `${GENERATED_HEADER}

@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
${buildImportLines(web.imports)}

@custom-variant dark (&:is(.dark *));
@source "../../../apps/**/*.{ts,tsx}";
@source "../../../components/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

@theme inline {
${buildCssVars(themeVars, 2)}
}

:root {
${buildCssVars(rootVars, 2)}
}

.dark {
${buildCssVars(darkVars, 2)}
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    ${web.bodyApply}
  }
  button:not(:disabled),
  [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
`
}

export function buildMobileCss(tokens, lightTheme, darkTheme) {
  const rootVars = {
    ...lightTheme,
    ...buildRadiusVars(tokens.radius),
    ...buildFontVars(tokens.fonts),
    ...buildMotionVars(tokens.motion),
    ...buildShadowVars(tokens.shadow),
    ...buildTypographyVars(tokens.typography),
  }

  return `${GENERATED_HEADER}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${buildCssVars(rootVars)}
  }

  .dark {
${buildCssVars(darkTheme)}
  }
}
`
}

function buildThemeObject(theme, radius) {
  return [
    ...COLOR_TOKENS.map(
      (token) => `    ${toCamelCase(token)}: "hsl(${theme[token]})",`
    ),
    `    radius: "${radius.base}",`,
  ].join("\n")
}

function buildTypographyTs(typography) {
  const lines = ["{"]

  for (const [name, token] of Object.entries(typography)) {
    lines.push(`  ${formatPropertyName(name)}: {`)
    lines.push(`    fontSize: ${token.fontSize},`)
    lines.push(`    lineHeight: ${token.lineHeight},`)
    lines.push(`    fontFamily: FONT_FAMILY.${token.font},`)
    lines.push("  },")
  }

  lines.push("}")

  return lines.join("\n")
}

export function buildThemeTs(tokens, lightTheme, darkTheme) {
  return `// Generated from packages/ui/src/tokens/design-tokens.json. Do not edit by hand.
import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native"

export const FONT_FAMILY = ${formatTsValue(tokens.fonts.mobile)} as const

export const TYPOGRAPHY = ${buildTypographyTs(tokens.typography)} as const

export const MOTION = ${formatTsValue(tokens.motion)} as const

export const COMPONENT_TOKENS = ${formatTsValue(tokens.components)} as const

export const THEME = {
  light: {
${buildThemeObject(lightTheme, tokens.radius)}
  },
  dark: {
${buildThemeObject(darkTheme, tokens.radius)}
  },
} as const

export type ThemeName = keyof typeof THEME

export const NAV_THEME: Record<ThemeName, Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
}
`
}

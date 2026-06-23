import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { importAppliedTokens } from "./design-system/extract-applied-tokens.mjs"
import {
  buildMobileColors,
  buildMobileCss,
  buildThemeTs,
  buildWebCss,
} from "./design-system/render.mjs"
import { validateTokens } from "./design-system/tokens.mjs"

const execFileAsync = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const TOKENS_FILE = path.join(ROOT, "packages/ui/src/tokens/design-tokens.json")
const WEB_CSS = path.join(ROOT, "packages/ui/src/styles/globals.css")
const MOBILE_CSS = path.join(ROOT, "apps/mobile/global.css")
const MOBILE_THEME = path.join(ROOT, "apps/mobile/lib/theme.ts")

function parseArgs(argv) {
  const options = {
    importAppliedCss: "auto",
  }

  for (const arg of argv) {
    if (arg === "--") {
      continue
    }

    if (arg === "--import-applied-css") {
      options.importAppliedCss = "always"
      continue
    }

    if (arg === "--no-import-applied-css") {
      options.importAppliedCss = "never"
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function hasGitChanges(filePath) {
  const relativePath = path.relative(ROOT, filePath)

  try {
    const { stdout } = await execFileAsync(
      "git",
      ["status", "--porcelain", "--", relativePath],
      { cwd: ROOT }
    )

    return stdout.trim().length > 0
  } catch {
    return false
  }
}

async function shouldImportAppliedCss(mode, generatedWebCss) {
  if (mode === "always") {
    return true
  }

  if (mode === "never") {
    return false
  }

  const currentWebCss = await readFile(WEB_CSS, "utf8")

  if (currentWebCss === generatedWebCss) {
    return false
  }

  const [tokensChanged, webCssChanged] = await Promise.all([
    hasGitChanges(TOKENS_FILE),
    hasGitChanges(WEB_CSS),
  ])

  if (tokensChanged) {
    if (webCssChanged) {
      console.warn(
        [
          "Both design-tokens.json and globals.css have uncommitted changes.",
          "Using design-tokens.json as the source of truth.",
          "Use --import-applied-css to accept globals.css instead.",
        ].join(" ")
      )
    }

    return false
  }

  return webCssChanged
}

async function readTokens() {
  const tokenJson = await readFile(TOKENS_FILE, "utf8")

  return validateTokens(JSON.parse(tokenJson))
}

const options = parseArgs(process.argv.slice(2))
let tokens = await readTokens()

if (
  await shouldImportAppliedCss(options.importAppliedCss, buildWebCss(tokens))
) {
  const changes = await importAppliedTokens({
    tokensFile: TOKENS_FILE,
    webCss: WEB_CSS,
  })

  if (changes.length > 0) {
    console.log(`Imported ${changes.length} token paths from globals.css`)
    tokens = await readTokens()
  }
}

const lightTheme = buildMobileColors(tokens.colors.light)
const darkTheme = buildMobileColors(tokens.colors.dark)

await writeFile(WEB_CSS, buildWebCss(tokens))
await writeFile(MOBILE_CSS, buildMobileCss(tokens, lightTheme, darkTheme))
await writeFile(MOBILE_THEME, buildThemeTs(tokens, lightTheme, darkTheme))

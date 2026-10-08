#!/usr/bin/env node
/**
 * Vendors shadcn/ui's Radix-based components into `src/ui`, applying the same
 * transforms the shadcn CLI applies on `add`:
 *
 *   1. resolve `cn-*` style classes with the chosen style (default: nova)
 *   2. physical → logical classes for RTL (`ml-2` → `ms-2`, …)
 *   3. icon placeholders → Onu's semantic <Icon name="…" fallback={Glyph} /> (R6.5, see shadcn-icons.mjs)
 *   4. registry import aliases → package-relative imports
 *
 * Usage:
 *   node scripts/sync-shadcn.mjs [--src <path to shadcn-ui/ui checkout>] [--style nova] [component …]
 *
 * Without --src the script sparse-clones github.com/shadcn-ui/ui into a temp
 * directory. Review the git diff after running: files in `src/ui` may carry
 * small Onu patches marked with `// onu:` comments that must be re-applied.
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { createStyleMap, transformDirection, transformStyle } from "shadcn/utils"

import { readLucideMap, replaceIcons } from "./shadcn-icons.mjs"

const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(here, "../src/ui")

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  const [, value] = args.splice(i, 2)
  return value
}
let src = flag("--src")
const style = flag("--style") ?? "nova"
const only = args

/** Components we do not vendor (chat/AI specific or replaced by Onu). */
const SKIP = new Set([
  "_registry.ts",
  "attachment.tsx",
  "bubble.tsx",
  "marker.tsx",
  "message-scroller.tsx",
  "message.tsx",
  "questionnaire.tsx",
])

if (!src) {
  src = mkdtempSync(path.join(tmpdir(), "shadcn-"))
  console.log(`Cloning shadcn-ui/ui into ${src} …`)
  execFileSync(
    "git",
    ["clone", "--depth", "1", "--filter=blob:none", "--sparse", "https://github.com/shadcn-ui/ui", src],
    {
      stdio: "inherit",
    },
  )
  execFileSync("git", ["-C", src, "sparse-checkout", "set", "apps/v4/registry"], { stdio: "inherit" })
}

const registry = path.join(src, "apps/v4/registry")
const uiDir = path.join(registry, "bases/radix/ui")
const styleFile = path.join(registry, `styles/style-${style}.css`)
if (!existsSync(uiDir) || !existsSync(styleFile)) {
  throw new Error(`Could not find ${uiDir} or ${styleFile}`)
}

const styleMap = createStyleMap(readFileSync(styleFile, "utf8"))
const lucideMap = readLucideMap()

function rewriteImports(code) {
  return code
    .replace(/from "cn"/g, 'from "../lib/utils"')
    .replace(/from "@\/registry\/bases\/radix\/ui\/([^"]+)"/g, 'from "./$1"')
    .replace(/from "@\/registry\/bases\/radix\/hooks\/([^"]+)"/g, 'from "../hooks/$1"')
    .replace(/from "@\/registry\/bases\/radix\/lib\/([^"]+)"/g, 'from "../lib/$1"')
    .replace(/import \{ useTheme \} from "next-themes"/, 'import { useTheme } from "../providers/theme-provider"')
}

const files = readdirSync(uiDir).filter(
  (f) => /\.tsx?$/.test(f) && !SKIP.has(f) && (only.length === 0 || only.includes(f.replace(/\.tsx?$/, ""))),
)

for (const file of files) {
  let code = readFileSync(path.join(uiDir, file), "utf8")
  code = await transformStyle(code, { styleMap })
  code = await transformDirection(code, true)
  // Drop style hooks the chosen style leaves unmapped (menu/font options the CLI resolves from config).
  code = code.replace(/ cn-[a-z0-9-]+(?=[ "'`])/g, "").replace(/(["'`])cn-[a-z0-9-]+ ?/g, "$1")
  // <Icon> already mirrors directional icons in RTL; shadcn's extra rotation would flip them back.
  code = code.replace(/ ?rtl:rotate-180 ?/g, (m) => (m.startsWith(" ") && m.endsWith(" ") ? " " : ""))
  code = replaceIcons(code, lucideMap)
  code = rewriteImports(code)
  const header = `// Vendored from shadcn/ui (radix base, ${style} style, RTL) by scripts/sync-shadcn.mjs.\n// Onu changes are marked with "onu:" comments; keep them when re-syncing.\n`
  code = code.startsWith('"use client"') ? code.replace('"use client"\n', `"use client"\n\n${header}`) : header + code
  writeFileSync(path.join(outDir, file), code)
  console.log(`✓ ${file}`)
}

// shadcn's Tailwind helpers (custom variants like data-open/data-checked, accordion keyframes, scroll-fade).
const require = createRequire(import.meta.url)
const shadcnCss = require.resolve("shadcn/tailwind.css")
writeFileSync(
  path.resolve(here, "../src/styles/shadcn.css"),
  `/* Vendored from the shadcn package (dist/tailwind.css) by scripts/sync-shadcn.mjs. */\n${readFileSync(shadcnCss, "utf8")}`,
)
console.log("✓ styles/shadcn.css")

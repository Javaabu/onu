#!/usr/bin/env node
/**
 * Vendors shadcn/ui's Radix-based components into `src/ui`, applying the same
 * transforms the shadcn CLI applies on `add`:
 *
 *   1. resolve `cn-*` style classes with the chosen style (default: nova)
 *   2. physical → logical classes for RTL (`ml-2` → `ms-2`, …)
 *   3. icon placeholders → Onu's semantic <Icon name="…" /> (R6.5)
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

/** Lucide names used by shadcn → Onu semantic icon names. */
const ICON_NAMES = {
  CheckIcon: "check",
  ChevronDownIcon: "chevron-down",
  ChevronLeftIcon: "chevron-left",
  ChevronRightIcon: "chevron-right",
  ChevronUpIcon: "chevron-up",
  ArrowDownIcon: "arrow-down",
  ArrowLeftIcon: "arrow-left",
  ArrowRightIcon: "arrow-right",
  CircleCheckIcon: "success",
  InfoIcon: "info",
  MinusIcon: "minus",
  MoreHorizontalIcon: "more",
  OctagonXIcon: "error",
  PanelLeftIcon: "sidebar",
  SearchIcon: "search",
  TriangleAlertIcon: "warning",
  XIcon: "close",
  Loader2Icon: "loading",
  LoaderIcon: "loading",
  CircleIcon: "dot",
  GripVerticalIcon: "grip-vertical",
}

function kebab(name) {
  return name
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

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

function replaceIcons(code) {
  let used = false
  const out = code.replace(/<IconPlaceholder\b([\s\S]*?)\/>/g, (_, attrs) => {
    used = true
    const lucide = /lucide=(?:"([A-Za-z0-9]+)"|\{([^}]+)\})/.exec(attrs)
    const rest = attrs.replace(/\s(lucide|tabler|hugeicons|phosphor|remixicon)=(?:"[^"]*"|\{[^}]*\})/g, "").trim()
    const name = lucide?.[1] ? `"${ICON_NAMES[lucide[1]] ?? kebab(lucide[1])}"` : `{${lucide?.[2] ?? '"dot"'}}`
    return `<Icon name=${name}${rest ? " " + rest : ""} />`
  })
  if (!used) return code.replace(/import \{ IconPlaceholder \} from "[^"]+"\n/, "")
  return out.replace(/import \{ IconPlaceholder \} from "[^"]+"/, 'import { Icon } from "../icons/icon"')
}

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
  code = replaceIcons(code)
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

#!/usr/bin/env node
/**
 * Checks the docs (R19.6):
 *
 * 1. Every Onu component file has a docs page.
 *    Component files: packages/onu/src/components/<group>/<name>.tsx (and the subpath entries).
 *    Docs pages: docs/<docs folder>/<name>.md. The page may live in any group folder
 *    (e.g. a component exported from the media entry documented under Text inputs).
 *
 * 2. Every reference page (any page in a docs folder except docs/guides) has
 *    - an API table: a "Props" heading (`## Props`, `## Toaster props`, `### Props`)
 *      followed by a table. Pages whose front matter sets `reference: hook`,
 *      `function` or `extension` may use an "Options", "Parameters",
 *      "Arguments", "Returns", "Returned …" or "API" heading instead;
 *    - an accessibility section: a level-2 heading containing "accessibility".
 *
 *    A page where a section truly does not apply opts out in its front matter
 *    with a reason, e.g. `no-props: "Renders nothing; see …"` or
 *    `no-accessibility: "Pure data helper with no UI"`. An opt-out without a
 *    reason fails the check.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const groups = {
  a11y: "accessibility",
  "components/form": "form-scaffolding",
  "components/inputs": "text-inputs",
  "components/date": "date-and-time",
  "components/choice": "choice-inputs",
  "components/files": "files-and-media",
  "components/listing": "listing-pages",
  "components/overlays": "overlays",
  "components/loading": "loading",
  "components/layout": "layout-and-navigation",
  "components/display": "display-and-feedback",
  editor: "rich-content",
  maps: "maps",
  charts: "charts",
  calendar: "date-and-time",
  media: "files-and-media",
}
/** Docs folders that hold guides rather than reference pages. */
const NOT_REFERENCE = new Set(["guides"])
const REFERENCE_KINDS = new Set(["component", "hook", "function", "extension"])

const docsDirs = readdirSync(path.join(root, "docs"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
const hasPage = (name) => docsDirs.some((d) => existsSync(path.join(root, "docs", d, `${name}.md`)))

const problems = []

// 1. A page per component file.
for (const [src, docs] of Object.entries(groups)) {
  const dir = path.join(root, "packages/onu/src", src)
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".tsx") || file.endsWith(".test.tsx") || file.startsWith("_")) continue
    const name = file.replace(/\.tsx$/, "")
    if (!hasPage(name)) problems.push(`docs/${docs}/${name}.md: missing (for src/${src}/${file})`)
  }
}

// 2. Sections on every reference page.
/** Flat `key: value` front matter; enough for the keys this check reads. */
function frontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
  const data = {}
  if (!match) return data
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line)
    if (kv)
      data[kv[1]] = kv[2]
        .replace(/\s+#.*$/, "")
        .replace(/^(["'])(.*)\1$/, "$2")
        .trim()
  }
  return data
}

/** Headings outside code fences, with the lines that follow each until the next heading of the same or a higher level. */
function sections(source) {
  const lines = source.split(/\r?\n/)
  const headings = []
  let fence = false
  lines.forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    if (fence) return
    const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
    if (m) headings.push({ level: m[1].length, text: m[2], index })
  })
  return headings.map((h, i) => {
    const next = headings.slice(i + 1).find((n) => n.level <= h.level)
    return { ...h, body: lines.slice(h.index + 1, next ? next.index : lines.length) }
  })
}

const hasTable = (body) =>
  body.some((line) => /^\s*\|.*\|\s*$/.test(line)) && body.some((l) => /^\s*\|[\s:|-]+\|\s*$/.test(l))
const PROPS = /(^|\s)props$/i
const API = /^(options|parameters|arguments|returns|returned\b.*|api|signature)$/i

for (const dir of docsDirs) {
  if (NOT_REFERENCE.has(dir)) continue
  for (const file of readdirSync(path.join(root, "docs", dir))) {
    if (!file.endsWith(".md")) continue
    const rel = `docs/${dir}/${file}`
    const source = readFileSync(path.join(root, "docs", dir, file), "utf8")
    const meta = frontMatter(source)
    const kind = meta.reference ?? "component"
    if (!REFERENCE_KINDS.has(kind)) {
      problems.push(`${rel}: unknown "reference: ${kind}" (use ${[...REFERENCE_KINDS].join(", ")})`)
      continue
    }
    const all = sections(source).map((s) => ({ ...s, text: s.text.replace(/[`*_]/g, "") }))

    for (const key of ["no-props", "no-accessibility"]) {
      if (key in meta && !meta[key]) problems.push(`${rel}: "${key}" needs a reason`)
    }

    if (!meta["no-props"]) {
      const accepted = all.filter(
        (s) => s.level <= 3 && (PROPS.test(s.text) || (kind !== "component" && API.test(s.text))),
      )
      if (!accepted.length) {
        problems.push(
          kind === "component"
            ? `${rel}: no "## Props" section (hooks and helpers: set "reference: hook" or "function" and use "## Options" / "## Returns")`
            : `${rel}: no "## Props", "## Options", "## Parameters", "## Returns" or "## API" section`,
        )
      } else if (!accepted.some((s) => hasTable(s.body))) {
        problems.push(`${rel}: the "${accepted[0].text}" section has no table`)
      }
    }

    if (!meta["no-accessibility"] && !all.some((s) => s.level === 2 && /accessibility/i.test(s.text))) {
      problems.push(`${rel}: no "## Accessibility" section`)
    }
  }
}

if (problems.length) {
  console.error(`Docs check failed:\n  ${problems.join("\n  ")}`)
  process.exit(1)
}
console.log("Docs OK")

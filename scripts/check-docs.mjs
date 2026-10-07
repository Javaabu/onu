#!/usr/bin/env node
/**
 * Every Onu component file must have a docs page (R19.6).
 * Component files: packages/onu/src/components/<group>/<name>.tsx (and the subpath entries).
 * Docs pages: docs/<docs folder>/<name>.md. The page may live in any group folder
 * (e.g. a component exported from the media entry documented under Text inputs).
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const groups = {
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

const docsDirs = readdirSync(path.join(root, "docs"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
const hasPage = (name) => docsDirs.some((d) => existsSync(path.join(root, "docs", d, `${name}.md`)))

const missing = []
for (const [src, docs] of Object.entries(groups)) {
  const dir = path.join(root, "packages/onu/src", src)
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".tsx") || file.endsWith(".test.tsx") || file.startsWith("_")) continue
    const name = file.replace(/\.tsx$/, "")
    if (!existsSync(path.join(root, "docs", docs, `${name}.md`)))
      missing.push(`docs/${docs}/${name}.md (for src/${src}/${file})`)
  }
}
if (missing.length) {
  console.error(`Missing docs pages:\n  ${missing.join("\n  ")}`)
  process.exit(1)
}
console.log("Docs OK")

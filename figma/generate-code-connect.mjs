#!/usr/bin/env node
/**
 * Generates Figma Code Connect files (R3.15) from figma/components.json.
 *
 * 1. In the Onu Figma library, copy each component's link ("Copy link to selection")
 *    into its `figmaUrl` in figma/components.json.
 * 2. node figma/generate-code-connect.mjs
 * 3. npx figma connect publish --token $FIGMA_TOKEN
 *
 * Only components with a `figmaUrl` get a file. Generated files map the component
 * to its import and a usage snippet; refine props mappings by hand afterwards
 * (files are not overwritten once they exist, so edits are kept).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname)
const components = JSON.parse(readFileSync(path.join(root, "components.json"), "utf8"))
const outDir = path.join(root, "code-connect")
mkdirSync(outDir, { recursive: true })

let written = 0
let pending = 0
for (const [key, entry] of Object.entries(components)) {
  if (!entry.component) continue
  if (!entry.figmaUrl) {
    pending++
    continue
  }
  const file = path.join(outDir, `${key.replace("/", "--")}.figma.tsx`)
  if (existsSync(file)) continue
  writeFileSync(
    file,
    `import figma from "@figma/code-connect"
import { ${entry.component} } from "${entry.import}"

// ${entry.title}: map Figma properties to props here (variant, size, state, …).
figma.connect(${entry.component}, ${JSON.stringify(entry.figmaUrl)}, {
  example: () => <${entry.component} />,
})
`,
  )
  written++
}
console.log(
  `Wrote ${written} Code Connect file(s); ${pending} component(s) still need a figmaUrl in figma/components.json.`,
)

#!/usr/bin/env node
/**
 * Pushes tokens.json to Figma Variables (REQUIREMENTS R3.12).
 *
 *   FIGMA_TOKEN=… FIGMA_FILE_KEY=… node figma/sync-variables.mjs [--dry-run]
 *
 * Creates (or updates) three collections in the Onu Figma library:
 *   - "Onu / Color"   with modes Light and Dark (brand/primary, its derived steps, semantic/*)
 *   - "Onu / Density" with modes Default, Compact, Comfortable, Touch (spacing unit and steps)
 *   - "Onu / Shape"   radius, label width, touch target
 * The collections come from figma/shared/tokens.mjs, which the "Onu kit" Figma
 * plugin (figma/plugin) uses too, so both create the same variables.
 * Needs a Figma plan with the Variables REST API (Enterprise) and a token with
 * file_variables:read + file_variables:write. Without it, import
 * figma/tokens-studio.json with the Tokens Studio plugin instead (same data).
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { buildCollections } from "./shared/tokens.mjs"

export { oklchToRgba } from "./shared/tokens.mjs"

const root = path.resolve(import.meta.dirname, "..")
const tokens = JSON.parse(readFileSync(path.join(root, "tokens.json"), "utf8"))
const dryRun = process.argv.includes("--dry-run")

/** REST payload for POST /v1/files/:key/variables from the shared collection specs. */
function buildPayload() {
  const variableCollections = []
  const variableModes = []
  const variables = []
  const variableModeValues = []
  const slug = (name) => name.replace(/^Onu \/ /, "").toLowerCase()

  for (const collection of buildCollections(tokens)) {
    const id = slug(collection.name)
    variableCollections.push({
      action: "CREATE",
      id,
      name: collection.name,
      initialModeId: `${id}-${collection.modes[0]}`,
    })
    collection.modes.forEach((mode, i) => {
      variableModes.push({
        action: i === 0 ? "UPDATE" : "CREATE",
        id: `${id}-${mode}`,
        name: mode,
        variableCollectionId: id,
      })
    })
    for (const v of collection.variables) {
      const variableId = `${id}:${v.name}`
      variables.push({
        action: "CREATE",
        id: variableId,
        name: v.name,
        variableCollectionId: id,
        resolvedType: v.type,
        codeSyntax: v.codeSyntax,
        ...(v.description ? { description: v.description } : {}),
      })
      for (const [mode, value] of Object.entries(v.values))
        variableModeValues.push({ variableId, modeId: `${id}-${mode}`, value })
    }
  }
  return { variableCollections, variableModes, variables, variableModeValues }
}

/** Tokens Studio (plugin) format: one set per mode. */
function buildTokensStudio() {
  const color = (group) =>
    Object.fromEntries(Object.entries(group).map(([k, t]) => [k, { value: t.$value, type: "color" }]))
  return {
    brand: { primary: { value: tokens.brand.primary.$value, type: "color" } },
    light: color(tokens.color.light),
    dark: color(tokens.color.dark),
    shape: {
      radius: { value: tokens.radius.base.$value, type: "borderRadius" },
      ...Object.fromEntries(Object.entries(tokens.size).map(([k, t]) => [k, { value: t.$value, type: "sizing" }])),
    },
    density: Object.fromEntries(
      Object.entries(tokens.density).map(([k, t]) => [k, { value: t.$value, type: "spacing" }]),
    ),
    font: Object.fromEntries(
      Object.entries(tokens.font).map(([k, t]) => [k, { value: t.$value.join(", "), type: "fontFamilies" }]),
    ),
    $metadata: { tokenSetOrder: ["brand", "light", "dark", "shape", "density", "font"] },
  }
}

const payload = buildPayload()
writeFileSync(path.join(root, "figma/tokens-studio.json"), `${JSON.stringify(buildTokensStudio(), null, 2)}\n`)

if (dryRun || !process.env.FIGMA_TOKEN || !process.env.FIGMA_FILE_KEY) {
  console.log(`${payload.variables.length} variables in ${payload.variableCollections.length} collections (dry run).`)
  console.log("Wrote figma/tokens-studio.json. Set FIGMA_TOKEN and FIGMA_FILE_KEY to push to Figma.")
} else {
  const res = await fetch(`https://api.figma.com/v1/files/${process.env.FIGMA_FILE_KEY}/variables`, {
    method: "POST",
    headers: { "X-Figma-Token": process.env.FIGMA_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    console.error(`Figma API ${res.status}: ${await res.text()}`)
    process.exit(1)
  }
  console.log(`Pushed ${payload.variables.length} variables to Figma.`)
}

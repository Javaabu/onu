#!/usr/bin/env node
/**
 * Pushes tokens.json to Figma Variables (REQUIREMENTS R3.12).
 *
 *   FIGMA_TOKEN=… FIGMA_FILE_KEY=… node figma/sync-variables.mjs [--dry-run]
 *
 * Creates (or updates) three collections in the Onu Figma library:
 *   - "Onu / Color"   with modes Light and Dark (brand primary is one variable)
 *   - "Onu / Density" with modes Compact, Default, Comfortable, Touch (spacing unit)
 *   - "Onu / Shape"   radius, label width, touch target
 * Needs a Figma plan with the Variables REST API (Enterprise) and a token with
 * file_variables:read + file_variables:write. Without it, import
 * figma/tokens-studio.json with the Tokens Studio plugin instead (same data).
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const tokens = JSON.parse(readFileSync(path.join(root, "tokens.json"), "utf8"))
const dryRun = process.argv.includes("--dry-run")

/** oklch(L C H [/ A]) → Figma RGBA (0–1). */
export function oklchToRgba(value) {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)/.exec(value)
  if (!m) throw new Error(`Unsupported colour: ${value}`)
  const [L, C, H] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180]
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
  const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
  const [r, g, bl] = lin.map((x) => Math.min(1, Math.max(0, gamma(x))))
  const alpha = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1)
  return { r, g, b: bl, a: alpha }
}

const rem = (v) => Number(String(v).replace("rem", "")) * 16
const px = (v) => (String(v).endsWith("rem") ? rem(v) : Number(String(v).replace("px", "")))

function buildPayload() {
  const variableCollections = []
  const variableModes = []
  const variables = []
  const variableModeValues = []

  const addCollection = (id, name, modes) => {
    variableCollections.push({ action: "CREATE", id, name, initialModeId: `${id}-${modes[0]}` })
    modes.forEach((mode, i) => {
      if (i === 0) variableModes.push({ action: "UPDATE", id: `${id}-${mode}`, name: mode, variableCollectionId: id })
      else variableModes.push({ action: "CREATE", id: `${id}-${mode}`, name: mode, variableCollectionId: id })
    })
  }
  const addVariable = (collection, name, type, values) => {
    const id = `${collection}:${name}`
    variables.push({
      action: "CREATE",
      id,
      name,
      variableCollectionId: collection,
      resolvedType: type,
      codeSyntax: { WEB: `var(--onu-${name.split("/").pop()})` },
    })
    for (const [mode, value] of Object.entries(values))
      variableModeValues.push({ variableId: id, modeId: `${collection}-${mode}`, value })
  }

  addCollection("color", "Onu / Color", ["Light", "Dark"])
  const primary = oklchToRgba(tokens.brand.primary.$value)
  addVariable("color", "brand/primary", "COLOR", { Light: primary, Dark: primary })
  for (const name of Object.keys(tokens.color.light)) {
    addVariable("color", `semantic/${name}`, "COLOR", {
      Light: oklchToRgba(tokens.color.light[name].$value),
      Dark: oklchToRgba(tokens.color.dark[name].$value),
    })
  }

  addCollection("density", "Onu / Density", ["Default", "Compact", "Comfortable", "Touch"])
  addVariable("density", "spacing/unit", "FLOAT", {
    Default: rem(tokens.density.default.$value),
    Compact: rem(tokens.density.compact.$value),
    Comfortable: rem(tokens.density.comfortable.$value),
    Touch: rem(tokens.density.touch.$value),
  })

  addCollection("shape", "Onu / Shape", ["Default"])
  addVariable("shape", "radius/base", "FLOAT", { Default: rem(tokens.radius.base.$value) })
  for (const [name, t] of Object.entries(tokens.size))
    addVariable("shape", `size/${name}`, "FLOAT", { Default: px(t.$value) })

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

#!/usr/bin/env node
/**
 * Merges the node map the "Onu kit" Figma plugin prints into figma/components.json
 * (`figmaUrl`), ready for generate-code-connect.mjs.
 *
 *   node figma/apply-node-ids.mjs onu-kit.json            # the JSON copied from the plugin
 *   pbpaste | node figma/apply-node-ids.mjs -             # or from stdin
 *   node figma/apply-node-ids.mjs map.json --file-key KEY # plain { key: nodeId } maps need a file key
 *
 * Accepts the plugin output ({ fileKey, figmaUrls, nodeIds }) or a plain object of
 * components.json key → node id ("12:34") or Figma URL. Keys that are not in
 * components.json are reported and skipped.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

/** The Onu Figma file ("Claudius"). */
export const DEFAULT_FILE_KEY = "hilfEQCV33vZNet92CWRJp"
const FILE_NAME = "Claudius"

export const nodeUrl = (fileKey, nodeId) =>
  `https://www.figma.com/design/${fileKey}/${FILE_NAME}?node-id=${String(nodeId).replace(/:/g, "-")}`

/**
 * Returns a copy of `components` with `figmaUrl` filled from `input`, plus what changed.
 * @param {Record<string, { figmaUrl?: string | null }>} components
 * @param {Record<string, unknown>} input
 * @param {{ fileKey?: string }} [options]
 */
export function applyNodeIds(components, input, options = {}) {
  const fileKey = options.fileKey || (typeof input.fileKey === "string" && input.fileKey) || DEFAULT_FILE_KEY
  /** @type {Record<string, unknown>} */
  const map =
    input.figmaUrls && typeof input.figmaUrls === "object"
      ? input.figmaUrls
      : input.nodeIds && typeof input.nodeIds === "object"
        ? input.nodeIds
        : Object.fromEntries(Object.entries(input).filter(([k]) => k.includes("/")))
  const result = structuredClone(components)
  const updated = []
  const unchanged = []
  const unknown = []
  for (const [key, value] of Object.entries(map)) {
    if (typeof value !== "string" || !value) continue
    if (!result[key]) {
      unknown.push(key)
      continue
    }
    const url = value.startsWith("https://") ? value : /^\d+[:-]\d+$/.test(value) ? nodeUrl(fileKey, value) : null
    if (!url) throw new Error(`${key}: not a node id or Figma URL: ${value}`)
    if (result[key].figmaUrl === url) unchanged.push(key)
    else {
      result[key].figmaUrl = url
      updated.push(key)
    }
  }
  return { components: result, updated, unchanged, unknown }
}

async function main() {
  const args = process.argv.slice(2)
  const keyIndex = args.indexOf("--file-key")
  const fileKey = keyIndex >= 0 ? args[keyIndex + 1] : process.env.FIGMA_FILE_KEY
  const source = args.find((a, i) => !a.startsWith("--") && i !== keyIndex + 1)
  if (!source) {
    console.error("Usage: node figma/apply-node-ids.mjs <plugin-output.json | -> [--file-key KEY]")
    process.exit(1)
  }
  const text = source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8")
  const file = path.join(import.meta.dirname, "components.json")
  const components = JSON.parse(readFileSync(file, "utf8"))
  const { components: next, updated, unchanged, unknown } = applyNodeIds(components, JSON.parse(text), { fileKey })
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`Updated ${updated.length} figmaUrl(s), ${unchanged.length} unchanged.`)
  if (unknown.length) console.log(`Not in components.json (skipped): ${unknown.join(", ")}`)
  console.log("Next: node figma/generate-code-connect.mjs")
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()

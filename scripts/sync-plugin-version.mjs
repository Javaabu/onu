#!/usr/bin/env node
/**
 * Copies the @javaabu/onu version into the Claude Code plugin manifest, which is
 * not a workspace package, so changesets never bump it.
 *
 *   node scripts/sync-plugin-version.mjs           # write it
 *   node scripts/sync-plugin-version.mjs --check   # fail if it differs (release workflow)
 */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const manifestPath = resolve(root, "plugins/onu/.claude-plugin/plugin.json")
const { version } = JSON.parse(readFileSync(resolve(root, "packages/onu/package.json"), "utf8"))
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))

if (manifest.version === version) {
  console.log(`plugin.json is at ${version}`)
} else if (process.argv.includes("--check")) {
  console.error(
    `plugin.json is at ${manifest.version}, but @javaabu/onu is at ${version}. Run node scripts/sync-plugin-version.mjs.`,
  )
  process.exit(1)
} else {
  manifest.version = version
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`plugin.json is now at ${version}`)
}

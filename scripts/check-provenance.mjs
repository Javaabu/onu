#!/usr/bin/env node
// Fails unless every published package version has an npm provenance attestation.
// pnpm only warns when the OIDC exchange fails, so a successful publish doesn't prove one.
//
//   node scripts/check-provenance.mjs <version> [package…]
//
// Packages default to the ones in packages/*.
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

const ATTEMPTS = 6
const WAIT_MS = 20_000 // A new version takes a moment to reach the registry's read side.

const [version, ...named] = process.argv.slice(2)
if (!version) {
  console.error("Usage: node scripts/check-provenance.mjs <version> [package…]")
  process.exit(2)
}

const workspace = () =>
  readdirSync("packages").map((dir) => JSON.parse(readFileSync(`packages/${dir}/package.json`, "utf8")).name)

function attestationUrl(name) {
  try {
    return execFileSync("npm", ["view", `${name}@${version}`, "dist.attestations.url"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    return "" // Not on the registry yet.
  }
}

let missing = named.length ? named : workspace()
for (let attempt = 1; ; attempt++) {
  missing = missing.filter((name) => {
    const url = attestationUrl(name)
    if (url) console.log(`${name}@${version}: ${url}`)
    return !url
  })
  if (!missing.length || attempt === ATTEMPTS) break
  await sleep(WAIT_MS)
}

for (const name of missing) {
  console.error(`::error::${name}@${version} has no npm provenance attestation. See "Releasing" in CONTRIBUTING.md.`)
}
process.exit(missing.length ? 1 : 0)

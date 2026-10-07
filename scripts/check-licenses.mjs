#!/usr/bin/env node
/** Fails when a production dependency of @javaabu/onu has a disallowed licence (R4, R4.2). */
import { execFileSync } from "node:child_process"

const DISALLOWED = /\b(A?GPL|LGPL|SSPL|BUSL|Commons-Clause|CC-BY-NC|UNLICENSED|Elastic)\b/i

const out = execFileSync("pnpm", ["--filter", "@javaabu/onu", "licenses", "list", "--prod", "--json"], {
  encoding: "utf8",
})
const byLicense = JSON.parse(out)
const bad = []
for (const [license, packages] of Object.entries(byLicense)) {
  if (DISALLOWED.test(license) || license === "Unknown") {
    for (const p of packages) bad.push(`${p.name}@${p.versions?.join(",") ?? p.version}: ${license}`)
  }
}
if (bad.length) {
  console.error(`Disallowed licences:\n  ${bad.join("\n  ")}`)
  process.exit(1)
}
console.log(`Licences OK (${Object.keys(byLicense).join(", ")})`)

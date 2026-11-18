#!/usr/bin/env node
/**
 * Fails if a published package's npm tarball would ship test files (`*.test.ts`,
 * `*.spec.tsx`, `__tests__/`), which a broad `files` entry such as `src/styles`
 * picks up. Asks `pnpm pack --dry-run`, the same file list `pnpm publish` uses.
 *
 *   node scripts/check-pack.mjs
 */
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const isTest = (file) => /(^|\/)__tests__\/|\.(test|spec)\.[cm]?[jt]sx?$/.test(file)

const found = []
for (const entry of readdirSync(path.join(root, "packages"), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const dir = path.join(root, "packages", entry.name)
  const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
  if (pkg.private) continue
  const { files } = JSON.parse(execFileSync("pnpm", ["pack", "--dry-run", "--json"], { cwd: dir, encoding: "utf8" }))
  for (const { path: file } of files) if (isTest(file)) found.push(`${pkg.name}: ${file}`)
}

if (found.length) {
  console.error(`These test files would ship in the npm tarball; exclude them in "files":\n${found.join("\n")}`)
  process.exit(1)
}
console.log("No package ships test files.")

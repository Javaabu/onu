#!/usr/bin/env node
// Builds e2e/optional-peers (a Next.js app without Onu's optional peers) against a packed
// copy of @javaabu/onu, with webpack and with Turbopack. Run `pnpm build` first.
// Outside the workspace on purpose: there, every peer resolves from the monorepo.
import { execFileSync } from "node:child_process"
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const work = mkdtempSync(join(tmpdir(), "onu-optional-peers-"))
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } })

try {
  run("pnpm", ["pack", "--pack-destination", work], join(root, "packages/onu"))
  const tarball = join(
    work,
    readdirSync(work).find((f) => f.endsWith(".tgz")),
  )
  const app = join(work, "app")
  cpSync(join(root, "e2e/optional-peers"), app, { recursive: true })
  const pkgPath = join(app, "package.json")
  writeFileSync(pkgPath, readFileSync(pkgPath, "utf8").replace("ONU_TARBALL", tarball))
  // npm, not pnpm: a plain app install, outside the workspace. Optional peers are not installed.
  run("npm", ["install", "--no-audit", "--no-fund", "--legacy-peer-deps"], app)
  for (const bundler of ["--webpack", "--turbopack"]) {
    console.log(`\n▶ next build ${bundler}`)
    run("npx", ["next", "build", bundler], app)
  }
  console.log("\n✓ The app builds with webpack and Turbopack without Onu's optional peers")
} finally {
  rmSync(work, { recursive: true, force: true })
}

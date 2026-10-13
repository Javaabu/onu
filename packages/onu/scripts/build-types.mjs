#!/usr/bin/env node
/**
 * Emits the library's type declarations with TypeScript 7 (native), sized to fit a
 * 1 GB / 1 vCPU build server:
 *
 * - `--noCheck`: emit only, no type checking (`pnpm typecheck` does that). The
 *   output is identical, at about half the memory and time.
 * - One tsc run per entry point in package.json `exports`, so peak memory is that
 *   of the largest entry (~310 MB) instead of the whole library at once (~550 MB,
 *   or ~950 MB with checking). Modules shared by several entries are emitted once
 *   per run, with identical content.
 * - One thread and a more eager garbage collector.
 *
 * Prints progress, because tsc itself is silent until it finishes.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const require = createRequire(import.meta.url)
const tsc = join(dirname(require.resolve("typescript-native/package.json")), "bin", "tsc")
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))

/** `./dist/ui/index.d.ts` → `src/ui/index.ts` (or `.tsx`). */
const entries = Object.values(pkg.exports).flatMap((target) => {
  if (typeof target !== "object" || !target.types) return []
  const base = target.types.replace(/^\.\/dist\//, "src/").replace(/\.d\.ts$/, "")
  const source = [`${base}.ts`, `${base}.tsx`].find((file) => existsSync(join(root, file)))
  if (!source) throw new Error(`No source file for the "${target.types}" export`)
  return [source]
})

// Inside the package, so `types` and module resolution work as in tsconfig.build.json.
const tmp = join(root, "node_modules", ".cache", "onu-build-types")
mkdirSync(tmp, { recursive: true })
const started = Date.now()

console.log(`Generating type declarations (TypeScript 7, ${entries.length} entry points)…`)

try {
  for (const [i, entry] of entries.entries()) {
    const config = join(tmp, `tsconfig.${i}.json`)
    writeFileSync(
      config,
      JSON.stringify({
        extends: relative(tmp, join(root, "tsconfig.build.json")),
        files: [relative(tmp, join(root, entry))],
        include: [],
      }),
    )
    const entryStarted = Date.now()
    const { status, signal, error } = spawnSync(
      process.execPath,
      [tsc, "-p", config, "--noCheck", "--singleThreaded", ...process.argv.slice(2)],
      { cwd: root, stdio: "inherit", env: { GOGC: "50", ...process.env } },
    )
    if (error) throw error
    if (status !== 0) {
      if (signal === "SIGKILL") {
        console.error(`✗ tsc was killed on ${entry} (out of memory?). It needs about 350 MB of free RAM.`)
      }
      process.exitCode = status ?? 1
      break
    }
    console.log(`  ${entry.replace(/^src\//, "")} ${((Date.now() - entryStarted) / 1000).toFixed(1)}s`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (!process.exitCode) {
  console.log(`✓ type declarations in ${((Date.now() - started) / 1000).toFixed(1)}s`)
}

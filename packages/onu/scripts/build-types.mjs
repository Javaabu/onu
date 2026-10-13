#!/usr/bin/env node
/**
 * Emits the library's type declarations with TypeScript 7 (native), tuned for small
 * build servers: one checker instead of four (each keeps its own type cache) and a
 * more eager garbage collector. On a single vCPU this takes ~10s and ~0.9 GB instead
 * of ~50s and ~1.5 GB, and it never touches Node's heap limit.
 *
 * Prints progress, because tsc itself is silent until it finishes.
 */
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const tsc = join(dirname(require.resolve("typescript-native/package.json")), "bin", "tsc")
const started = Date.now()

console.log("Generating type declarations (TypeScript 7)…")

const child = spawn(
  process.execPath,
  [tsc, "-p", "tsconfig.build.json", "--singleThreaded", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { GOGC: "50", ...process.env },
  },
)

child.on("exit", (code, signal) => {
  if (code === 0) {
    console.log(`✓ type declarations in ${((Date.now() - started) / 1000).toFixed(1)}s`)
    process.exit(0)
  }
  if (signal === "SIGKILL") {
    console.error("✗ tsc was killed (out of memory?). It needs about 1 GB of free RAM; add swap or build elsewhere.")
  }
  process.exit(code ?? 1)
})

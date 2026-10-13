#!/usr/bin/env node
/**
 * `vite build`, with Rolldown's allocator (mimalloc) set to commit memory as it is
 * used and return freed pages at once, instead of committing whole arenas up front.
 * On one vCPU that cuts the peak by about a third (~450 MB), with identical output.
 * mimalloc reads these when Rolldown loads, so they must be set before Vite starts.
 */
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"

const require = createRequire(import.meta.url)
const vite = join(dirname(require.resolve("vite/package.json")), "bin", "vite.js")
const argv = [process.execPath, vite, "build", ...process.argv.slice(2)]
const env = { MIMALLOC_ARENA_EAGER_COMMIT: "0", MIMALLOC_PURGE_DELAY: "0", ...process.env }

// Node 22.15+ (not Windows): become Vite instead of waiting on it, so this process
// holds no memory during the build.
try {
  process.execve?.(process.execPath, argv, env)
} catch {
  // Fall back to a child process.
}

const { status, error } = spawnSync(process.execPath, argv.slice(1), { stdio: "inherit", env })
if (error) throw error
process.exit(status ?? 1)

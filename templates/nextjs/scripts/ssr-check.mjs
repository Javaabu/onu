// Server-rendering check (R16.1): starts the production build with `next start`
// and asserts that the HTML of `/` already contains Onu's markup, in English
// (LTR) and in Dhivehi (RTL), before any JavaScript runs.
//
//   pnpm build && pnpm test:ssr
//
// Set PORT to choose the port (default: a free one).

import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import { createServer } from "node:net"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

if (!existsSync(join(root, ".next", "BUILD_ID"))) {
  console.error("No production build found. Run `pnpm build` first.")
  process.exit(1)
}

const port = Number(process.env.PORT) || (await freePort())
const base = `http://127.0.0.1:${port}`
const nextBin = createRequire(join(root, "package.json")).resolve("next/dist/bin/next")

const server = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: root,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "inherit", "inherit"],
})

const checks = [
  {
    name: "English (LTR)",
    headers: {},
    expect: [
      '<html lang="en" dir="ltr"',
      'data-slot="page-title"',
      'data-slot="callout"',
      'data-slot="card"',
      'data-slot="status-badge"',
      'data-slot="form"',
      'data-slot="form-field"',
      'data-slot="language-switcher"',
      ">Applications</h1>",
      "Welcome to Onu",
    ],
  },
  {
    name: "Dhivehi (RTL)",
    headers: { cookie: "locale=dv" },
    expect: ['<html lang="dv" dir="rtl"', 'data-slot="page-title"', ">އެޕްލިކޭޝަންތައް</h1>", "އޮނަށް މަރުޙަބާ"],
  },
]

let failed = 0
try {
  await waitForServer()
  for (const check of checks) {
    const response = await fetch(`${base}/`, { headers: check.headers })
    const html = await response.text()
    const missing = check.expect.filter((needle) => !html.includes(needle))
    if (response.status !== 200) missing.unshift(`HTTP 200 (got ${response.status})`)
    if (missing.length) {
      failed++
      console.error(`✗ ${check.name}: the server-rendered HTML is missing:\n  - ${missing.join("\n  - ")}`)
    } else {
      console.log(`✓ ${check.name}: ${check.expect.length} expectations met in the server-rendered HTML`)
    }
  }
} catch (error) {
  failed++
  console.error(error)
} finally {
  server.kill()
}

process.exit(failed ? 1 : 0)

async function waitForServer(timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (server.exitCode !== null) throw new Error(`next start exited with code ${server.exitCode}`)
    try {
      await fetch(base, { method: "HEAD" })
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  throw new Error(`next start did not answer on ${base} within ${timeoutMs / 1000}s`)
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.unref()
    probe.on("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })
}

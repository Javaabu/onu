// Server-rendering check (R16.1), in English (LTR) and Dhivehi (RTL), against the production build:
// the HTML has Onu's markup before any JavaScript runs, and the page hydrates in a browser without errors.
// `/hydration` checks that what only the browser knows (stored theme, page URL, screen width) applies once hydrated.
//
//   pnpm build && pnpm --filter onu-nextjs-fixture build && pnpm --filter onu-nextjs-fixture test:ssr
//
// Set CHROMIUM_PATH to use your own Chromium instead of Playwright's.

import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { createServer } from "node:net"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "@playwright/test"

/* global document, location -- the page checks below run in the browser */

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const port = await freePort()
const base = `http://127.0.0.1:${port}`
const nextBin = createRequire(join(root, "package.json")).resolve("next/dist/bin/next")

const markup = [
  'data-slot="page-title"',
  'data-slot="callout"',
  'data-slot="card"',
  'data-slot="status-badge"',
  'data-slot="form"',
  'data-slot="form-field"',
  // Pure helpers called from Server Components: `cn` merged the padding, `themeScript` is in <head>,
  // and `transliterate` and `toCsv` ran.
  '<main class="p-6 server-cn"',
  'localStorage.getItem("onu-theme")',
  "ދިވެހި|Name",
]

const checks = [
  {
    name: "English (LTR)",
    locale: "en",
    expect: ['<html lang="en" dir="ltr"', ...markup, "Show password"],
  },
  {
    name: "Dhivehi (RTL)",
    locale: "dv",
    // Onu's own translation, so this fails if the locale doesn't reach the server render.
    expect: ['<html lang="dv" dir="rtl"', ...markup, "ޕާސްވޯޑް ދައްކާ"],
  },
]

const server = spawn(process.execPath, [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"], {
  cwd: root,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "inherit", "inherit"],
})

let failed = 0
let browser
try {
  await waitForServer()
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  for (const check of checks) {
    const problems = [
      ...(await checkHtml(check)),
      ...(await checkHydration(check)),
      ...(await checkBrowserOnlyState(check)),
    ]
    if (problems.length) {
      failed++
      console.error(`✗ ${check.name}:\n  - ${problems.join("\n  - ")}`)
    } else {
      console.log(
        `✓ ${check.name}: server HTML has ${check.expect.length} expected strings, hydration is clean, and the stored theme, page URL and phone width apply after hydration`,
      )
    }
  }
} catch (error) {
  failed++
  console.error(error)
} finally {
  await browser?.close()
  server.kill()
}

process.exit(failed ? 1 : 0)

async function checkHtml({ locale, expect }) {
  const response = await fetch(`${base}/`, { headers: { cookie: `locale=${locale}` } })
  const html = await response.text()
  const problems = expect.filter((needle) => !html.includes(needle)).map((needle) => `HTML is missing: ${needle}`)
  if (response.status !== 200) problems.unshift(`HTTP ${response.status}`)
  return problems
}

/** React reports hydration mismatches as uncaught errors or console errors, even in production. */
async function checkHydration({ locale }) {
  const context = await browser.newContext({ baseURL: base })
  await context.addCookies([{ name: "locale", value: locale, url: base }])
  const page = await context.newPage()
  const problems = []
  page.on("pageerror", (error) => problems.push(`Page error: ${error.message}`))
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`Console error: ${message.text()}`)
  })
  await page.goto("/", { waitUntil: "networkidle" })

  // An interaction only works once the page has hydrated.
  const field = page.locator('[data-slot="form-field"]').nth(1)
  const input = field.locator("input")
  const before = await input.getAttribute("type")
  await field.getByRole("button").click()
  if ((await input.getAttribute("type")) === before)
    problems.push("The password toggle did nothing, so the page didn't hydrate")

  await context.close()
  return problems
}

/**
 * `/hydration` at phone width, with a dark theme stored before the page loads. The server can't
 * know any of these, so each component must catch up once hydrated (hydration doesn't patch
 * attributes, so reading the browser during the hydrating render leaves stale markup).
 */
async function checkBrowserOnlyState({ locale }) {
  const context = await browser.newContext({ baseURL: base, viewport: { width: 375, height: 812 } })
  await context.addCookies([{ name: "locale", value: locale, url: base }])
  await context.addInitScript(() => localStorage.setItem("onu-theme", "dark"))
  const page = await context.newPage()
  const problems = []
  page.on("pageerror", (error) => problems.push(`Page error: ${error.message}`))
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`Console error: ${message.text()}`)
  })
  await page.goto("/hydration", { waitUntil: "networkidle" })

  const expectations = [
    ["The stored dark theme isn't applied to <html>", () => document.documentElement.classList.contains("dark")],
    [
      "ThemeToggle doesn't select the stored theme (Dark)",
      () => document.querySelectorAll('[data-slot="theme-toggle"] [role="radio"]')[1]?.ariaChecked === "true",
    ],
    [
      "ShareButtons' link doesn't carry the page's URL",
      () =>
        document.querySelector('[data-network="facebook"]')?.getAttribute("href") ===
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`,
    ],
    [
      "FullCalendar didn't switch to the agenda at phone width",
      () => document.querySelector('[data-slot="full-calendar"]')?.getAttribute("data-view") === "agenda",
    ],
  ]
  for (const [problem, holds] of expectations) {
    await page.waitForFunction(holds, null, { timeout: 5_000 }).catch(() => problems.push(problem))
  }

  await context.close()
  return problems
}

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

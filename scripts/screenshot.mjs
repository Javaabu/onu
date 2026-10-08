#!/usr/bin/env node
/**
 * Screenshot a page of the examples app (dev helper).
 *
 *   node scripts/screenshot.mjs <url> <out.png> '{"dark":true,"locale":"dv","dir":"rtl","w":390,"h":844,"full":true,"primary":"oklch(0.55 0.2 260)"}'
 *
 * Start the app first: pnpm build:examples && pnpm --filter onu-examples preview --port 4173
 */
import { existsSync } from "node:fs"
import { chromium } from "@playwright/test"

const [url, out, raw] = process.argv.slice(2)
if (!url || !out) {
  console.error("Usage: node scripts/screenshot.mjs <url> <out.png> [json options]")
  process.exit(1)
}
const o = JSON.parse(raw ?? "{}")
const executablePath =
  process.env.CHROMIUM_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined)
const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({
  viewport: { width: o.w ?? 1280, height: o.h ?? 800 },
  hasTouch: !!o.touch,
  isMobile: !!o.touch,
})
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message))
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE ERROR:", m.text()))
const settings = {
  locale: o.locale ?? "en",
  dir: o.dir ?? "auto",
  density: o.density ?? "default",
  labelLayout: o.labelLayout ?? "stacked",
  ...(o.primary ? { primary: o.primary } : {}),
}
await page.addInitScript(
  ([s, theme]) => {
    localStorage.setItem("onu-showcase-settings", s)
    localStorage.setItem("onu-theme", theme)
  },
  [JSON.stringify(settings), o.dark ? "dark" : "light"],
)
await page.goto(url, { waitUntil: "networkidle" })
await page.waitForTimeout(o.wait ?? 300)
if (o.click) await page.click(o.click)
if (o.click) await page.waitForTimeout(300)
await page.screenshot({ path: out, fullPage: !!o.full })
await browser.close()
console.log(`Saved ${out}`)

import { test as base, type Page } from "@playwright/test"

import type { Variant } from "./routes"

/** Applies the examples app's theme/locale settings before the page loads. */
export async function applyVariant(page: Page, variant: Variant) {
  await page.addInitScript(
    ([settings, theme]) => {
      localStorage.setItem("onu-showcase-settings", settings)
      localStorage.setItem("onu-theme", theme)
    },
    [
      JSON.stringify({ locale: variant.locale, dir: "auto", density: "default", labelLayout: "stacked" }),
      variant.dark ? "dark" : "light",
    ] as const,
  )
}

/** Positions and sizes of the chart parts that depend on fonts and container width. */
function chartLayout(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".recharts-surface, .recharts-text, .recharts-legend-wrapper")]
      .map((el) => {
        const r = el.getBoundingClientRect()
        return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`
      })
      .join(";"),
  )
}

/**
 * Opens a route for a screenshot with every web font already loaded. Recharts
 * measures text (axis widths, tick spacing, legends) when a chart first renders
 * and caches the sizes, so a chart drawn before Inter or the Thaana font arrives
 * keeps fallback-font measurements and its layout differs between runs. This
 * loads the app shell in a fresh document, loads all declared font faces, then
 * moves to the route in the same document so charts render with the real fonts.
 */
export async function openWithFonts(page: Page, route: string) {
  await page.goto("about:blank")
  await page.goto("/#/")
  await page.waitForLoadState("networkidle")
  await page.evaluate(async () => {
    await Promise.all([...document.fonts].map((face) => face.load().catch(() => undefined)))
    await document.fonts.ready
  })
  await page.goto(route)
  await page.waitForLoadState("networkidle")
}

/** Waits until chart layout (container sizes, axis text, legends) stops changing. */
export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  if (!(await page.locator(".recharts-wrapper").count())) return
  // Under load ResponsiveContainer can draw at the final size while its wrapper still has the
  // initial dimension, so the SVG is shown scaled down. Wait until every chart is drawn 1:1.
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll<SVGSVGElement>(".recharts-surface")].every((svg) => {
        const r = svg.getBoundingClientRect()
        const w = Number(svg.getAttribute("width"))
        const h = Number(svg.getAttribute("height"))
        return !w || !h || (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1)
      }),
    undefined,
    { timeout: 15_000 },
  )
  let previous = ""
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100)
    const current = await chartLayout(page)
    if (current === previous) break
    previous = current
  }
}

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    await use(errors)
  },
})

export { expect } from "@playwright/test"

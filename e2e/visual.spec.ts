import { applyVariant, expect, openWithFonts, settle, test } from "./fixtures"
import { demoRoutes, pageRoutes, variants } from "./routes"

// Visual regression at phone, tablet and desktop widths, light LTR and dark RTL (R17.3).
// Emulate prefers-reduced-motion so JavaScript animations (Recharts series, carousels)
// render their final state at once: Onu charts pass isAnimationActive={false} under it,
// and `animations: "disabled"` only stops CSS animations.
test.use({ reducedMotion: "reduce" })

const widths = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
]

for (const route of [...demoRoutes, ...pageRoutes]) {
  for (const variant of variants) {
    test(`visual ${variant.name} ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium", "baselines are kept for Chromium")
      // Three fresh loads, each waiting for fonts and chart layout.
      test.setTimeout(120_000)
      await applyVariant(page, variant)
      for (const size of widths) {
        await page.setViewportSize({ width: size.width, height: size.height })
        // A fresh document per width (going to the same hash route would only resize the
        // running app), with fonts loaded before any chart measures its text.
        await openWithFonts(page, route)
        await settle(page)
        const name = `${route.replace(/[^a-z0-9]+/gi, "-")}-${variant.name}-${size.name}.png`
        if (await page.locator(".recharts-wrapper").count()) {
          // `fullPage` resizes the viewport during the capture, and charts re-render then and
          // are caught mid-layout. On chart pages grow the viewport first and let them settle.
          const height = await page.evaluate(() => document.documentElement.scrollHeight)
          await page.setViewportSize({ width: size.width, height: Math.max(size.height, height) })
          await settle(page)
          await expect(page).toHaveScreenshot(name)
        } else {
          await expect(page).toHaveScreenshot(name, { fullPage: true })
        }
      }
    })
  }
}

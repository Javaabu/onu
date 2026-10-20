import { applyVariant, expect, openWithFonts, settle, test } from "./fixtures"
import { demoRoutes, variants } from "./routes"

// Visual regression for every component demo at desktop width, light LTR and dark RTL
// (R17.3): one screenshot each, compared with the baselines CI keeps as an artifact
// (see .github/workflows/e2e.yml). Sample pages are covered by the a11y spec only.
// Emulate prefers-reduced-motion so JavaScript animations (Recharts series, carousels)
// render their final state at once: Onu charts pass isAnimationActive={false} under it,
// and `animations: "disabled"` only stops CSS animations.
test.use({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })

for (const route of demoRoutes) {
  for (const variant of variants) {
    test(`visual ${variant.name} ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium", "baselines are kept for Chromium")
      await applyVariant(page, variant)
      // Fonts load before any chart measures its text.
      await openWithFonts(page, route)
      await settle(page)
      const name = `${route.replace(/[^a-z0-9]+/gi, "-")}-${variant.name}.png`
      if (await page.locator(".recharts-wrapper").count()) {
        // `fullPage` resizes the viewport during the capture, and charts re-render then and
        // are caught mid-layout. On chart pages grow the viewport first and let them settle.
        const height = await page.evaluate(() => document.documentElement.scrollHeight)
        await page.setViewportSize({ width: 1280, height: Math.max(800, height) })
        await settle(page)
        await expect(page).toHaveScreenshot(name)
      } else {
        await expect(page).toHaveScreenshot(name, { fullPage: true })
      }
    })
  }
}

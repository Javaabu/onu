import { applyVariant, expect, test } from "./fixtures"
import { demoRoutes, pageRoutes, variants } from "./routes"

// Visual regression at phone, tablet and desktop widths, light LTR and dark RTL (R17.3).
const widths = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
]

for (const route of [...demoRoutes, ...pageRoutes]) {
  for (const variant of variants) {
    test(`visual ${variant.name} ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium", "baselines are kept for Chromium")
      await applyVariant(page, variant)
      for (const size of widths) {
        await page.setViewportSize({ width: size.width, height: size.height })
        await page.goto(route)
        await page.waitForLoadState("networkidle")
        const name = `${route.replace(/[^a-z0-9]+/gi, "-")}-${variant.name}-${size.name}.png`
        await expect(page).toHaveScreenshot(name, { fullPage: true })
      }
    })
  }
}

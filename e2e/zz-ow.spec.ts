import { test } from "@playwright/test"
import { applyVariant } from "./fixtures"
for (const r of ["/#/components/choice-inputs/radio-group"])
  test(r, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await applyVariant(page, { name: "x", locale: "dv", dark: false })
    await page.goto(r)
    await page.waitForLoadState("networkidle")
    console.log("OW", r, await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]))
  })

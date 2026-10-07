import AxeBuilder from "@axe-core/playwright"

import { applyVariant, expect, test } from "./fixtures"
import { demoRoutes, pageRoutes, variants } from "./routes"

// Accessibility scan of every demo and sample page (REQUIREMENTS R14.11), in light LTR and dark RTL.
for (const variant of variants) {
  for (const route of [...demoRoutes, ...pageRoutes]) {
    test(`a11y ${variant.name} ${route}`, async ({ page, pageErrors }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium" && testInfo.project.name !== "mobile-chrome",
        "axe runs on Chromium",
      )
      await applyVariant(page, variant)
      await page.goto(route)
      await page.waitForLoadState("networkidle")
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // The showcase's code tab and third-party map tiles are out of scope.
        .exclude("[data-axe-skip]")
        .analyze()
      expect(pageErrors, "page errors").toEqual([])
      expect(
        results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
        "axe violations",
      ).toEqual([])
    })
  }
}

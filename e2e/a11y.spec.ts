import AxeBuilder from "@axe-core/playwright"

import { applyVariant, expect, test, waitForPage } from "./fixtures"
import { demoRoutes, pageRoutes, variants } from "./routes"

// Accessibility scan of the docs home and indexes, every demo and every sample page (REQUIREMENTS R14.11), in light LTR and dark RTL.
for (const variant of variants) {
  for (const route of ["/#/", "/#/components", "/#/pages", ...demoRoutes, ...pageRoutes]) {
    test(`a11y ${variant.name} ${route}`, async ({ page, pageErrors }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium" && testInfo.project.name !== "mobile-chrome",
        "axe runs on Chromium",
      )
      await applyVariant(page, variant)
      await page.goto(route)
      await waitForPage(page, route)
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // The showcase's code tab and third-party map tiles are out of scope.
        .exclude("[data-axe-skip]")
        // media-chrome sets aria-checked on its role="button" captions toggle (upstream issue).
        .exclude("media-captions-button")
        .analyze()
      // WCAG 1.4.3 exempts inactive (disabled) components from contrast; axe can't tell.
      const violations = []
      for (const v of results.violations) {
        // WCAG 2.5.8 "equivalent" exception: every map lists its markers as a keyboard-operable list.
        if (v.id === "target-size") {
          const nodes = v.nodes.filter((n) => !n.html.includes('data-slot="map-marker"'))
          if (nodes.length) violations.push({ ...v, nodes })
          continue
        }
        if (v.id !== "color-contrast") {
          violations.push(v)
          continue
        }
        const nodes = []
        for (const node of v.nodes) {
          const disabled = await page
            .locator(node.target.join(" "))
            .first()
            .evaluate(
              (el) =>
                !!el.closest(
                  [
                    "[disabled]",
                    "[aria-disabled=true]",
                    "[data-disabled]:not([data-disabled=false])",
                    "fieldset:disabled",
                    "[data-inactive]",
                    ":has(> input:disabled)",
                    ":has(> select:disabled)",
                    ":has(> textarea:disabled)",
                    "[data-slot=input-group]:has(input:disabled)",
                    "[data-slot=file-input]:has(input:disabled)",
                  ].join(","),
                ),
            )
            .catch(() => false)
          if (!disabled) nodes.push(node)
        }
        if (nodes.length) violations.push({ ...v, nodes })
      }
      expect(pageErrors, "page errors").toEqual([])
      expect(
        violations.map(
          (v) => `${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        ),
        "axe violations",
      ).toEqual([])
    })
  }
}

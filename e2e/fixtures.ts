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

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    await use(errors)
  },
})

export { expect } from "@playwright/test"

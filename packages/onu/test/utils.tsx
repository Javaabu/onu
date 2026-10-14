import * as React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import axe from "axe-core"
import { expect } from "vitest"

import { dv } from "../src/locales/dv"
import { OnuProvider, type OnuProviderProps } from "../src/providers/onu-provider"

export interface RenderWithOnuOptions extends Omit<RenderOptions, "wrapper"> {
  locale?: OnuProviderProps["locale"]
  dir?: "ltr" | "rtl"
  dark?: boolean
  provider?: Omit<OnuProviderProps, "children" | "locale" | "dir">
}

/**
 * Renders inside OnuProvider with a locale, direction and theme. `locale: "dv"` passes
 * the Dhivehi locale object, so the first render is already in Dhivehi (the provider
 * would otherwise load it on demand).
 */
export function renderWithOnu(
  ui: React.ReactElement,
  { locale = "en", dir, dark, provider, ...options }: RenderWithOnuOptions = {},
) {
  if (dark) document.documentElement.classList.add("dark")
  return render(ui, {
    wrapper: ({ children }) => (
      <OnuProvider locale={locale === "dv" ? dv : locale} dir={dir} {...provider}>
        {children}
      </OnuProvider>
    ),
    ...options,
  })
}

/**
 * Runs axe-core and fails with a readable list of violations (R14.11).
 * Colour contrast is skipped because jsdom does not compute styles.
 */
export async function expectNoA11yViolations(container: Element = document.body, rules: axe.RuleObject = {}) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false }, ...rules },
  })
  const message = results.violations
    .map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`)
    .join("\n")
  expect(results.violations, message).toHaveLength(0)
}

/** Runs a test body in LTR and RTL (R11.8). */
export const directions = ["ltr", "rtl"] as const

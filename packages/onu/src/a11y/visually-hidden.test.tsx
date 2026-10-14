import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { VisuallyHidden } from "./visually-hidden"

describe("VisuallyHidden", () => {
  it("renders a span hidden with sr-only that still names its button", () => {
    renderWithOnu(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    )
    expect(screen.getByRole("button")).toHaveAccessibleName("Close")
    const text = screen.getByText("Close")
    expect(text.tagName).toBe("SPAN")
    expect(text).toHaveClass("sr-only")
    expect(text).toHaveAttribute("data-slot", "visually-hidden")
  })

  it("renders its child element instead with asChild", () => {
    renderWithOnu(
      <VisuallyHidden asChild>
        <h2>Filters</h2>
      </VisuallyHidden>,
    )
    const heading = screen.getByRole("heading", { level: 2, name: "Filters" })
    expect(heading).toHaveClass("sr-only")
    expect(heading).toHaveAttribute("data-slot", "visually-hidden")
  })

  it("shows focusable content while it has focus", () => {
    renderWithOnu(
      <VisuallyHidden focusable asChild>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>,
    )
    expect(screen.getByRole("link")).toHaveClass("sr-only", "focus:not-sr-only", "focus-within:not-sr-only")
  })

  it("merges classes and passes props through", () => {
    const ref = React.createRef<HTMLSpanElement>()
    renderWithOnu(
      <VisuallyHidden ref={ref} id="hint" lang="dv" className="extra">
        ނަން
      </VisuallyHidden>,
    )
    expect(ref.current).toHaveAttribute("id", "hint")
    expect(ref.current).toHaveAttribute("lang", "dv")
    expect(ref.current).toHaveClass("sr-only", "extra")
    expect(ref.current).not.toHaveClass("focus:not-sr-only")
  })

  it.each(directions)("has no axe violations (%s)", async (dir) => {
    renderWithOnu(
      <a href="#fees">
        <span aria-hidden="true">→</span>
        <VisuallyHidden>Read more about fees</VisuallyHidden>
      </a>,
      { dir },
    )
    expect(screen.getByRole("link")).toHaveAccessibleName("Read more about fees")
    await expectNoA11yViolations()
  })
})

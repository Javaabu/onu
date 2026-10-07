import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SkipLink } from "./skip-link"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("SkipLink", () => {
  it("is the first tab stop and moves focus to the main content", async () => {
    renderWithOnu(
      <>
        <SkipLink className="extra" />
        <button type="button">Menu</button>
        <main id="main-content">Content</main>
      </>,
    )
    await userEvent.tab()
    const link = screen.getByRole("link", { name: "Skip to content" })
    expect(link).toHaveFocus()
    expect(link).toHaveClass("sr-only", "extra")
    await userEvent.click(link)
    const main = screen.getByRole("main")
    expect(main).toHaveFocus()
    expect(main).toHaveAttribute("tabindex", "-1")
    await expectNoA11yViolations()
  })

  it("keeps an existing tabindex, ignores missing targets and respects preventDefault", () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
    renderWithOnu(
      <>
        <SkipLink href="#content">Jump</SkipLink>
        <SkipLink href="#missing">Missing</SkipLink>
        <SkipLink href="/elsewhere">Away</SkipLink>
        <SkipLink href="#content" onClick={onClick}>
          Custom
        </SkipLink>
        <div id="content" role="button" tabIndex={0}>
          x
        </div>
      </>,
    )
    fireEvent.click(screen.getByText("Jump"))
    expect(document.getElementById("content")).toHaveAttribute("tabindex", "0")
    expect(document.getElementById("content")).toHaveFocus()
    fireEvent.click(screen.getByText("Missing"))
    fireEvent.click(screen.getByText("Away"))
    fireEvent.click(screen.getByText("Custom"))
    expect(onClick).toHaveBeenCalled()
  })

  it.each(directions)("translates in %s", (dir) => {
    renderWithOnu(<SkipLink />, { locale: "dv", dir })
    expect(screen.getByRole("link", { name: "ކޮންޓެންޓަށް ފުންމާލާ" })).toHaveAttribute("href", "#main-content")
  })
})

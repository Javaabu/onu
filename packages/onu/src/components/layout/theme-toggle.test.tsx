import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ThemeProvider } from "../../providers/theme-provider"
import { ThemeToggle } from "./theme-toggle"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("ThemeToggle", () => {
  afterEach(() => localStorage.clear())

  it("switches theme from a menu, applies the dark class and announces it", async () => {
    renderWithOnu(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle className="extra" />
      </ThemeProvider>,
    )
    const trigger = screen.getByRole("button", { name: "Theme: Light" })
    expect(trigger).toHaveClass("extra")
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "Dark" }))
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("onu-theme")).toBe("dark")
    expect(screen.getByRole("status")).toHaveTextContent("Theme: Dark")
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("renders segmented buttons", async () => {
    renderWithOnu(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle variant="segmented" size="sm" />
      </ThemeProvider>,
    )
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }))
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
    expect(document.documentElement).toHaveClass("dark")
    await expectNoA11yViolations()
  })

  it("cycles through themes with one button, optionally without System", async () => {
    renderWithOnu(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle variant="cycle" showSystem={false} />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Theme: Light" }))
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Theme: Dark" }))
    expect(screen.getByRole("button", { name: "Theme: Light" })).toBeInTheDocument()
  })

  it("shows the resolved icon for System and supports the small size", async () => {
    renderWithOnu(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle size="sm" />
        <ThemeToggle variant="cycle" size="sm" />
      </ThemeProvider>,
    )
    const [menu, cycle] = screen.getAllByRole("button", { name: "Theme: System" })
    expect(menu).toHaveAttribute("data-size", "icon-sm")
    expect(menu!.querySelector("svg")).toHaveAttribute("data-icon-name", "sun")
    await userEvent.click(cycle!)
    expect(screen.getAllByRole("button", { name: "Theme: Light" })).toHaveLength(2)
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle variant="cycle" />
      </ThemeProvider>,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("button", { name: "ތީމް: އަނދިރި" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

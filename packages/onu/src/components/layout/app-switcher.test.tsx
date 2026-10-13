import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AppSwitcher } from "./app-switcher"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const apps = [
  { label: "Records", href: "/records", icon: "file-text", current: true },
  { label: "Payments", href: "/payments", icon: "credit-card" },
  { label: "Help", href: "https://help.mv", external: true },
]

describe("AppSwitcher", () => {
  it("opens a menu of apps on tiles, marking the current one", async () => {
    renderWithOnu(<AppSwitcher apps={apps} label="Atoll apps" className="extra" />)
    const trigger = screen.getByRole("button", { name: "Switch app" })
    expect(trigger).toHaveClass("extra")
    await expectNoA11yViolations()
    await userEvent.click(trigger)
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByText("Atoll apps")).toBeInTheDocument()
    const records = within(menu).getByRole("menuitem", { name: "Records" })
    expect(records).toHaveAttribute("href", "/records")
    expect(records).toHaveAttribute("aria-current", "page")
    expect(records.querySelector("[data-slot=app-switcher-tile]")).toHaveAttribute("aria-hidden", "true")
    expect(within(menu).getByRole("menuitem", { name: /Help/ })).toHaveAttribute("target", "_blank")
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<AppSwitcher apps={apps} />, { locale: "dv", dir })
    await userEvent.click(screen.getByRole("button", { name: "އެޕް ބަދަލުކުރޭ" }))
    expect(await screen.findByText("އެޕްތައް")).toBeInTheDocument()
  })
})

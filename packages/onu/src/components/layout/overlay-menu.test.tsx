import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { OverlayMenu } from "./overlay-menu"
import type { NavItem } from "./_nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses", description: "Browse all courses" },
  { label: "Contact", href: "/contact" },
]

describe("OverlayMenu", () => {
  it("opens full screen in a portal, traps focus and closes with Escape", async () => {
    renderWithOnu(
      <OverlayMenu
        items={items}
        currentHref="/courses"
        logo={<span>Academy</span>}
        footer={<span>Hotline 1500</span>}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Open menu" })
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Menu" })
    expect(dialog).toHaveClass("fixed", "inset-0")
    expect(within(dialog).getByText("Academy")).toBeInTheDocument()
    expect(within(dialog).getByText("Hotline 1500")).toBeInTheDocument()
    const current = within(dialog).getByRole("link", { name: /Courses/ })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(current).toHaveClass("min-h-12")
    await expectNoA11yViolations()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("keeps focus inside while tabbing", async () => {
    renderWithOnu(<OverlayMenu items={items} defaultOpen />)
    const dialog = await screen.findByRole("dialog")
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it("is controllable, closes after navigating and accepts a custom trigger", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <OverlayMenu
        items={items}
        title="Site menu"
        onOpenChange={onOpenChange}
        trigger={<button type="button">Browse</button>}
        classNames={{ content: "cnt" }}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Browse" }))
    const dialog = await screen.findByRole("dialog", { name: "Site menu" })
    expect(dialog).toHaveClass("cnt")
    await userEvent.click(within(dialog).getByRole("link", { name: "Home" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("stays open when controlled", async () => {
    renderWithOnu(<OverlayMenu items={items} open />)
    const dialog = await screen.findByRole("dialog")
    await userEvent.click(within(dialog).getByRole("button", { name: "Close menu" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<OverlayMenu items={[{ label: "ފުރަތަމަ ސަފްޙާ", href: "/" }]} defaultOpen />, { locale: "dv", dir })
    expect(await screen.findByRole("dialog", { name: "މެނޫ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "މެނޫ ބަންދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

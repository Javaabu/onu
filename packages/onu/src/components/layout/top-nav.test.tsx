import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TopNav } from "./top-nav"
import type { NavItem } from "./_nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    items: [
      { label: "Passports", href: "/services/passports", description: "Apply or renew", icon: "file" },
      { label: "Licences", href: "/services/licences" },
    ],
  },
  { label: "News", href: "/news", badge: 2 },
]

describe("TopNav", () => {
  it("renders desktop links with the active page", async () => {
    renderWithOnu(<TopNav items={items} currentHref="/news/123" className="extra" classNames={{ link: "lnk" }} />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    expect(within(nav).getByRole("link", { name: /News/ })).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveClass("lnk")
    expect(document.querySelector("[data-slot=top-nav]")).toHaveClass("extra")
    await expectNoA11yViolations()
  })

  it("opens dropdown panels for items with children", async () => {
    renderWithOnu(<TopNav items={items} currentHref="/services/passports" />)
    const trigger = screen.getByRole("button", { name: "Services" })
    expect(trigger).toHaveAttribute("data-active", "true")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const link = await screen.findByRole("link", { name: /Passports/ })
    expect(link).toHaveAttribute("aria-current", "page")
    expect(screen.getByText("Apply or renew")).toBeInTheDocument()
  })

  it("collapses to a menu button that opens a drawer on phones, returning focus on close", async () => {
    renderWithOnu(
      <TopNav items={items} currentHref="/" logo={<span>Portal</span>} mobileFooter={<span>Sign in</span>} />,
    )
    const open = screen.getByRole("button", { name: "Open menu" })
    expect(open).toHaveClass("md:hidden")
    await userEvent.click(open)
    const dialog = await screen.findByRole("dialog", { name: "Menu" })
    expect(within(dialog).getByText("Portal")).toBeInTheDocument()
    expect(within(dialog).getByText("Sign in")).toBeInTheDocument()
    expect(within(dialog).getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page")
    await userEvent.click(within(dialog).getByRole("button", { name: "Close menu" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(open).toHaveFocus()
  })

  it("closes the drawer after navigating", async () => {
    renderWithOnu(<TopNav items={items} mobileSide="start" navLabel="Portal" />)
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }))
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveAttribute("data-side", "left")
    await userEvent.click(within(dialog).getByRole("link", { name: /News/ }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it.each(directions)("translates in %s and opens the drawer from the end", async (dir) => {
    renderWithOnu(<TopNav items={[{ label: "ޚަބަރު", href: "/news" }]} />, { locale: "dv", dir })
    await userEvent.click(screen.getByRole("button", { name: "މެނޫ ހުޅުވާ" }))
    const dialog = await screen.findByRole("dialog", { name: "މެނޫ" })
    expect(dialog).toHaveAttribute("data-side", dir === "rtl" ? "left" : "right")
    await expectNoA11yViolations()
  })
})

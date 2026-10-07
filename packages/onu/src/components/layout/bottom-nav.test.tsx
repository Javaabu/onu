import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { BottomNav } from "./bottom-nav"
import type { NavItem } from "./_nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Applications", href: "/applications", icon: "file-text", badge: 3 },
  { label: "Inbox", href: "/inbox", icon: "mail", badge: 120 },
  { label: "Profile", href: "/profile", icon: "user" },
]

describe("BottomNav", () => {
  it("is fixed to the bottom with safe-area padding and marks the active item", async () => {
    renderWithOnu(<BottomNav items={items} currentHref="/applications/12" className="extra" />)
    const nav = screen.getByRole("navigation", { name: "Quick navigation" })
    expect(nav).toHaveClass("fixed", "bottom-0", "pb-[env(safe-area-inset-bottom)]", "md:hidden", "extra")
    const active = screen.getByRole("link", { name: /Applications/ })
    expect(active).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current")
    await expectNoA11yViolations()
  })

  it("has ≥ 44px targets and badges with screen-reader text", () => {
    renderWithOnu(<BottomNav items={items} classNames={{ badge: "bdg", item: "itm" }} />)
    const link = screen.getByRole("link", { name: "Applications 3 new" })
    expect(link).toHaveClass("min-h-14", "itm")
    expect(screen.getByText("99+")).toBeInTheDocument()
    expect(screen.getByText("3 new").parentElement).toHaveClass("bdg")
  })

  it("supports buttons, disabled items, static position and hideFrom", async () => {
    const onSelect = vi.fn()
    renderWithOnu(
      <BottomNav
        position="static"
        hideFrom="never"
        items={[
          { label: "Scan", icon: "qr-code", onSelect, isActive: true },
          { label: "Off", icon: "lock", disabled: true },
        ]}
      />,
    )
    const nav = screen.getByRole("navigation")
    expect(nav).not.toHaveClass("fixed")
    expect(nav).not.toHaveClass("md:hidden")
    await userEvent.click(screen.getByRole("button", { name: "Scan" }))
    expect(onSelect).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Scan" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled()
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<BottomNav items={[{ label: "ގެ", href: "/", icon: "home", badge: 2 }]} currentHref="/" />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("navigation", { name: "އަވަސް ނެވިގޭޝަން" })).toBeInTheDocument()
    expect(screen.getByText("2 އައު")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { MegaMenu, type MegaMenuItem } from "./mega-menu"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: MegaMenuItem[] = [
  {
    label: "Services",
    columns: [
      {
        title: "Citizens",
        links: [
          { label: "ID cards", href: "/id", description: "Apply, renew or replace", icon: "user" },
          { label: "Passports", href: "/passports" },
        ],
      },
      { title: "Businesses", links: [{ label: "Registration", href: "/business" }] },
      { links: [{ label: "Help centre", href: "https://help.mv", external: true }] },
    ],
    featured: <div>Featured: eFaas</div>,
  },
  { label: "News", href: "/news" },
]

describe("MegaMenu", () => {
  it("opens a multi-column panel on desktop", async () => {
    renderWithOnu(<MegaMenu items={items} className="extra" classNames={{ panel: "pnl", column: "col" }} />)
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "News" })).toHaveAttribute("href", "/news")
    const trigger = screen.getByRole("button", { name: "Services" })
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const panel = await screen.findByText("Citizens")
    const root = panel.closest("[data-slot=mega-menu-panel]")!
    expect(root).toHaveClass("pnl")
    expect(root.querySelectorAll("[data-slot=mega-menu-column]")).toHaveLength(3)
    expect(screen.getByRole("link", { name: /ID cards/ })).toHaveAttribute("href", "/id")
    expect(screen.getByText("Apply, renew or replace")).toBeInTheDocument()
    expect(screen.getByText("Featured: eFaas")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("collapses to a drawer with accordion sections on phones", async () => {
    renderWithOnu(<MegaMenu items={items} logo={<span>gov.mv</span>} />)
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }))
    const dialog = await screen.findByRole("dialog", { name: "Menu" })
    expect(within(dialog).getByText("gov.mv")).toBeInTheDocument()
    const section = within(dialog).getByRole("button", { name: "Services" })
    await userEvent.click(section)
    expect(section).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(within(dialog).getByRole("link", { name: /Passports/ }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("closes the drawer with the close button and from plain links", async () => {
    renderWithOnu(<MegaMenu items={items} mobileSide="start" />)
    const open = screen.getByRole("button", { name: "Open menu" })
    await userEvent.click(open)
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Close menu" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(open).toHaveFocus()
    await userEvent.click(open)
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("link", { name: "News" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(
      <MegaMenu items={[{ label: "ޚިދުމަތްތައް", columns: [{ links: [{ label: "ކާޑު", href: "/c" }] }] }]} />,
      {
        locale: "dv",
        dir,
      },
    )
    expect(screen.getByRole("button", { name: "މެނޫ ހުޅުވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

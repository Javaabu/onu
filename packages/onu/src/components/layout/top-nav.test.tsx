import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TopNav, type TopNavItem } from "./top-nav"
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

const megaItems: TopNavItem[] = [
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

describe("TopNav mega menu", () => {
  it("opens a multi-column panel on desktop", async () => {
    renderWithOnu(
      <TopNav items={megaItems} className="extra" classNames={{ panel: "pnl", column: "col", panelLink: "lnk" }} />,
    )
    expect(document.querySelector("[data-slot=top-nav]")).toHaveClass("extra")
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
    expect(screen.getByRole("link", { name: /ID cards/ })).toHaveClass("lnk")
    expect(screen.getByText("Apply, renew or replace")).toBeInTheDocument()
    expect(screen.getByText("Featured: eFaas")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("collapses to a drawer with a section per item and per titled column on phones", async () => {
    renderWithOnu(<TopNav items={megaItems} logo={<span>gov.mv</span>} />)
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }))
    const dialog = await screen.findByRole("dialog", { name: "Menu" })
    expect(within(dialog).getByText("gov.mv")).toBeInTheDocument()
    const section = within(dialog).getByRole("button", { name: "Services" })
    await userEvent.click(section)
    expect(section).toHaveAttribute("aria-expanded", "true")
    expect(within(dialog).getByRole("link", { name: /Help centre/ })).toHaveAttribute("href", "https://help.mv")
    const column = within(dialog).getByRole("button", { name: "Citizens" })
    await userEvent.click(column)
    expect(column).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(within(dialog).getByRole("link", { name: /Passports/ }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("closes the drawer with the close button and from plain links", async () => {
    renderWithOnu(<TopNav items={megaItems} mobileSide="start" />)
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
      <TopNav items={[{ label: "ޚިދުމަތްތައް", columns: [{ links: [{ label: "ކާޑު", href: "/c" }] }] }]} />,
      {
        locale: "dv",
        dir,
      },
    )
    expect(screen.getByRole("button", { name: "މެނޫ ހުޅުވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("TopNav with columns", () => {
  const mixed: TopNavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "Services",
      icon: "grid",
      columns: [
        {
          title: "Citizens",
          links: [
            { label: "ID cards", href: "/services/id", badge: 2 },
            { label: "Passports", href: "/services/passports" },
          ],
        },
        { links: [{ label: "All services", href: "/services" }] },
      ],
    },
    { label: "About", items: [{ label: "Team", href: "/about/team" }] },
  ]

  it("marks the active panel link and its trigger, with badges and icons", async () => {
    renderWithOnu(<TopNav items={mixed} currentHref="/services/id/apply" classNames={{ panelLink: "pl" }} />)
    expect(document.querySelector("[data-slot=top-nav]")).toBeInTheDocument()
    const trigger = screen.getByRole("button", { name: "Services" })
    expect(trigger).toHaveAttribute("data-active", "true")
    expect(trigger.querySelector("svg")).not.toBeNull()
    await userEvent.click(trigger)
    const link = await screen.findByRole("link", { name: /ID cards/ })
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link).toHaveClass("pl")
    expect(link).toHaveTextContent("2 new")
    expect(screen.getByRole("link", { name: "Passports" })).not.toHaveAttribute("aria-current")
    expect(document.querySelector("[data-slot=mega-menu-panel]")).toBeInTheDocument()
  })

  it("styles dropdown links with panelLink too", async () => {
    renderWithOnu(<TopNav items={mixed} classNames={{ panelLink: "pl" }} />)
    await userEvent.click(screen.getByRole("button", { name: "About" }))
    expect(await screen.findByRole("link", { name: "Team" })).toHaveClass("pl")
  })

  it("opens the active column in the phone menu, with headings as labelled sections", async () => {
    renderWithOnu(<TopNav items={mixed} currentHref="/services/passports" />)
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }))
    const dialog = await screen.findByRole("dialog", { name: "Menu" })
    expect(within(dialog).getByRole("button", { name: "Services" })).toHaveAttribute("aria-expanded", "true")
    expect(within(dialog).getByRole("button", { name: "Citizens" })).toHaveAttribute("aria-expanded", "true")
    expect(within(dialog).getByRole("link", { name: "Passports" })).toHaveAttribute("aria-current", "page")
    expect(within(dialog).getByRole("link", { name: "All services" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(
      <TopNav
        currentHref="/c"
        items={[
          { label: "ޚިދުމަތްތައް", columns: [{ title: "ރައްޔިތުން", links: [{ label: "ކާޑު", href: "/c" }] }] },
          { label: "ޚަބަރު", href: "/news" },
        ]}
      />,
      { locale: "dv", dir },
    )
    await userEvent.click(screen.getByRole("button", { name: "ޚިދުމަތްތައް" }))
    expect(await screen.findByRole("link", { name: "ކާޑު" })).toHaveAttribute("aria-current", "page")
    await expectNoA11yViolations()
  })
})

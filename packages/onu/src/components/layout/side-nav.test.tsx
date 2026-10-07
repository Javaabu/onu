import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SideNav, sideNavItemVariants, type NavGroup } from "./side-nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const groups: NavGroup[] = [
  {
    label: "Records",
    items: [
      { label: "Dashboard", href: "/", icon: "home" },
      {
        label: "Users",
        href: "/users",
        icon: "users",
        badge: 4,
        items: [
          { label: "All users", href: "/users/all" },
          { label: "Invitations", href: "/users/invitations", badge: 2 },
        ],
      },
      {
        label: "Reports",
        icon: "file-text",
        items: [{ label: "Monthly", href: "/reports/monthly", description: "By atoll" }],
      },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/settings", disabled: true },
      { label: "Help", href: "https://help.example.mv", external: true },
    ],
  },
]

describe("SideNav", () => {
  it("renders groups and marks the current page, expanding its parent", async () => {
    renderWithOnu(<SideNav groups={groups} currentHref="/users/invitations" className="extra" />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    expect(nav).toHaveClass("extra")
    expect(within(nav).getByRole("list", { name: "Records" })).toBeInTheDocument()
    const current = screen.getByRole("link", { name: /Invitations/ })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: /^Users/ })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("button", { name: "Show or hide Users" })).toHaveAttribute("aria-expanded", "true")
    await expectNoA11yViolations()
  })

  it("toggles nested items with the keyboard", async () => {
    renderWithOnu(<SideNav groups={groups} currentHref="/" />)
    const reports = screen.getByRole("button", { name: "Reports" })
    expect(reports).toHaveAttribute("aria-expanded", "false")
    reports.focus()
    await userEvent.keyboard("{Enter}")
    expect(reports).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: /Monthly/ })).toBeVisible()
    expect(screen.getByText("By atoll")).toBeInTheDocument()
  })

  it("handles disabled, external, button items, badges and onNavigate", async () => {
    const onNavigate = vi.fn()
    const onSelect = vi.fn()
    renderWithOnu(
      <SideNav
        items={[...groups[1]!.items, { label: "Sign out", icon: "log-out", onSelect }, { label: "Dash", href: "/d" }]}
        onNavigate={onNavigate}
        size="lg"
        aria-label="Settings menu"
        classNames={{ item: "itm", badge: "bdg", list: "lst" }}
      />,
    )
    expect(screen.getByRole("navigation", { name: "Settings menu" })).toBeInTheDocument()
    expect(screen.getByText("Settings").closest("[data-slot=side-nav-item]")).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("link", { name: /Help/ })).toHaveAttribute("target", "_blank")
    await userEvent.click(screen.getByRole("button", { name: "Sign out" }))
    expect(onSelect).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ label: "Sign out" }))
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveClass("itm", "text-lg")
    expect(screen.getByRole("list")).toHaveClass("lst")
    expect(sideNavItemVariants({ size: "sm" })).toContain("text-xs")
  })

  it("shows count badges with screen-reader text", () => {
    renderWithOnu(<SideNav groups={groups} classNames={{ badge: "bdg" }} />)
    expect(screen.getByRole("link", { name: /^Users/ })).toHaveTextContent("Users44 new")
    expect(screen.getByText("4 new").parentElement).toHaveClass("bdg")
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<SideNav items={[{ label: "ފުރަތަމަ ސަފްޙާ", href: "/" }]} currentHref="/" />, { locale: "dv", dir })
    expect(screen.getByRole("navigation", { name: "މައި ނެވިގޭޝަން" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

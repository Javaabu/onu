import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { NavTabs, navTabsVariants, type NavTabItem } from "./nav-tabs"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: NavTabItem[] = [
  { label: "Profile", href: "/users/1" },
  { label: "Edit", href: "/users/1/edit", icon: "edit" },
  { label: "Activity", href: "/users/1/activity", count: 12 },
]

describe("NavTabs", () => {
  it("§25.8: each tab is a link and the current one is highlighted", async () => {
    renderWithOnu(<NavTabs items={items} currentHref="/users/1/edit" className="extra" classNames={{ item: "itm" }} />)
    const nav = screen.getByRole("navigation", { name: "Sections" })
    expect(nav).toHaveClass("extra", "border-b")
    const edit = screen.getByRole("link", { name: "Edit" })
    expect(edit).toHaveAttribute("aria-current", "page")
    expect(edit).toHaveAttribute("data-active", "true")
    expect(edit).toHaveClass("itm")
    // Exact matching: the Profile tab is not current on /users/1/edit.
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute("aria-current")
    await expectNoA11yViolations()
  })

  it("highlights only the tab whose query string matches", () => {
    const tabs: NavTabItem[] = [
      { label: "Documents", href: "/records/7?tab=documents" },
      { label: "History", href: "/records/7?tab=history" },
      { label: "Notes", href: "/records/7?tab=notes" },
    ]
    renderWithOnu(<NavTabs items={tabs} currentHref="/records/7?tab=history" />)
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Documents" })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("link", { name: "Notes" })).not.toHaveAttribute("aria-current")
  })

  it('§25.8: shows counts like "Activity (12)"', () => {
    renderWithOnu(<NavTabs items={items} classNames={{ count: "cnt" }} />)
    expect(screen.getByRole("link", { name: "Activity (12)" })).toBeInTheDocument()
    expect(screen.getByText("(12)")).toHaveClass("cnt")
  })

  it("§25.9: disabled tabs are greyed out and not links (create page)", () => {
    renderWithOnu(<NavTabs items={[items[0]!, { ...items[1]!, disabled: true }]} />)
    expect(screen.queryByRole("link", { name: "Edit" })).toBeNull()
    const edit = screen.getByText("Edit").closest("[data-slot=nav-tabs-item]")
    expect(edit).toHaveAttribute("aria-disabled", "true")
    expect(edit).toHaveClass("opacity-50")
  })

  it("is scrollable on phones and scrolls the current tab into view", () => {
    const spy = vi.spyOn(Element.prototype, "scrollIntoView")
    renderWithOnu(<NavTabs items={items} currentHref="/users/1/activity" />)
    expect(screen.getByRole("list")).toHaveClass("overflow-x-auto")
    expect(spy).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" })
    spy.mockRestore()
  })

  it("supports prefix matching, forced state, badges, pill variant and keyboard focus", async () => {
    renderWithOnu(
      <NavTabs
        aria-label="Record"
        variant="pill"
        match="prefix"
        currentHref="/users/1/activity/42"
        items={[
          ...items,
          { label: "Notes", href: "/notes", badge: 2, isActive: false },
          { label: "Forced", href: "/x", isActive: true },
        ]}
      />,
    )
    expect(screen.getByRole("navigation", { name: "Record" })).not.toHaveClass("border-b")
    expect(screen.getByRole("link", { name: "Activity (12)" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Forced" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: /Notes/ })).toHaveTextContent("Notes22 new")
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "Profile" })).toHaveFocus()
    expect(navTabsVariants({ variant: "pill" })).toContain("rounded-lg")
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<NavTabs items={[{ label: "ޕްރޮފައިލް", href: "/p", count: 3 }]} currentHref="/p" />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("navigation", { name: "ބައިތައް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

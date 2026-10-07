import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Breadcrumbs, type BreadcrumbsItem } from "./breadcrumbs"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const original = window.matchMedia
function mockMobile() {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("max-width"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

const items: BreadcrumbsItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Users", href: "/users" },
  { label: "Admins", href: "/users/admins" },
  { label: "Jane Doe" },
]

describe("Breadcrumbs", () => {
  afterEach(() => {
    window.matchMedia = original
  })

  it("§25.8: every part is a link except the last", async () => {
    renderWithOnu(<Breadcrumbs items={[{ label: "Users", href: "/users" }, { label: "Jane Doe" }]} className="extra" />)
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" })
    expect(nav).toHaveClass("extra")
    expect(within(nav).getByRole("link", { name: "Users" })).toHaveAttribute("href", "/users")
    const current = within(nav).getByText("Jane Doe").closest("[data-slot=breadcrumb-page]")
    expect(current).toHaveAttribute("aria-current", "page")
    expect(within(nav).queryByRole("link", { name: "Jane Doe" })).not.toHaveAttribute("href")
    await expectNoA11yViolations()
  })

  it("§25.8: separators are directional icons that mirror in RTL", () => {
    const { container } = renderWithOnu(<Breadcrumbs items={items} />, { dir: "rtl" })
    const icons = container.querySelectorAll("[data-slot=breadcrumb-separator] svg")
    expect(icons).toHaveLength(3)
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute("data-icon-name", "chevron-right")
      expect(icon).toHaveClass("rtl:-scale-x-100")
      expect(icon).not.toHaveClass("rtl:rotate-180")
    })
  })

  it("§25.8: collapses middle items into a menu on phones", async () => {
    mockMobile()
    renderWithOnu(<Breadcrumbs items={items} />)
    const nav = screen.getByRole("navigation")
    expect(nav).toHaveAttribute("data-collapsed", "true")
    expect(within(nav).getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(within(nav).queryByRole("link", { name: "Users" })).toBeNull()
    await userEvent.click(within(nav).getByRole("button", { name: "Show hidden pages" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Users" })).toHaveAttribute("href", "/users")
    expect(within(menu).getByRole("menuitem", { name: "Admins" })).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(within(nav).getByRole("button", { name: "Show hidden pages" })).toHaveFocus()
  })

  it("keeps everything on phones when collapseOnMobile is off, and collapses past maxItems", () => {
    mockMobile()
    const { unmount } = renderWithOnu(<Breadcrumbs items={items} collapseOnMobile={false} />)
    // 3 links + the current page (role="link" aria-disabled, from shadcn).
    expect(screen.getAllByRole("link")).toHaveLength(4)
    unmount()
    window.matchMedia = original
    renderWithOnu(
      <Breadcrumbs
        items={[...items.slice(0, 3), { label: "No link" }, { label: "Last" }]}
        maxItems={3}
        separator="/"
        classNames={{ list: "lst", separator: "sep" }}
      />,
    )
    expect(screen.getByRole("list")).toHaveClass("lst")
    expect(screen.getAllByText("/")[0]).toHaveClass("sep")
    // first + menu + last two
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByText("No link")).toBeInTheDocument()
    expect(screen.getByText("No link").closest("[data-slot=breadcrumb-page]")).not.toHaveAttribute("aria-current")
  })

  it("shows non-link hidden items as disabled menu items", async () => {
    renderWithOnu(<Breadcrumbs items={[items[0]!, { label: "Plain" }, items[1]!, items[3]!]} maxItems={2} />)
    await userEvent.click(screen.getByRole("button", { name: "Show hidden pages" }))
    expect(await screen.findByRole("menuitem", { name: "Plain" })).toHaveAttribute("aria-disabled", "true")
  })

  it.each(directions)("is translated in %s", async (dir) => {
    renderWithOnu(<Breadcrumbs items={[{ label: "މެމްބަރުން", href: "/users" }, { label: "އަޙްމަދު" }]} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("navigation", { name: "ބްރެޑްކްރަމް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

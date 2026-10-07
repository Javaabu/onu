import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SidebarProvider, SidebarTrigger } from "../../ui/sidebar"
import { TooltipProvider } from "../../ui/tooltip"
import { AppSidebar } from "./app-sidebar"
import type { NavGroup } from "./_nav"

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

const groups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: "home" },
      { label: "Applications", href: "/applications", icon: "file-text", badge: 12 },
      {
        label: "Users",
        href: "/users",
        icon: "users",
        items: [
          { label: "All users", href: "/users/all" },
          { label: "Invitations", href: "/users/invitations", badge: 3 },
          { label: "Locked", disabled: true },
        ],
      },
      {
        label: "Reports",
        icon: "file",
        badge: <span>New</span>,
        items: [{ label: "Monthly", href: "/reports/monthly" }],
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Archived", disabled: true, icon: "archive" },
      { label: "Help", href: "https://help.mv", external: true },
    ],
  },
]

function renderSidebar(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1], open = true) {
  return renderWithOnu(
    <TooltipProvider>
      <SidebarProvider defaultOpen={open}>
        {ui}
        <SidebarTrigger />
      </SidebarProvider>
    </TooltipProvider>,
    options,
  )
}

describe("AppSidebar", () => {
  afterEach(() => {
    window.matchMedia = original
  })

  it.each(directions)("lays out a parent's badge before its chevron, never on top of it (%s)", (dir) => {
    renderSidebar(
      <AppSidebar
        groups={[
          {
            items: [
              { label: "Inbox", href: "/inbox", badge: 12, items: [{ label: "Unread", href: "/inbox/unread" }] },
              { label: "Reports", badge: 4, items: [{ label: "Monthly", href: "/reports/monthly" }] },
            ],
          },
        ]}
      />,
      { dir },
    )
    // A linked parent: the badge sits inside the link, the submenu toggle after it.
    const inbox = screen.getByRole("link", { name: /^Inbox/ })
    const inboxBadge = inbox.querySelector("[data-slot=nav-badge]")!
    expect(inboxBadge).toHaveClass("ms-auto", "shrink-0")
    expect(inboxBadge).not.toHaveClass("absolute")
    expect(inbox.closest("li")!.querySelector("[data-sidebar=menu-badge]")).toBeNull()
    // A toggle-only parent: badge, then the chevron, in the same flex row.
    const reports = screen.getByRole("button", { name: /^Reports/ })
    const badge = reports.querySelector("[data-slot=nav-badge]")!
    const chevron = reports.querySelector("svg:last-of-type")!
    expect(badge.compareDocumentPosition(chevron) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(chevron).not.toHaveClass("ms-auto")
  })

  it("renders groups, icons, badges and the active item", async () => {
    renderSidebar(
      <AppSidebar
        groups={groups}
        currentHref="/users/invitations"
        header={<span>Onu</span>}
        footer={<span>Footer</span>}
        className="extra"
        classNames={{ groupLabel: "lbl" }}
      />,
    )
    const nav = screen.getByRole("navigation", { name: "Main" })
    expect(within(nav).getByText("Main", { selector: "[data-slot=sidebar-group-label]" })).toHaveClass("lbl")
    const current = screen.getByRole("link", { name: /Invitations/ })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(current).toHaveAttribute("data-active", "true")
    expect(screen.getByRole("link", { name: /Applications/ })).not.toHaveAttribute("aria-current")
    expect(screen.getByText("12 new")).toBeInTheDocument()
    expect(screen.getByText("Onu")).toBeInTheDocument()
    expect(screen.getByText("Footer")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=sidebar-container]")).toHaveClass("extra")
    await expectNoA11yViolations()
  }, 20000)

  it("expands the parent of the current page and toggles nested items", async () => {
    renderSidebar(<AppSidebar groups={groups} currentHref="/users/all" />)
    const toggle = screen.getByRole("button", { name: "Show or hide Users" })
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    const reports = screen.getByRole("button", { name: /^Reports/ })
    reports.focus()
    await userEvent.keyboard("{Enter}")
    expect(reports).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Monthly" })).toBeVisible()
  })

  it("calls onNavigate and item onSelect", async () => {
    const onNavigate = vi.fn()
    const onSelect = vi.fn()
    renderSidebar(
      <AppSidebar
        items={[
          { label: "Action", onSelect },
          { label: "Go", href: "/go" },
        ]}
        onNavigate={onNavigate}
        navLabel="Admin"
        rail={false}
      />,
    )
    expect(screen.getByRole("navigation", { name: "Admin" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Action" }))
    expect(onSelect).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ label: "Action" }))
    expect(document.querySelector("[data-slot=sidebar-rail]")).toBeNull()
  })

  it("collapses to icons and shows nested items in a flyout menu", async () => {
    renderSidebar(<AppSidebar groups={groups} currentHref="/users/all" />, {}, false)
    expect(document.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-collapsible", "icon")
    await userEvent.click(screen.getByRole("button", { name: "Users" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "All users" })).toHaveAttribute("aria-current", "page")
    expect(within(menu).getByRole("menuitem", { name: "Users" })).toHaveAttribute("href", "/users")
    expect(within(menu).getByRole("menuitem", { name: "Locked" })).toHaveAttribute("aria-disabled", "true")
  })

  it("toggles with the sidebar trigger and Ctrl+B", async () => {
    renderSidebar(<AppSidebar groups={groups} />)
    const sidebar = document.querySelector("[data-slot=sidebar]")!
    expect(sidebar).toHaveAttribute("data-state", "expanded")
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=sidebar-trigger]")!)
    expect(sidebar).toHaveAttribute("data-state", "collapsed")
    await userEvent.keyboard("{Control>}b{/Control}")
    expect(sidebar).toHaveAttribute("data-state", "expanded")
  })

  it("is an off-canvas drawer on phones that closes after navigating", async () => {
    mockMobile()
    renderSidebar(<AppSidebar groups={groups} currentHref="/" />)
    expect(screen.queryByRole("dialog")).toBeNull()
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=sidebar-trigger]")!)
    const dialog = await screen.findByRole("dialog", { name: "Sidebar" })
    await userEvent.click(within(dialog).getByRole("link", { name: /Applications/ }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it.each(directions)("sits on the inline start in %s and translates", async (dir) => {
    renderSidebar(<AppSidebar items={[{ label: "ފުރަތަމަ ސަފްޙާ", href: "/" }]} currentHref="/" />, {
      locale: "dv",
      dir,
    })
    expect(document.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-side", dir === "rtl" ? "right" : "left")
    expect(screen.getByRole("navigation", { name: "މައި ނެވިގޭޝަން" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

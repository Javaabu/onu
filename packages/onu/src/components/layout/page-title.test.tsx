import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { PageTitle } from "./page-title"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("PageTitle", () => {
  it("§25.6: shows the title, the main action and secondary links", async () => {
    renderWithOnu(
      <PageTitle
        title="Users"
        description="Everyone with access"
        action={<Button>New user</Button>}
        links={[{ label: "Trash", href: "/users/trash", icon: "trash", dot: true }]}
        className="extra"
        classNames={{ title: "ttl", actions: "act", links: "lnks", link: "lnk", description: "dsc" }}
      />,
    )
    expect(screen.getByRole("heading", { level: 1, name: "Users" })).toHaveClass("ttl")
    expect(screen.getByText("Everyone with access")).toHaveClass("dsc")
    expect(screen.getByRole("button", { name: "New user" }).parentElement).toHaveClass("act")
    const trash = screen.getByRole("link", { name: /Trash/ })
    expect(trash).toHaveAttribute("href", "/users/trash")
    expect(trash).toHaveClass("lnk")
    expect(screen.getByRole("list")).toHaveClass("lnks")
    await expectNoA11yViolations()
  })

  it("§25.6: a small dot on Trash means it isn't empty (and is announced)", () => {
    renderWithOnu(
      <PageTitle
        title="Users"
        links={[
          { label: "Trash", href: "/trash", dot: true },
          { label: "Archive", href: "/archive" },
        ]}
      />,
    )
    const trash = screen.getByRole("link", { name: "Trash (not empty)" })
    expect(trash.querySelector("[data-slot=page-title-dot]")).toBeInTheDocument()
    const archive = screen.getByRole("link", { name: "Archive" })
    expect(archive.querySelector("[data-slot=page-title-dot]")).toBeNull()
  })

  it("§25.8: record header with back links, actions, breadcrumbs, counts and media", () => {
    renderWithOnu(
      <PageTitle
        title="Jane Doe"
        headingLevel={2}
        breadcrumbs={<nav aria-label="Breadcrumb">crumbs</nav>}
        media={<span data-testid="avatar" />}
        links={[
          { label: "All users", href: "/users", icon: "back" },
          { label: "Trash", href: "/users/trash", count: 4 },
          { label: "Help", href: "https://help.mv", external: true },
        ]}
        actions={<Button variant="outline">Logs</Button>}
        action={<Button variant="destructive">Delete</Button>}
      />,
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-xl")
    expect(screen.getByTestId("avatar")).toBeInTheDocument()
    expect(screen.getByText("crumbs")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Trash/ })).toHaveTextContent("Trash(4)")
    const actions = screen.getByRole("button", { name: "Logs" }).parentElement!
    expect(
      within(actions)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Logs", "Delete"])
    expect(screen.getByRole("link", { name: /Help/ })).toHaveAttribute("target", "_blank")
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<PageTitle title="މެމްބަރުން" links={[{ label: "ކުނިފޮށި", href: "/trash", dot: true }]} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("link", { name: "ކުނިފޮށި (ހުސްނޫން)" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

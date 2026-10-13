import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { AppLayout } from "./app-layout"
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

  it("is Ant's PageHeader band inside a panel AppLayout, with the layout's breadcrumbs", async () => {
    renderWithOnu(
      <AppLayout breadcrumbs={[{ label: "Home", href: "/" }, { label: "Applications" }]}>
        <PageTitle
          title="Applications"
          subtitle="Every island"
          tags={<span>67 open</span>}
          description="Permit and licence applications."
          figures={[
            { label: "In review", value: 34 },
            { label: "Approved", value: 50 },
          ]}
          actions={<Button variant="outline">Trash</Button>}
          action={<Button>New application</Button>}
          tabs={<nav aria-label="Status">tabs</nav>}
        />
      </AppLayout>,
    )
    const header = document.querySelector("[data-slot=page-title]")!
    expect(header).toHaveAttribute("data-variant", "band")
    expect(header).toHaveClass("bg-card", "pb-0")
    const crumbs = header.querySelector("[data-slot=page-title-breadcrumbs]") as HTMLElement
    expect(within(crumbs).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    expect(within(crumbs).getByText("Applications").closest("[aria-current=page]")).not.toBeNull()
    // The band shows the trail, so the layout drops its own copy.
    expect(document.querySelector("[data-slot=app-layout-breadcrumbs]")).toBeNull()
    expect(screen.getByRole("heading", { level: 1, name: "Applications" })).toHaveClass("text-xl")
    expect(screen.getByText("Every island")).toHaveAttribute("data-slot", "page-title-subtitle")
    expect(screen.getByText("67 open").parentElement).toHaveAttribute("data-slot", "page-title-tags")
    const figures = header.querySelector("[data-slot=page-title-figures]")!
    expect(figures.tagName).toBe("DL")
    expect(within(figures as HTMLElement).getByText("In review").tagName).toBe("DT")
    expect(within(figures as HTMLElement).getByText("34").tagName).toBe("DD")
    expect(screen.getByRole("navigation", { name: "Status" }).parentElement).toHaveAttribute(
      "data-slot",
      "page-title-tabs",
    )
    await expectNoA11yViolations()
  })

  it("stays plain outside a panel layout, for sub-headings and with variant=plain", () => {
    const { rerender } = renderWithOnu(
      <AppLayout>
        <PageTitle title="Details" headingLevel={2} />
      </AppLayout>,
    )
    expect(document.querySelector("[data-slot=page-title]")).toHaveAttribute("data-variant", "plain")
    rerender(<PageTitle title="Users" />)
    expect(document.querySelector("[data-slot=page-title]")).toHaveAttribute("data-variant", "plain")
    rerender(
      <PageTitle title="Users" variant="band" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Users" }]} />,
    )
    const band = document.querySelector("[data-slot=page-title]")!
    expect(band).toHaveAttribute("data-variant", "band")
    // Outside a panel the band does not bleed: it has its own padding and bottom border.
    expect(band).toHaveClass("border-b")
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
  })
})

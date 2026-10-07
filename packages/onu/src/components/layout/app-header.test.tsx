import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SidebarProvider } from "../../ui/sidebar"
import { AppHeader, appHeaderVariants } from "./app-header"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("AppHeader", () => {
  it("renders logo, content and actions in a sticky banner", async () => {
    renderWithOnu(
      <AppHeader
        logo={<span>Onu</span>}
        actions={<button type="button">Account</button>}
        className="extra"
        classNames={{ start: "st", center: "ct", end: "en" }}
      >
        <span>Search</span>
      </AppHeader>,
    )
    const header = screen.getByRole("banner")
    expect(header).toHaveClass("extra", "sticky", "border-b")
    expect(screen.getByText("Onu").parentElement).toHaveClass("st")
    expect(screen.getByText("Search").parentElement).toHaveClass("ct")
    expect(screen.getByRole("button", { name: "Account" }).parentElement).toHaveClass("en")
    await expectNoA11yViolations()
  })

  it("shows the sidebar toggle inside a SidebarProvider", () => {
    renderWithOnu(
      <SidebarProvider>
        <AppHeader sidebarTrigger logo="Onu" variant="primary" sticky={false} />
      </SidebarProvider>,
    )
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeInTheDocument()
    expect(screen.getByRole("banner")).not.toHaveClass("sticky")
    expect(screen.getByRole("banner")).toHaveAttribute("data-variant", "primary")
    expect(appHeaderVariants({ variant: "plain" })).not.toContain("border-b")
  })

  it.each(directions)("works in %s", async (dir) => {
    renderWithOnu(
      <SidebarProvider>
        <AppHeader sidebarTrigger>ޑޭޝްބޯޑް</AppHeader>
      </SidebarProvider>,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("button", { name: "ސައިޑްބާރު ދައްކާ/ފޮރުވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

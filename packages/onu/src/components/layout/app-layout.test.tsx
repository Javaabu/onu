import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TooltipProvider } from "../../ui/tooltip"
import { AppHeader } from "./app-header"
import { AppLayout } from "./app-layout"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

function Shell(props: Partial<React.ComponentProps<typeof AppLayout>>) {
  return (
    <TooltipProvider>
      <AppLayout
        sidebar={<AppSidebar items={[{ label: "Dashboard", href: "/", icon: "home" }]} currentHref="/" />}
        header={<AppHeader sidebarTrigger logo={<span>Onu</span>} actions={<button type="button">Bell</button>} />}
        footer={<footer>Footer</footer>}
        {...props}
      >
        <h1>Dashboard</h1>
      </AppLayout>
    </TooltipProvider>
  )
}

describe("AppLayout", () => {
  it("renders skip link, sidebar, header, main and footer landmarks", async () => {
    renderWithOnu(
      <Shell className="extra" classNames={{ main: "mn", content: "cnt", body: "bdy" }} contentWidth="narrow" />,
    )
    expect(screen.getByRole("banner")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument()
    const main = screen.getByRole("main")
    expect(main).toHaveAttribute("id", "main-content")
    expect(main).toHaveClass("mn")
    expect(screen.getByText("Dashboard", { selector: "h1" }).parentElement).toHaveClass("cnt", "max-w-3xl")
    expect(document.querySelector("[data-slot=app-layout]")).toHaveClass("extra")
    expect(document.querySelector("[data-slot=app-layout-body]")).toHaveClass("bdy")
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("starts with the skip link and moves focus to main", async () => {
    renderWithOnu(<Shell mainId="content" />)
    await userEvent.tab()
    const skip = screen.getByRole("link", { name: "Skip to content" })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute("href", "#content")
    await userEvent.click(skip)
    expect(screen.getByRole("main")).toHaveFocus()
  })

  it("collapses the sidebar (controlled) and can drop the skip link", async () => {
    const onSidebarOpenChange = vi.fn()
    renderWithOnu(<Shell sidebarOpen onSidebarOpenChange={onSidebarOpenChange} skipLink={false} />)
    expect(screen.queryByRole("link", { name: "Skip to content" })).toBeNull()
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=sidebar-trigger]")!)
    expect(onSidebarOpenChange).toHaveBeenCalledWith(false)
  })

  it("pads the content for a bottom navigation", () => {
    renderWithOnu(
      <Shell bottomNav={<BottomNav items={[{ label: "Home", href: "/", icon: "home" }]} currentHref="/" />} />,
    )
    expect(screen.getByRole("main")).toHaveClass("pb-[calc(5rem+env(safe-area-inset-bottom))]")
    expect(screen.getByRole("navigation", { name: "Quick navigation" })).toBeInTheDocument()
  })

  it("is a white panel on the app shell by default, with a shell header and sidebar", () => {
    renderWithOnu(<Shell background="layout" />)
    expect(document.querySelector("[data-slot=app-layout]")).toHaveAttribute("data-variant", "panel")
    const panel = document.querySelector("[data-slot=app-layout-panel]")!
    expect(panel).toHaveAttribute("data-background", "layout")
    expect(panel).toHaveClass("md:rounded-ss-[12px]", "md:border-t", "md:border-s", "overflow-clip")
    expect(panel).toContainElement(screen.getByRole("main"))
    expect(panel).toContainElement(screen.getByRole("contentinfo"))
    expect(screen.getByRole("banner")).toHaveAttribute("data-variant", "shell")
    expect(document.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-surface", "shell")
  })

  it("flat: no panel, a bordered header and the sidebar colour", () => {
    renderWithOnu(<Shell variant="flat" />)
    expect(document.querySelector("[data-slot=app-layout-panel]")).toBeNull()
    expect(screen.getByRole("banner")).toHaveAttribute("data-variant", "default")
    expect(screen.getByRole("banner")).toHaveClass("border-b")
    expect(document.querySelector("[data-slot=sidebar]")).toHaveAttribute("data-surface", "sidebar")
  })

  it("shows its breadcrumbs above the content (a page header band shows them instead)", () => {
    renderWithOnu(<Shell breadcrumbs={[{ label: "Home", href: "/" }, { label: "Users" }]} />)
    const trail = document.querySelector("[data-slot=app-layout-breadcrumbs]")!
    expect(within(trail as HTMLElement).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("main")).toHaveClass(
      "[&:has([data-slot=page-title][data-variant=band])_[data-slot=app-layout-breadcrumbs]]:hidden",
    )
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(<Shell defaultSidebarOpen={false} />, { locale: "dv", dir })
    expect(screen.getByRole("link", { name: "ކޮންޓެންޓަށް ފުންމާލާ" })).toBeInTheDocument()
    expect(document.querySelector("[data-slot=sidebar-trigger]")).toHaveAccessibleName("ސައިޑްބާރު ދައްކާ/ފޮރުވާ")
    await expectNoA11yViolations()
  })
})

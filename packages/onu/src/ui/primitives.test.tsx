import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList } from "./breadcrumb"
import { Checkbox } from "./checkbox"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "./pagination"
import { Progress } from "./progress"
import { Slider } from "./slider"
import { Spinner } from "./spinner"

// Onu patches to vendored shadcn primitives (marked "onu:" in the sources).
describe("vendored primitive patches", () => {
  it("translates built-in labels", () => {
    renderWithOnu(
      <>
        <Spinner />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#p" />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#n" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </>,
      { locale: "dv" },
    )
    expect(document.querySelector("[data-slot=spinner]")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("navigation", { name: "ސަފްހާތައް" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "ކުރީގެ ސަފްހާއަށް" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "ދެން އޮތް ސަފްހާއަށް" })).toBeInTheDocument()
    expect(screen.getByText("އިތުރު ސަފްހާތައް")).toBeInTheDocument()
  })

  it("translates the dialog close button", () => {
    renderWithOnu(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
      { locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
  })

  it("does not double-mirror pagination chevrons", () => {
    const { container } = renderWithOnu(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#n" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    const svg = container.querySelector("[data-icon-name=chevron-right]")!
    expect(svg.getAttribute("class")).toContain("rtl:-scale-x-100")
    expect(svg.getAttribute("class")).not.toContain("rtl:rotate-180")
  })

  it("Progress exposes its value and fills from the inline start in RTL", () => {
    const { container, unmount } = renderWithOnu(<Progress value={40} aria-label="Upload" />)
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
    expect(container.querySelector("[data-slot=progress-indicator]")).toHaveStyle({ transform: "translateX(-60%)" })
    unmount()
    const rtl = renderWithOnu(<Progress value={40} aria-label="Upload" />, { dir: "rtl" })
    expect(rtl.container.querySelector("[data-slot=progress-indicator]")).toHaveStyle({ transform: "translateX(60%)" })
  })

  it("Slider thumbs have accessible names", async () => {
    renderWithOnu(
      <>
        <Slider aria-label="Volume" defaultValue={[30]} />
        <Slider defaultValue={[10, 80]} thumbLabels={["Minimum price", "Maximum price"]} />
      </>,
    )
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Maximum price" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("Checkbox shows a dash when indeterminate", () => {
    const { container } = renderWithOnu(<Checkbox aria-label="All" checked="indeterminate" />)
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed")
    expect(container.querySelector("[data-icon-name=minus]")).toBeInTheDocument()
  })
})

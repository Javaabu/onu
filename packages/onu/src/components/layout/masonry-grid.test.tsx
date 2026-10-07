import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { MasonryGrid, masonryColumnClasses } from "./masonry-grid"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("MasonryGrid", () => {
  it("wraps each child and uses responsive CSS columns", async () => {
    const { container } = renderWithOnu(
      <MasonryGrid className="extra" itemClassName="itm" data-testid="grid">
        <div>One</div>
        {null}
        <div>Two</div>
        {false}
      </MasonryGrid>,
    )
    const grid = screen.getByTestId("grid")
    expect(grid).toHaveClass("columns-1", "@sm/masonry:columns-2", "@4xl/masonry:columns-3", "extra", "gap-4")
    const items = container.querySelectorAll("[data-slot=masonry-item]")
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveClass("break-inside-avoid", "itm")
    await expectNoA11yViolations()
  })

  it("accepts a fixed count and per-breakpoint counts", () => {
    expect(masonryColumnClasses(4)).toEqual(["columns-4"])
    expect(masonryColumnClasses({ base: 2, md: 3, xl: 5 })).toEqual([
      "columns-2",
      "@xl/masonry:columns-3",
      "@6xl/masonry:columns-5",
    ])
    renderWithOnu(
      <MasonryGrid columns={3} gap="lg" data-testid="g">
        <p>x</p>
      </MasonryGrid>,
    )
    expect(screen.getByTestId("g")).toHaveClass("columns-3", "gap-6")
  })

  it.each(directions)("renders in %s", (dir) => {
    renderWithOnu(
      <MasonryGrid>
        <p>ހުޅުމާލެ</p>
      </MasonryGrid>,
      { locale: "dv", dir },
    )
    expect(screen.getByText("ހުޅުމާލެ")).toBeInTheDocument()
  })
})

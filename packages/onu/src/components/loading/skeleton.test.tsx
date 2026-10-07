import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SkeletonCard, SkeletonTable, SkeletonText } from "./skeleton"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const bars = (root: Element) => root.querySelectorAll("[data-slot=skeleton]")

describe("SkeletonText", () => {
  it("renders lines with a shorter last line, hidden from screen readers", async () => {
    renderWithOnu(<SkeletonText />)
    const root = screen.getByRole("status", { name: "Loading…" })
    expect(root).toHaveAttribute("data-slot", "skeleton-text")
    const lines = bars(root)
    expect(lines).toHaveLength(3)
    expect((lines[0] as HTMLElement).style.width).toBe("100%")
    expect((lines[2] as HTMLElement).style.width).toBe("60%")
    expect(root.firstElementChild).toHaveAttribute("aria-hidden", "true")
    await expectNoA11yViolations()
  })

  it("supports line count, widths, sizes, label and classNames", () => {
    renderWithOnu(
      <SkeletonText lines={4} widths={["40%", "80%"]} size="lg" label="Loading article" classNames={{ line: "l-x" }} />,
    )
    const lines = bars(screen.getByRole("status", { name: "Loading article" }))
    expect(lines).toHaveLength(4)
    expect(Array.from(lines).map((l) => (l as HTMLElement).style.width)).toEqual(["40%", "80%", "40%", "80%"])
    expect(lines[0]).toHaveClass("h-6", "l-x")
  })

  it("uses a full-width single line", () => {
    renderWithOnu(<SkeletonText lines={1} size="sm" />)
    const line = bars(screen.getByRole("status"))[0] as HTMLElement
    expect(line.style.width).toBe("100%")
    expect(line).toHaveClass("h-3")
  })
})

describe("SkeletonCard", () => {
  it("renders title and lines by default", () => {
    renderWithOnu(<SkeletonCard className="card-x" />)
    const root = screen.getByRole("status")
    expect(root).toHaveClass("card-x")
    expect(bars(root)).toHaveLength(3)
  })

  it("adds media, avatar and actions", () => {
    renderWithOnu(
      <SkeletonCard media avatar lines={0} actions={2} classNames={{ media: "m-x", avatar: "a-x", action: "b-x" }} />,
    )
    const root = screen.getByRole("status")
    expect(root.querySelector(".m-x")).toBeInTheDocument()
    expect(root.querySelector(".a-x")).toBeInTheDocument()
    expect(root.querySelectorAll(".b-x")).toHaveLength(2)
  })
})

describe("SkeletonTable", () => {
  it("renders a header and rows of cells", async () => {
    renderWithOnu(<SkeletonTable />)
    const root = screen.getByRole("status")
    expect(root).toHaveClass("@container/skeleton-table")
    // 1 header + 5 rows, 4 columns each.
    expect(bars(root)).toHaveLength(24)
    await expectNoA11yViolations()
  })

  it("hides columns after the second in narrow containers (cards on phones)", () => {
    renderWithOnu(
      <SkeletonTable rows={1} columns={3} header={false} selectable classNames={{ row: "r-x", cell: "c-x" }} />,
    )
    const row = screen.getByRole("status").querySelector(".r-x")!
    const cells = row.querySelectorAll(".c-x")
    expect(cells).toHaveLength(3)
    expect(cells[2]).toHaveClass("hidden", "@md/skeleton-table:block")
    expect(cells[1]).not.toHaveClass("hidden")
    // The checkbox column.
    expect(row.querySelectorAll("[data-slot=skeleton]")).toHaveLength(4)
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<SkeletonTable />, { locale: "dv", dir })
    expect(screen.getByRole("status", { name: "ލޯޑުވަނީ…" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

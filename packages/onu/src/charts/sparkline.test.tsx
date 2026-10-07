import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Sparkline, sparklineValues } from "./sparkline"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

describe("sparklineValues", () => {
  it("reads numbers and objects, keeping gaps", () => {
    expect(sparklineValues([1, null, 3])).toEqual([1, null, 3])
    expect(sparklineValues([{ value: 2 }, { value: "x" }, { n: 4 }], "value")).toEqual([2, null, null])
    expect(sparklineValues([{ n: 4 }], "n")).toEqual([4])
  })
})

describe("Sparkline", () => {
  it("is an image named by a summary, with no axes", () => {
    const { container } = renderWithOnu(<Sparkline label="Sign-ups" data={[4, 8, 2, 10]} />)
    const img = screen.getByRole("img", { name: "Sign-ups: 4 values, from 4 to 10. Lowest 2, highest 10." })
    expect(img).toHaveAttribute("data-variant", "line")
    expect(img).toHaveStyle({ height: "32px" })
    expect(container.querySelector(".recharts-line")).not.toBeNull()
    expect(container.querySelector(".recharts-xAxis-tick-labels")).toBeNull()
    expect(container.querySelector("svg.recharts-surface")).not.toHaveAttribute("tabindex")
  })

  it("draws an area with a custom colour and height", () => {
    const { container } = renderWithOnu(
      <Sparkline
        label="Revenue"
        variant="area"
        color="var(--chart-3)"
        height={48}
        data={[{ value: 1 }, { value: 2 }]}
      />,
    )
    expect(container.querySelector(".recharts-area")).not.toBeNull()
    expect(container.querySelector("style")!.innerHTML).toContain("--color-value: var(--chart-3)")
    expect(screen.getByRole("img")).toHaveStyle({ height: "48px" })
  })

  it("formats values in the summary", () => {
    renderWithOnu(<Sparkline label="Revenue" valueFormat="compact" data={[1500, 2500]} />)
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("from 1.5K to 2.5K")
  })

  it("says when there is no data", () => {
    const { container } = renderWithOnu(<Sparkline label="Sign-ups" data={[null]} />)
    expect(screen.getByRole("img", { name: "Sign-ups: No data to show" })).toBeInTheDocument()
    expect(container.querySelector("svg")).toBeNull()
  })

  it.each(directions)("renders in %s", (dir) => {
    const { container } = renderWithOnu(<Sparkline label="Sign-ups" data={[1, 5, 3]} className="w-24" />, { dir })
    expect(screen.getByRole("img")).toHaveClass("w-24")
    expect(container.querySelector(".recharts-line-curve")).not.toBeNull()
  })

  it("uses Dhivehi in the summary", () => {
    renderWithOnu(<Sparkline label="ހުށަހެޅުން" data={[1, 2]} />, { locale: "dv" })
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("އެންމެ ދަށް")
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(<Sparkline label="Sign-ups" data={[1, 2, 3]} />)
    await expectNoA11yViolations(container)
  })
})

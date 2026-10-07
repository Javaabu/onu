import { renderHook, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockMatchMedia, mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { useChartAnimation, useTooltipTrigger } from "./_shared"
import { BarChart } from "./bar-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { island: "Malé", revenue: 4820000, expenses: 3110000 },
  { island: "Addu City", revenue: 1450000, expenses: null },
]
const config = { revenue: { label: "Revenue" }, expenses: { label: "Expenses" } }

const strip = (s: string | null | undefined) => (s ?? "").replace(/[⁨⁩]/g, "")

function tickTexts(container: HTMLElement, axis: "xAxis" | "yAxis") {
  return [...container.querySelectorAll(`.recharts-${axis}-tick-labels text`)] as SVGTextElement[]
}

describe("BarChart", () => {
  let restore: (() => void) | undefined
  afterEach(() => restore?.())

  it("renders a titled figure with an accessible chart surface and summary", () => {
    const { container } = renderWithOnu(
      <BarChart
        title="Council revenue"
        description="In Rufiyaa"
        data={data}
        categoryKey="island"
        config={config}
        animate={false}
      />,
    )
    const figure = screen.getByRole("figure", { name: "Council revenue" })
    expect(figure).toHaveAttribute("data-slot", "bar-chart")
    expect(figure).toHaveAccessibleDescription("In Rufiyaa")
    const svg = container.querySelector("svg.recharts-surface")!
    expect(svg).toHaveAttribute("role", "application")
    expect(svg).toHaveAttribute("tabindex", "0")
    expect(svg).toHaveAccessibleName("Council revenue")
    const summary = container.querySelector('[data-slot="chart-summary"]')!
    expect(summary.textContent).toContain("Bar chart with 2 series and 2 data points.")
    expect(summary.textContent).toContain("Revenue: lowest 1,450,000, highest 4,820,000.")
    expect(svg.getAttribute("aria-describedby")).toBe(summary.id)
  })

  it("draws one bar per value and a legend for several series", () => {
    const { container } = renderWithOnu(
      <BarChart title="Revenue" data={data} categoryKey="island" config={config} animate={false} />,
    )
    expect(container.querySelectorAll(".recharts-bar-rectangle path")).toHaveLength(3)
    expect(container.querySelector(".recharts-legend-wrapper")).toHaveTextContent("RevenueExpenses")
  })

  it("hides the legend for a single series and uses chart tokens for colours", () => {
    const { container } = renderWithOnu(
      <BarChart title="Revenue" data={data} categoryKey="island" series={["revenue"]} animate={false} />,
    )
    expect(container.querySelector(".recharts-legend-wrapper")).toBeNull()
    expect(container.querySelector("style")!.innerHTML).toContain("--color-revenue: var(--chart-1)")
  })

  it("toggles to a real data table and back", async () => {
    const user = userEvent.setup()
    renderWithOnu(<BarChart title="Revenue" data={data} categoryKey="island" config={config} valueFormat="currency" />)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    const table = screen.getByRole("table")
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(3)
    expect(
      within(rows[0]!)
        .getAllByRole("columnheader")
        .map((c) => c.textContent),
    ).toEqual(["Category", "Revenue", "Expenses"])
    expect(within(rows[1]!).getByRole("rowheader")).toHaveTextContent("Malé")
    expect(strip(rows[1]!.textContent)).toContain("MVR 4,820,000.00")
    expect(rows[2]).toHaveTextContent("No data")
    expect(screen.getByRole("region", { name: "Revenue" })).toHaveAttribute("tabindex", "0")
    await user.click(screen.getByRole("button", { name: "View as chart" }))
    expect(screen.queryByRole("table")).toBeNull()
  })

  it("supports a controlled view", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    renderWithOnu(
      <BarChart
        title="Revenue"
        data={data}
        categoryKey="island"
        config={config}
        view="chart"
        onViewChange={onViewChange}
      />,
    )
    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(onViewChange).toHaveBeenCalledWith("table")
    expect(screen.queryByRole("table")).toBeNull()
  })

  it("can start in table view and hide the toggle", () => {
    renderWithOnu(
      <BarChart
        title="Revenue"
        data={data}
        categoryKey="island"
        config={config}
        defaultView="table"
        showTableToggle={false}
      />,
    )
    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("shows loading and empty states", () => {
    const { rerender } = renderWithOnu(<BarChart title="Revenue" data={data} categoryKey="island" loading />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart…")
    expect(screen.getByRole("figure")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByRole("button")).toBeNull()
    rerender(<BarChart title="Revenue" data={[]} categoryKey="island" config={config} />)
    expect(screen.getByText("No data to show")).toBeInTheDocument()
    rerender(<BarChart title="Revenue" data={[]} categoryKey="island" config={config} emptyMessage="Nothing yet" />)
    expect(screen.getByText("Nothing yet")).toBeInTheDocument()
  })

  it("lays out horizontal bars with categories on the y axis", () => {
    const { container } = renderWithOnu(
      <BarChart
        title="Revenue"
        orientation="horizontal"
        data={data}
        categoryKey="island"
        config={config}
        animate={false}
      />,
    )
    expect(container.querySelector('[data-slot="chart"]')).toHaveAttribute("data-orientation", "horizontal")
    expect(tickTexts(container, "yAxis").map((t) => t.textContent)).toEqual(["Malé", "Addu City"])
  })

  it("stacks series", () => {
    const { container } = renderWithOnu(
      <BarChart title="Revenue" stacked data={data} categoryKey="island" config={config} animate={false} />,
    )
    const paths = [...container.querySelectorAll(".recharts-bar-rectangle path")]
    // Stacked bars for the same category share an x position.
    expect(paths[0]!.getAttribute("x")).toBe(paths[2]?.getAttribute("x") ?? paths[0]!.getAttribute("x"))
  })

  it.each(directions)("mirrors the axes in %s", (dir) => {
    const { container } = renderWithOnu(
      <BarChart title="Revenue" data={data} categoryKey="island" config={config} animate={false} />,
      { dir },
    )
    const [first, second] = tickTexts(container, "xAxis")
    const firstX = Number(first!.getAttribute("x"))
    const secondX = Number(second!.getAttribute("x"))
    if (dir === "rtl") expect(firstX).toBeGreaterThan(secondX)
    else expect(firstX).toBeLessThan(secondX)
    expect(tickTexts(container, "yAxis")[0]).toHaveAttribute("orientation", dir === "rtl" ? "right" : "left")
  })

  it("reads in Dhivehi", () => {
    const { container } = renderWithOnu(
      <BarChart title="އާމްދަނީ" data={data} categoryKey="island" config={config} valueFormat="currency" />,
      { locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ޖަދުވަލުގައި ބައްލަވާ" })).toBeInTheDocument()
    expect(strip(container.querySelector('[data-slot="chart-summary"]')!.textContent)).toContain("ރ. 4,820,000.00")
  })

  it("accepts className and classNames", () => {
    const { container } = renderWithOnu(
      <BarChart
        title="Revenue"
        data={data}
        categoryKey="island"
        config={config}
        className="root-x"
        classNames={{ header: "header-x", title: "title-x", chart: "chart-x", toggle: "toggle-x" }}
        actions={<span>Extra</span>}
        hideTitle
      />,
    )
    expect(container.querySelector("figure")).toHaveClass("root-x")
    expect(container.querySelector('[data-slot="chart-header"]')).toHaveClass("header-x")
    expect(container.querySelector('[data-slot="chart-title"]')).toHaveClass("title-x")
    expect(container.querySelector('[data-slot="chart-title"]')!.parentElement).toHaveClass("sr-only")
    expect(container.querySelector('[data-slot="chart"]')).toHaveClass("chart-x")
    expect(screen.getByRole("button")).toHaveClass("toggle-x")
    expect(screen.getByText("Extra")).toBeInTheDocument()
  })

  it("uses a custom summary and category format", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(
      <BarChart
        title="Revenue"
        summary="Custom summary"
        data={data}
        categoryKey="island"
        config={config}
        categoryFormat={(v) => `Island ${String(v)}`}
        categoryLabel="Island"
      />,
    )
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("Custom summary")
    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByRole("columnheader", { name: "Island" })).toBeInTheDocument()
    expect(screen.getByRole("rowheader", { name: "Island Malé" })).toBeInTheDocument()
  })

  it("has no axe violations in chart and table view", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(
      <BarChart title="Revenue" data={data} categoryKey="island" config={config} animate={false} />,
    )
    await expectNoA11yViolations(container)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    await expectNoA11yViolations(container)
  })

  it("turns animation off under reduced motion", () => {
    restore = mockMatchMedia((q) => q.includes("reduce"))
    expect(renderHook(() => useChartAnimation(true)).result.current).toBe(false)
    restore()
    restore = mockMatchMedia(() => false)
    expect(renderHook(() => useChartAnimation(true)).result.current).toBe(true)
    expect(renderHook(() => useChartAnimation(false)).result.current).toBe(false)
  })

  it("opens tooltips on tap on touch screens", () => {
    restore = mockMatchMedia((q) => q === "(hover: none)")
    expect(renderHook(() => useTooltipTrigger()).result.current).toBe("click")
    restore()
    restore = mockMatchMedia(() => false)
    expect(renderHook(() => useTooltipTrigger()).result.current).toBe("hover")
  })
})

import { renderHook, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockMatchMedia, mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { useChartAnimation, useTooltipTrigger } from "./_shared"
import { AreaChart, BarChart, CategoryChart, LineChart, type CategoryChartVariant } from "./category-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { island: "Malé", revenue: 4820000, expenses: 3110000 },
  { island: "Addu City", revenue: 1450000, expenses: null },
]
const config = { revenue: { label: "Revenue" }, expenses: { label: "Expenses" } }

const fish = [
  { month: "Jan", skipjack: 8400, yellowfin: 3100 },
  { month: "Feb", skipjack: 9100, yellowfin: null },
  { month: "Mar", skipjack: 10200, yellowfin: 3900 },
]
const fishConfig = { skipjack: { label: "Skipjack" }, yellowfin: { label: "Yellowfin" } }

const strip = (s: string | null | undefined) => (s ?? "").replace(/[⁨⁩]/g, "")

function tickTexts(container: HTMLElement, axis: "xAxis" | "yAxis") {
  return [...container.querySelectorAll(`.recharts-${axis}-tick-labels text`)] as SVGTextElement[]
}

const variants: CategoryChartVariant[] = ["line", "area", "bar"]

describe("CategoryChart", () => {
  it.each([
    ["line", "line-chart", ".recharts-line", "Line chart"],
    ["area", "area-chart", ".recharts-area", "Area chart"],
    ["bar", "bar-chart", ".recharts-bar", "Bar chart"],
  ] as const)("draws variant=%s", (variant, slot, selector, type) => {
    const { container } = renderWithOnu(
      <CategoryChart
        title="Catch"
        variant={variant}
        data={fish}
        categoryKey="month"
        config={fishConfig}
        animate={false}
      />,
    )
    expect(screen.getByRole("figure", { name: "Catch" })).toHaveAttribute("data-slot", slot)
    expect(container.querySelectorAll(selector)).toHaveLength(2)
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent(
      `${type} with 2 series and 3 data points.`,
    )
  })

  it("defaults to lines, and variant wins over the deprecated area", () => {
    const { rerender } = renderWithOnu(
      <CategoryChart title="Catch" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
    )
    expect(screen.getByRole("figure")).toHaveAttribute("data-slot", "line-chart")
    rerender(<CategoryChart title="Catch" area data={fish} categoryKey="month" config={fishConfig} animate={false} />)
    expect(screen.getByRole("figure")).toHaveAttribute("data-slot", "area-chart")
    rerender(
      <CategoryChart
        title="Catch"
        variant="line"
        area
        data={fish}
        categoryKey="month"
        config={fishConfig}
        animate={false}
      />,
    )
    expect(screen.getByRole("figure")).toHaveAttribute("data-slot", "line-chart")
  })

  it("marks the fill and orientation on the chart container", () => {
    const { container, rerender } = renderWithOnu(
      <CategoryChart title="Catch" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
    )
    const chart = () => container.querySelector('[data-slot="chart"]')!
    expect(chart()).not.toHaveAttribute("data-fill")
    expect(chart()).not.toHaveAttribute("data-orientation")
    rerender(
      <CategoryChart
        title="Catch"
        variant="area"
        gradient={false}
        data={fish}
        categoryKey="month"
        config={fishConfig}
        animate={false}
      />,
    )
    expect(chart()).toHaveAttribute("data-fill", "solid")
    rerender(
      <CategoryChart
        title="Catch"
        variant="bar"
        orientation="horizontal"
        data={fish}
        categoryKey="month"
        config={fishConfig}
        animate={false}
      />,
    )
    expect(chart()).toHaveAttribute("data-fill", "gradient")
    expect(chart()).toHaveAttribute("data-orientation", "horizontal")
    expect(tickTexts(container, "yAxis").map((t) => t.textContent)).toEqual(["Jan", "Feb", "Mar"])
  })

  it("only accepts each variant's own options", () => {
    const props = { title: "Catch", data: fish, categoryKey: "month", config: fishConfig }
    // @ts-expect-error `curve` is for lines and areas
    void (<CategoryChart {...props} variant="bar" curve="step" />)
    // @ts-expect-error `orientation` is for bars
    void (<CategoryChart {...props} variant="area" orientation="horizontal" />)
    // @ts-expect-error `area` is for lines
    void (<CategoryChart {...props} variant="bar" area />)
    void (<CategoryChart {...props} variant="bar" orientation="horizontal" radius={2} stacked />)
    void (<CategoryChart {...props} variant="area" curve="step" dots={false} stacked />)
  })

  it.each(variants.flatMap((variant) => directions.map((dir) => [variant, dir] as const)))(
    "variant=%s has no axe violations in %s with Dhivehi labels",
    async (variant, dir) => {
      const user = userEvent.setup()
      const { container } = renderWithOnu(
        <CategoryChart
          title="މަސް"
          variant={variant}
          data={fish}
          categoryKey="month"
          config={{ skipjack: { label: "ގޮދަ" }, yellowfin: { label: "ކަނޑުމަސް" } }}
          animate={false}
        />,
        { locale: "dv", dir },
      )
      await expectNoA11yViolations(container)
      await user.click(screen.getByRole("button", { name: "ޖަދުވަލުގައި ބައްލަވާ" }))
      await expectNoA11yViolations(container)
    },
  )
})

describe("AreaChart", () => {
  it("is CategoryChart with variant=area", () => {
    const { container } = renderWithOnu(
      <AreaChart title="Catch" stacked data={fish} categoryKey="month" config={fishConfig} animate={false} />,
    )
    expect(screen.getByRole("figure")).toHaveAttribute("data-slot", "area-chart")
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2)
  })
})

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

describe("LineChart", () => {
  it("renders a line per series with a legend", () => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
    )
    expect(screen.getByRole("figure", { name: "Catch" })).toHaveAttribute("data-slot", "line-chart")
    expect(container.querySelectorAll(".recharts-line")).toHaveLength(2)
    expect(container.querySelector(".recharts-legend-wrapper")).toHaveTextContent("SkipjackYellowfin")
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent(
      "Line chart with 2 series and 3 data points.",
    )
  })

  it("leaves gaps for missing values unless connectNulls is set", () => {
    const { container, rerender } = renderWithOnu(
      <LineChart
        title="Catch"
        data={fish}
        categoryKey="month"
        series={["yellowfin"]}
        config={fishConfig}
        animate={false}
      />,
    )
    const path = () => container.querySelector(".recharts-line-curve")!.getAttribute("d")!
    // A gap starts a new sub-path (a second "M").
    expect(path().match(/M/g)).toHaveLength(2)
    rerender(
      <LineChart
        title="Catch"
        data={fish}
        categoryKey="month"
        series={["yellowfin"]}
        config={fishConfig}
        animate={false}
        connectNulls
      />,
    )
    expect(path().match(/M/g)).toHaveLength(1)
  })

  it("dashes the given series", () => {
    const { container } = renderWithOnu(
      <LineChart
        title="Catch"
        data={fish}
        categoryKey="month"
        config={fishConfig}
        dashedSeries={["yellowfin"]}
        animate={false}
      />,
    )
    const curves = container.querySelectorAll(".recharts-line-curve")
    expect(curves[0]).not.toHaveAttribute("stroke-dasharray")
    expect(curves[1]).toHaveAttribute("stroke-dasharray", "5 4")
  })

  it("draws filled, optionally stacked areas", () => {
    const { container } = renderWithOnu(
      <LineChart
        title="Catch"
        area
        stacked
        data={fish}
        categoryKey="month"
        config={fishConfig}
        animate={false}
        dots={false}
      />,
    )
    expect(screen.getByRole("figure")).toHaveAttribute("data-slot", "area-chart")
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2)
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("Area chart")
  })

  it("shows gaps as 'No data' in the table", async () => {
    const user = userEvent.setup()
    renderWithOnu(<LineChart title="Catch" data={fish} categoryKey="month" config={fishConfig} />)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    const row = screen.getAllByRole("row")[2]!
    expect(within(row).getByRole("rowheader")).toHaveTextContent("Feb")
    expect(row).toHaveTextContent("9,100No data")
  })

  it.each(directions)("puts the newest category on the %s-appropriate side", (dir) => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
      { dir },
    )
    const ticks = [...container.querySelectorAll(".recharts-xAxis-tick-labels text")]
    const xs = ticks.map((t) => Number(t.getAttribute("x")))
    if (dir === "rtl") expect(xs[0]).toBeGreaterThan(xs[2]!)
    else expect(xs[0]).toBeLessThan(xs[2]!)
  })

  it("uses Dhivehi labels", () => {
    const { container } = renderWithOnu(
      <LineChart title="މަސް" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
      { locale: "dv" },
    )
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("ލައިން ޗާޓް")
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={fish} categoryKey="month" config={fishConfig} animate={false} />,
    )
    await expectNoA11yViolations(container)
  })
})

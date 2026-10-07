import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { LineChart } from "./line-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { month: "Jan", skipjack: 8400, yellowfin: 3100 },
  { month: "Feb", skipjack: 9100, yellowfin: null },
  { month: "Mar", skipjack: 10200, yellowfin: 3900 },
]
const config = { skipjack: { label: "Skipjack" }, yellowfin: { label: "Yellowfin" } }

describe("LineChart", () => {
  it("renders a line per series with a legend", () => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={data} categoryKey="month" config={config} animate={false} />,
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
        data={data}
        categoryKey="month"
        series={["yellowfin"]}
        config={config}
        animate={false}
      />,
    )
    const path = () => container.querySelector(".recharts-line-curve")!.getAttribute("d")!
    // A gap starts a new sub-path (a second "M").
    expect(path().match(/M/g)).toHaveLength(2)
    rerender(
      <LineChart
        title="Catch"
        data={data}
        categoryKey="month"
        series={["yellowfin"]}
        config={config}
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
        data={data}
        categoryKey="month"
        config={config}
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
        data={data}
        categoryKey="month"
        config={config}
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
    renderWithOnu(<LineChart title="Catch" data={data} categoryKey="month" config={config} />)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    const row = screen.getAllByRole("row")[2]!
    expect(within(row).getByRole("rowheader")).toHaveTextContent("Feb")
    expect(row).toHaveTextContent("9,100No data")
  })

  it.each(directions)("puts the newest category on the %s-appropriate side", (dir) => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={data} categoryKey="month" config={config} animate={false} />,
      { dir },
    )
    const ticks = [...container.querySelectorAll(".recharts-xAxis-tick-labels text")]
    const xs = ticks.map((t) => Number(t.getAttribute("x")))
    if (dir === "rtl") expect(xs[0]).toBeGreaterThan(xs[2]!)
    else expect(xs[0]).toBeLessThan(xs[2]!)
  })

  it("uses Dhivehi labels", () => {
    const { container } = renderWithOnu(
      <LineChart title="މަސް" data={data} categoryKey="month" config={config} animate={false} />,
      { locale: "dv" },
    )
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("ލައިން ޗާޓް")
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={data} categoryKey="month" config={config} animate={false} />,
    )
    await expectNoA11yViolations(container)
  })
})

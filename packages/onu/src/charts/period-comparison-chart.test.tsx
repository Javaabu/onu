import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { PeriodComparisonChart, rowChange } from "./period-comparison-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { day: "Sun", current: 120, previous: 100 },
  { day: "Mon", current: 80, previous: 100 },
  { day: "Tue", current: null, previous: 50 },
]

const strip = (s: string | null | undefined) => (s ?? "").replace(/[⁨⁩]/g, "")

describe("rowChange", () => {
  it("returns the ratio or null", () => {
    expect(rowChange(data[0]!, "current", "previous")).toBeCloseTo(0.2)
    expect(rowChange(data[2]!, "current", "previous")).toBeNull()
    expect(rowChange({ current: 5, previous: 0 }, "current", "previous")).toBeNull()
  })
})

describe("PeriodComparisonChart", () => {
  it("shows totals, the delta with an icon and sign, and both series", () => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart title="Applications" data={data} categoryKey="day" animate={false} />,
    )
    expect(container.querySelector('[data-slot="period-current-total"]')).toHaveTextContent("200")
    expect(container.querySelector('[data-slot="period-previous-total"]')).toHaveTextContent("250")
    const delta = container.querySelector('[data-slot="period-totals"] [data-slot="delta-indicator"]')!
    expect(delta).toHaveAttribute("data-direction", "down")
    expect(delta).toHaveAttribute("data-sentiment", "negative")
    expect(delta).toHaveTextContent("−20%")
    expect(delta.querySelector('[data-icon-name="arrow-down"]')).not.toBeNull()
    expect(container.querySelectorAll(".recharts-line")).toHaveLength(2)
    expect(container.querySelector(".recharts-line-curve")).toHaveAttribute("stroke-dasharray", "5 4")
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent(
      "This period: 200. Previous period: 250. Down 20%",
    )
  })

  it("treats a fall as good when positiveIsGood is false", () => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart title="Costs" data={data} categoryKey="day" positiveIsGood={false} animate={false} />,
    )
    expect(container.querySelector('[data-slot="period-totals"] [data-slot="delta-indicator"]')).toHaveAttribute(
      "data-sentiment",
      "positive",
    )
  })

  it("draws grouped bars and custom labels", () => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart
        title="Costs"
        variant="bar"
        data={data}
        categoryKey="day"
        currentLabel="2026"
        previousLabel="2025"
        valueFormat="currency"
        animate={false}
      />,
    )
    expect(container.querySelectorAll(".recharts-bar")).toHaveLength(2)
    expect(container.querySelector(".recharts-legend-wrapper")).toHaveTextContent("20252026")
    expect(strip(container.querySelector('[data-slot="period-current-total"]')!.textContent)).toBe("MVR 200.00")
  })

  it("averages and can hide totals", () => {
    const { container, rerender } = renderWithOnu(
      <PeriodComparisonChart title="Applications" data={data} categoryKey="day" aggregate="average" />,
    )
    expect(container.querySelector('[data-slot="period-current-total"]')).toHaveTextContent("100")
    rerender(<PeriodComparisonChart title="Applications" data={data} categoryKey="day" hideTotals />)
    expect(container.querySelector('[data-slot="period-totals"]')).toBeNull()
  })

  it("says 'No change' for equal totals", () => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart title="Flat" data={[{ day: "Sun", current: 5, previous: 5 }]} categoryKey="day" />,
    )
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("No change")
  })

  it("adds a change column to the table", async () => {
    const user = userEvent.setup()
    renderWithOnu(<PeriodComparisonChart title="Applications" data={data} categoryKey="day" />)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByRole("columnheader", { name: "Change" })).toBeInTheDocument()
    const rows = screen.getAllByRole("row")
    expect(within(rows[1]!).getAllByRole("cell")[2]).toHaveTextContent("Up 20%")
    expect(within(rows[3]!).getAllByRole("cell")[0]).toHaveTextContent("No data")
    expect(within(rows[3]!).getAllByRole("cell")[2]).toHaveTextContent("No data")
  })

  it.each(directions)("mirrors the category axis in %s", (dir) => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart title="Applications" data={data} categoryKey="day" animate={false} />,
      { dir },
    )
    const ticks = [...container.querySelectorAll(".recharts-xAxis-tick-labels text")]
    const x = (label: string) => Number(ticks.find((t) => t.textContent === label)!.getAttribute("x"))
    if (dir === "rtl") expect(x("Sun")).toBeGreaterThan(x("Tue"))
    else expect(x("Sun")).toBeLessThan(x("Tue"))
  })

  it("uses Dhivehi defaults", () => {
    renderWithOnu(<PeriodComparisonChart title="ހުށަހެޅުން" data={data} categoryKey="day" animate={false} />, {
      locale: "dv",
    })
    expect(screen.getAllByText("މި މުއްދަތު").length).toBeGreaterThan(0)
    expect(screen.getAllByText("ކުރީގެ މުއްދަތު").length).toBeGreaterThan(0)
  })

  it("shows the empty state", () => {
    renderWithOnu(<PeriodComparisonChart title="Applications" data={[]} categoryKey="day" />)
    expect(screen.getByText("No data to show")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(
      <PeriodComparisonChart title="Applications" data={data} categoryKey="day" animate={false} />,
    )
    await expectNoA11yViolations(container)
  })
})

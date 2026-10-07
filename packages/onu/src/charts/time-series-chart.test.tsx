import { fireEvent, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { normalizeTimeSeries, TIME_KEY, TimeSeriesChart, toTimestamp } from "./time-series-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { date: "2026-01-03", arrivals: 5300 },
  { date: "2026-01-01", arrivals: 5120 },
  { date: "2026-01-02", arrivals: null },
  { date: "2026-01-05", arrivals: 6010 },
  { date: "not a date", arrivals: 1 },
]
const config = { arrivals: { label: "Arrivals" } }

describe("toTimestamp", () => {
  it("accepts dates, ISO strings and numbers", () => {
    expect(toTimestamp(new Date(0))).toBe(0)
    expect(toTimestamp(86400000)).toBe(86400000)
    expect(toTimestamp("2026-01-01T00:00:00Z")).toBe(Date.UTC(2026, 0, 1))
  })

  it("rejects invalid values", () => {
    expect(toTimestamp(new Date("x"))).toBeNull()
    expect(toTimestamp(Number.NaN)).toBeNull()
    expect(toTimestamp("x")).toBeNull()
    expect(toTimestamp(undefined)).toBeNull()
  })
})

describe("normalizeTimeSeries", () => {
  it("sorts oldest first and drops invalid dates", () => {
    const rows = normalizeTimeSeries(data, "date")
    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.arrivals)).toEqual([5120, null, 5300, 6010])
  })

  it("inserts empty rows for missing days", () => {
    const rows = normalizeTimeSeries(data, "date", "day")
    expect(rows).toHaveLength(5)
    expect(rows[3]).not.toHaveProperty("arrivals")
    expect(rows[3]![TIME_KEY]).toBeTypeOf("number")
  })

  it("fills hours, weeks and months", () => {
    const hours = normalizeTimeSeries(
      [
        { t: new Date(2026, 0, 1, 8), v: 1 },
        { t: new Date(2026, 0, 1, 11), v: 2 },
      ],
      "t",
      "hour",
    )
    expect(hours).toHaveLength(4)
    const weeks = normalizeTimeSeries(
      [
        { t: new Date(2026, 0, 1), v: 1 },
        { t: new Date(2026, 0, 22), v: 2 },
      ],
      "t",
      "week",
    )
    expect(weeks).toHaveLength(4)
    const months = normalizeTimeSeries(
      [
        { t: new Date(2026, 0, 1), v: 1 },
        { t: new Date(2026, 5, 1), v: 2 },
      ],
      "t",
      "month",
    )
    expect(months).toHaveLength(6)
  })

  it("leaves single rows alone", () => {
    expect(normalizeTimeSeries([{ date: "2026-01-01" }], "date", "day")).toHaveLength(1)
  })
})

describe("TimeSeriesChart", () => {
  it("renders a time axis formatted with the locale and a summary with the range", () => {
    const { container } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" data={data} config={config} animate={false} />,
    )
    expect(screen.getByRole("figure", { name: "Arrivals" })).toHaveAttribute("data-slot", "time-series-chart")
    const ticks = [...container.querySelectorAll(".recharts-xAxis-tick-labels text")].map((t) => t.textContent)
    expect(ticks.every((t) => /Jan/.test(t ?? ""))).toBe(true)
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("From 1 Jan 2026 to 5 Jan 2026.")
  })

  it("shows dates in Dhivehi", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TimeSeriesChart title="ފަތުރުވެރިން" data={data} config={config} />, { locale: "dv" })
    await user.click(screen.getByRole("button", { name: "ޖަދުވަލުގައި ބައްލަވާ" }))
    expect(screen.getByRole("columnheader", { name: "ތާރީޚު" })).toBeInTheDocument()
    const firstRow = screen.getAllByRole("row")[1]!
    expect(within(firstRow).getByRole("rowheader").textContent).toMatch(/2026/)
    expect(within(firstRow).getByRole("rowheader").textContent).not.toMatch(/Jan/)
  })

  it("lists gaps as 'No data' in chronological order", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TimeSeriesChart title="Arrivals" data={data} config={config} interval="day" />, { dir: "rtl" })
    await user.click(screen.getByRole("button", { name: "View as table" }))
    const rows = screen.getAllByRole("row").slice(1)
    expect(rows.map((r) => within(r).getByRole("rowheader").textContent)).toEqual([
      "1 Jan 2026",
      "2 Jan 2026",
      "3 Jan 2026",
      "4 Jan 2026",
      "5 Jan 2026",
    ])
    expect(rows[1]).toHaveTextContent("No data")
    expect(rows[3]).toHaveTextContent("No data")
  })

  it("uses interval-specific date formats", () => {
    const { rerender } = renderWithOnu(
      <TimeSeriesChart
        title="Tax"
        data={[
          { date: new Date(2026, 0, 1), tax: 1 },
          { date: new Date(2026, 1, 1), tax: 2 },
        ]}
        config={{ tax: { label: "Tax" } }}
        interval="month"
        defaultView="table"
      />,
    )
    expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("January 2026")
    rerender(
      <TimeSeriesChart
        title="Tax"
        data={[
          { date: new Date(2026, 0, 1, 9), tax: 1 },
          { date: new Date(2026, 0, 1, 10), tax: 2 },
        ]}
        config={{ tax: { label: "Tax" } }}
        interval="hour"
        defaultView="table"
      />,
    )
    expect(screen.getAllByRole("rowheader")[0]).toHaveTextContent("1 Jan 2026, 9:00 AM")
  })

  it.each(directions)("places the newest date on the correct side in %s", (dir) => {
    const { container } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" data={data} config={config} animate={false} />,
      { dir },
    )
    const ticks = [...container.querySelectorAll(".recharts-xAxis-tick-labels text")]
    const x = (label: string) => Number(ticks.find((t) => t.textContent === label)!.getAttribute("x"))
    const first = x("1 Jan")
    const last = x("5 Jan")
    if (dir === "rtl") expect(first).toBeGreaterThan(last)
    else expect(first).toBeLessThan(last)
  })

  it("zooms with the brush from the keyboard and resets", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" data={data} config={config} interval="day" brush animate={false} />,
    )
    const brush = container.querySelector(".recharts-brush")!
    expect(brush).toBeInTheDocument()
    const travellers = container.querySelectorAll(".recharts-brush-traveller")
    expect(travellers.length).toBe(2)
    fireEvent.focus(travellers[0]!)
    fireEvent.keyDown(travellers[0]!, { key: "ArrowRight" })
    const status = container.querySelector('[data-slot="chart-zoom-status"]')!
    expect(status).toHaveAttribute("aria-live", "polite")
    expect(status).toHaveTextContent("Showing 2 Jan 2026 to 5 Jan 2026")
    await user.click(screen.getByRole("button", { name: "Reset zoom" }))
    expect(screen.queryByRole("button", { name: "Reset zoom" })).toBeNull()
    expect(status).toHaveTextContent("")
  })

  it("draws areas and a legend for several series", () => {
    const { container } = renderWithOnu(
      <TimeSeriesChart
        title="Passengers"
        area
        data={data.map((d) => ({ ...d, departures: 10 }))}
        config={{ ...config, departures: { label: "Departures" } }}
        animate={false}
      />,
    )
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2)
    expect(container.querySelector(".recharts-legend-wrapper")).toHaveTextContent("ArrivalsDepartures")
  })

  const twoSeries = {
    data: [
      { date: "2026-01-01", male: 120, addu: 40 },
      { date: "2026-01-02", male: 140, addu: 35 },
      { date: "2026-01-03", male: 90, addu: 60 },
    ],
    config: { male: { label: "Malé" }, addu: { label: "Addu" } },
  }

  it("stacks areas, and draws stacked lines as stacked areas", () => {
    const { container, rerender } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" variant="area" stacked {...twoSeries} animate={false} />,
    )
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2)
    // Each band has its own edge on top of the one below.
    const tops = [...container.querySelectorAll(".recharts-area-curve")].map((c) => c.getAttribute("d"))
    expect(tops[0]).not.toEqual(tops[1])
    rerender(<TimeSeriesChart title="Arrivals" stacked {...twoSeries} animate={false} />)
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2)
    expect(container.querySelector(".recharts-line")).toBeNull()
  })

  it.each(directions)("draws stacked bars on the time axis with the data table intact (%s)", async (dir) => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" variant="bar" stacked {...twoSeries} animate={false} />,
      { dir },
    )
    const bars = [...container.querySelectorAll<SVGPathElement>(".recharts-bar-rectangle path")]
    expect(bars).toHaveLength(6)
    // Stacked: for the same day, the Addu bar starts where the Malé bar ends.
    const box = (el: Element) => ({ x: Number(el.getAttribute("x")), y: Number(el.getAttribute("y")) })
    const male = container.querySelectorAll(".recharts-bar")[0]!.querySelectorAll(".recharts-rectangle")
    const addu = container.querySelectorAll(".recharts-bar")[1]!.querySelectorAll(".recharts-rectangle")
    expect(box(addu[0]!).x).toBeCloseTo(box(male[0]!).x)
    expect(box(addu[0]!).y).toBeLessThan(box(male[0]!).y)
    // Newest (3 Jan, the shortest Malé bar) on the right in LTR and on the left in RTL.
    const maleBars = [...male].map((r) => ({ x: box(r).x, height: Number(r.getAttribute("height")) }))
    const newest = maleBars.reduce((a, b) => (b.height < a.height ? b : a))
    const xs = maleBars.map((b) => b.x)
    expect(newest.x).toBe(dir === "rtl" ? Math.min(...xs) : Math.max(...xs))
    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByRole("columnheader", { name: "Malé" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Addu" })).toBeInTheDocument()
    expect(screen.getAllByRole("row")[1]).toHaveTextContent(/1 Jan 2026.*120.*40/)
    await expectNoA11yViolations(container)
  })

  it("shows the empty state without valid dates", () => {
    renderWithOnu(<TimeSeriesChart title="Arrivals" data={[{ date: "x", arrivals: 1 }]} config={config} />)
    expect(screen.getByText("No data to show")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(
      <TimeSeriesChart title="Arrivals" data={data} config={config} brush animate={false} />,
    )
    await expectNoA11yViolations(container)
  })
})

import * as React from "react"
import { renderHook, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { renderWithOnu } from "../../test/utils"
import { areaGradient, barDirections, barGradient, ChartStyleProvider, useChartGradient } from "./_gradient"
import { BarChart } from "./bar-chart"
import { LineChart } from "./line-chart"
import { PeriodComparisonChart } from "./period-comparison-chart"
import { PieChart } from "./pie-chart"
import { Sparkline } from "./sparkline"
import { StatTile } from "./stat-tile"
import { TimeSeriesChart } from "./time-series-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { month: "Jan", skipjack: 8400, yellowfin: 3100 },
  { month: "Feb", skipjack: 9100, yellowfin: 3500 },
]
const config = { skipjack: { label: "Skipjack" }, yellowfin: { label: "Yellowfin" } }
const days = [
  { date: "2026-01-01", arrivals: 5120 },
  { date: "2026-01-02", arrivals: 5300 },
]

const gradients = (root: ParentNode) => [...root.querySelectorAll("linearGradient")]
const fills = (root: ParentNode, selector: string) =>
  [...root.querySelectorAll(selector)].map((el) => el.getAttribute("fill"))

describe("chart gradients", () => {
  it("defines one gradient per bar series and fills the bars with it", () => {
    const { container } = renderWithOnu(
      <BarChart title="Catch" data={data} categoryKey="month" config={config} animate={false} />,
    )
    const defs = gradients(container)
    expect(defs).toHaveLength(2)
    expect(container.querySelector("[data-fill]")).toHaveAttribute("data-fill", "gradient")
    const stop = defs[0]!.querySelector("stop")!
    expect(stop.style.stopColor).toBe("var(--color-skipjack)")
    const barFills = fills(container, ".recharts-bar-rectangle path")
    expect(barFills).toHaveLength(4)
    expect(barFills[0]).toBe(`url(#${defs[0]!.id})`)
    expect(barFills.at(-1)).toBe(`url(#${defs[1]!.id})`)
  })

  it("gives each chart instance its own gradient ids", () => {
    const { container } = renderWithOnu(
      <>
        <BarChart title="A" data={data} categoryKey="month" config={config} animate={false} />
        <BarChart title="B" data={data} categoryKey="month" config={config} animate={false} />
      </>,
    )
    const ids = gradients(container).map((g) => g.id)
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
    for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9_-]+$/)
  })

  it("draws solid fills with gradient={false}", () => {
    const { container } = renderWithOnu(
      <BarChart title="Catch" data={data} categoryKey="month" config={config} gradient={false} animate={false} />,
    )
    expect(gradients(container)).toHaveLength(0)
    expect(container.querySelector("[data-fill]")).toHaveAttribute("data-fill", "solid")
    expect(fills(container, ".recharts-bar-rectangle path")[0]).toBe("var(--color-skipjack)")
  })

  it("follows ChartStyleProvider, and the prop wins over it", () => {
    renderWithOnu(
      <ChartStyleProvider gradient={false}>
        <LineChart title="Off" data={data} categoryKey="month" config={config} area animate={false} />
        <LineChart title="On" data={data} categoryKey="month" config={config} area gradient animate={false} />
      </ChartStyleProvider>,
    )
    const [off, on] = screen.getAllByRole("figure")
    expect(gradients(off!)).toHaveLength(0)
    expect(fills(off!, ".recharts-area-area")[0]).toBe("var(--color-skipjack)")
    expect(gradients(on!)).toHaveLength(2)
    expect(fills(on!, ".recharts-area-area")[0]).toBe(`url(#${gradients(on!)[0]!.id})`)
  })

  it("useChartGradient defaults to true", () => {
    expect(renderHook(() => useChartGradient()).result.current).toBe(true)
    expect(renderHook(() => useChartGradient(false)).result.current).toBe(false)
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <ChartStyleProvider gradient={false}>{children}</ChartStyleProvider>
    )
    expect(renderHook(() => useChartGradient(), { wrapper }).result.current).toBe(false)
    expect(renderHook(() => useChartGradient(true), { wrapper }).result.current).toBe(true)
  })

  it("fades area fills and keeps lines solid", () => {
    const { container } = renderWithOnu(
      <LineChart title="Catch" data={data} categoryKey="month" config={config} area animate={false} />,
    )
    const [first] = gradients(container)
    expect(first).toHaveAttribute("y2", "1")
    const opacities = [...first!.querySelectorAll("stop")].map((s) => Number(s.style.stopOpacity))
    expect(opacities[0]).toBeGreaterThan(0.4)
    expect(opacities.at(-1)).toBeLessThan(0.06)
    expect(container.querySelector(".recharts-area-area")).toHaveAttribute("fill-opacity", "1")
    expect(container.querySelector(".recharts-area-curve")).toHaveAttribute("stroke", "var(--color-skipjack)")
  })

  it("adds no gradients to plain line charts or pies", () => {
    const { container } = renderWithOnu(
      <>
        <LineChart title="Lines" data={data} categoryKey="month" config={config} animate={false} />
        <TimeSeriesChart title="Arrivals" data={days} config={{ arrivals: { label: "Arrivals" } }} animate={false} />
        <PieChart
          title="Share"
          data={[
            { name: "A", value: 2 },
            { name: "B", value: 3 },
          ]}
          animate={false}
        />
      </>,
    )
    expect(gradients(container)).toHaveLength(0)
  })

  it("fills time-series areas and bars", () => {
    renderWithOnu(
      <>
        <TimeSeriesChart
          title="Area"
          data={days}
          config={{ arrivals: { label: "Arrivals" } }}
          variant="area"
          animate={false}
        />
        <TimeSeriesChart
          title="Bars"
          data={days}
          config={{ arrivals: { label: "Arrivals" } }}
          variant="bar"
          animate={false}
        />
      </>,
    )
    const [area, bars] = screen.getAllByRole("figure")
    expect(fills(area!, ".recharts-area-area")[0]).toMatch(/^url\(#onu-fill-/)
    expect(fills(bars!, ".recharts-bar-rectangle path")[0]).toMatch(/^url\(#onu-fill-/)
  })

  it("washes the current period and fills period bars", () => {
    const rows = [
      { day: "Sun", current: 120, previous: 98 },
      { day: "Mon", current: 140, previous: 120 },
    ]
    const { container } = renderWithOnu(
      <>
        <PeriodComparisonChart title="Lines" data={rows} categoryKey="day" animate={false} />
        <PeriodComparisonChart title="Bars" data={rows} categoryKey="day" variant="bar" animate={false} />
        <PeriodComparisonChart title="Solid" data={rows} categoryKey="day" gradient={false} animate={false} />
      </>,
    )
    const [lines, bars, solid] = screen.getAllByRole("figure")
    expect(fills(lines!, ".recharts-area-area")).toEqual([`url(#${gradients(lines!)[0]!.id})`])
    expect(lines!.querySelectorAll(".recharts-line")).toHaveLength(2)
    expect(gradients(bars!)).toHaveLength(2)
    expect(solid!.querySelectorAll(".recharts-area")).toHaveLength(0)
    expect(gradients(container)).toHaveLength(3)
  })

  it("fills sparkline and stat tile areas", () => {
    const { container } = renderWithOnu(
      <>
        <Sparkline label="Trend" data={[1, 3, 2]} variant="area" />
        <Sparkline label="Flat" data={[1, 3, 2]} variant="area" gradient={false} />
        <StatTile label="Applications" value={12} sparkline={[1, 3, 2]} />
      </>,
    )
    const areas = fills(container, ".recharts-area-area")
    expect(areas[0]).toMatch(/^url\(#onu-fill-/)
    expect(areas[1]).toBe("var(--color-value)")
    expect(areas[2]).toMatch(/^url\(#onu-fill-/)
    expect(areas[0]).not.toBe(areas[2])
  })

  it("keeps legend swatches solid", () => {
    const { container } = renderWithOnu(
      <BarChart title="Catch" data={data} categoryKey="month" config={config} animate={false} />,
    )
    const swatches = [...container.querySelectorAll<HTMLElement>(".recharts-legend-wrapper .rounded-\\[2px\\]")]
    expect(swatches.map((s) => s.style.backgroundColor)).toEqual(["var(--color-skipjack)", "var(--color-yellowfin)"])
  })

  it.each(["ltr", "rtl"] as const)("runs horizontal bar gradients towards the value end in %s", (dir) => {
    const { container } = renderWithOnu(
      <BarChart
        title="Catch"
        data={data}
        categoryKey="month"
        config={config}
        orientation="horizontal"
        animate={false}
      />,
      { dir },
    )
    const [first] = gradients(container)
    // The full colour (offset 1) sits at x2: right in LTR, left (mirrored) in RTL.
    expect(first).toHaveAttribute("x1", dir === "rtl" ? "1" : "0")
    expect(first).toHaveAttribute("x2", dir === "rtl" ? "0" : "1")
    expect(first).toHaveAttribute("y1", "0")
    expect(first).toHaveAttribute("y2", "0")
  })

  it("mirrors negative bars", () => {
    const { container } = renderWithOnu(
      <BarChart
        title="Change"
        data={[
          { month: "Jan", change: 4 },
          { month: "Feb", change: -2 },
        ]}
        categoryKey="month"
        config={{ change: { label: "Change" } }}
        animate={false}
      />,
    )
    const [up, down] = gradients(container)
    expect(up).toHaveAttribute("y1", "1")
    expect(down).toHaveAttribute("y1", "0")
    expect(fills(container, ".recharts-bar-rectangle path")).toEqual([`url(#${up!.id})`, `url(#${down!.id})`])
  })
})

describe("gradient helpers", () => {
  it("fades areas away from the zero line", () => {
    const offsets = (range: { min: number; max: number } | null) =>
      areaGradient("g", "red", range, { top: 0.5, base: 0 }, 0.15).stops.map((s) => [s.offset, s.opacity])
    expect(offsets({ min: 1, max: 10 })).toEqual([
      [0, 0.5],
      [1, 0],
    ])
    expect(offsets({ min: -10, max: -1 })).toEqual([
      [0, 0],
      [1, 0.5],
    ])
    expect(offsets({ min: -10, max: 30 })).toEqual([
      [0, 0.5],
      [0.75, 0],
      [1, 0.5],
    ])
  })

  it("points bars from base to value", () => {
    expect(barDirections(false, false)).toEqual({ positive: "up", negative: "down" })
    expect(barDirections(true, false)).toEqual({ positive: "right", negative: "left" })
    expect(barDirections(true, true)).toEqual({ positive: "left", negative: "right" })
    const bar = barGradient("g", "red", "up")
    expect([bar.x1, bar.y1, bar.x2, bar.y2]).toEqual([0, 1, 0, 0])
    expect(bar.stops.at(-1)!.opacity).toBe(1)
    expect(bar.solid).toBe(1)
  })
})

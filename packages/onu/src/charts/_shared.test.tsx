import * as React from "react"
import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mockMatchMedia, mockRecharts } from "../../test/recharts-mock"
import { renderWithOnu } from "../../test/utils"
import { ChartAnimationProvider, useChartAnimation } from "./_shared"
import { CategoryChart } from "./category-chart"
import { PieChart } from "./pie-chart"
import { Sparkline } from "./sparkline"
import { TimeSeriesChart } from "./time-series-chart"

/** `isAnimationActive` of every animated Recharts element rendered, by component. */
const animation = vi.hoisted(() => [] as { name: string; value: unknown }[])

vi.mock("recharts", async (importOriginal) => {
  const actual = mockRecharts(await importOriginal<Record<string, unknown>>())
  const spy = (name: string) => {
    const Actual = actual[name] as React.ComponentType<Record<string, unknown>>
    function Spy(props: Record<string, unknown>) {
      animation.push({ name, value: props.isAnimationActive })
      return <Actual {...props} />
    }
    return Object.assign(Spy, Actual)
  }
  return {
    ...actual,
    Area: spy("Area"),
    Bar: spy("Bar"),
    Line: spy("Line"),
    Pie: spy("Pie"),
    Tooltip: spy("Tooltip"),
  }
})

const cartesian = [
  { month: "Jan", skipjack: 8400, yellowfin: 3100 },
  { month: "Feb", skipjack: 9100, yellowfin: 3500 },
]
const config = { skipjack: { label: "Skipjack" }, yellowfin: { label: "Yellowfin" } }
const series = [
  { date: "2026-01-01", arrivals: 5120 },
  { date: "2026-01-02", arrivals: 5300 },
]

/** Every Onu chart that draws with Recharts, with each animated element it uses. */
const charts: { name: string; render: () => React.ReactElement; elements: string[] }[] = [
  {
    name: "CategoryChart (bar)",
    render: () => <CategoryChart variant="bar" title="Catch" data={cartesian} categoryKey="month" config={config} />,
    elements: ["Bar", "Tooltip"],
  },
  {
    name: "CategoryChart (line)",
    render: () => <CategoryChart title="Catch" data={cartesian} categoryKey="month" config={config} />,
    elements: ["Line", "Tooltip"],
  },
  {
    name: "CategoryChart (area)",
    render: () => <CategoryChart title="Catch" data={cartesian} categoryKey="month" config={config} variant="area" />,
    elements: ["Area", "Tooltip"],
  },
  {
    name: "PieChart",
    render: () => (
      <PieChart
        title="Channels"
        data={[
          { name: "eFaas", value: 6 },
          { name: "Council", value: 3 },
        ]}
      />
    ),
    elements: ["Pie", "Tooltip"],
  },
  {
    name: "TimeSeriesChart",
    render: () => <TimeSeriesChart title="Arrivals" data={series} config={{ arrivals: { label: "Arrivals" } }} />,
    elements: ["Line", "Tooltip"],
  },
  {
    name: "TimeSeriesChart (bar)",
    render: () => (
      <TimeSeriesChart title="Arrivals" data={series} config={{ arrivals: { label: "Arrivals" } }} variant="bar" />
    ),
    elements: ["Bar", "Tooltip"],
  },
  {
    name: "CategoryChart (comparison)",
    render: () => (
      <CategoryChart
        title="Applications"
        data={[
          { day: "Sun", current: 120, previous: 100 },
          { day: "Mon", current: 80, previous: 90 },
        ]}
        categoryKey="day"
        comparison={{ previousKey: "previous" }}
      />
    ),
    elements: ["Line", "Tooltip"],
  },
  {
    name: "TimeSeriesChart (comparison bar)",
    render: () => (
      <TimeSeriesChart
        title="Applications"
        data={[{ date: "2026-01-01", current: 120, previous: 100 }]}
        variant="bar"
        comparison={{ previousKey: "previous" }}
      />
    ),
    elements: ["Bar", "Tooltip"],
  },
  {
    name: "Sparkline",
    render: () => <Sparkline label="Sign-ups" data={[4, 8, 2]} animate />,
    elements: ["Line"],
  },
]

let restore = () => {}
afterEach(() => {
  restore()
  restore = () => {}
  animation.length = 0
})

function rendered(names: string[]) {
  const seen = new Set(animation.map((a) => a.name))
  for (const name of names) expect(seen, `${name} was rendered`).toContain(name)
  return animation.filter((a) => names.includes(a.name)).map((a) => a.value)
}

describe("chart animation", () => {
  it("useChartAnimation combines the prop, the provider and reduced motion", () => {
    restore = mockMatchMedia(() => false)
    expect(renderHook(() => useChartAnimation()).result.current).toBe(true)
    expect(renderHook(() => useChartAnimation(false)).result.current).toBe(false)
    const off = ({ children }: { children: React.ReactNode }) => (
      <ChartAnimationProvider animate={false}>{children}</ChartAnimationProvider>
    )
    expect(renderHook(() => useChartAnimation(true), { wrapper: off }).result.current).toBe(false)
    const on = ({ children }: { children: React.ReactNode }) => (
      <ChartAnimationProvider animate>{children}</ChartAnimationProvider>
    )
    expect(renderHook(() => useChartAnimation(true), { wrapper: on }).result.current).toBe(true)
    restore()
    // Reduced motion wins over a provider that turns animation on.
    restore = mockMatchMedia((q) => q === "(prefers-reduced-motion: reduce)")
    expect(renderHook(() => useChartAnimation(true), { wrapper: on }).result.current).toBe(false)
  })

  it.each(charts)("$name animates by default", ({ render, elements }) => {
    restore = mockMatchMedia(() => false)
    renderWithOnu(render())
    expect(rendered(elements).every((v) => v === true)).toBe(true)
  })

  it.each(charts)("$name passes isAnimationActive={false} under prefers-reduced-motion", ({ render, elements }) => {
    restore = mockMatchMedia((q) => q === "(prefers-reduced-motion: reduce)")
    renderWithOnu(render())
    const values = rendered(elements)
    expect(values.length).toBeGreaterThan(0)
    expect(values.every((v) => v === false)).toBe(true)
  })

  it.each(charts)("$name passes isAnimationActive={false} inside ChartAnimationProvider", ({ render, elements }) => {
    restore = mockMatchMedia(() => false)
    renderWithOnu(<ChartAnimationProvider animate={false}>{render()}</ChartAnimationProvider>)
    const values = rendered(elements)
    expect(values.length).toBeGreaterThan(0)
    expect(values.every((v) => v === false)).toBe(true)
  })
})

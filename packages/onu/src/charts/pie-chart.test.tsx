import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { PieChart, pieSlices } from "./pie-chart"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const data = [
  { name: "eFaas", value: 600 },
  { name: "Council", value: 300 },
  { name: "Walk-in", value: 100 },
]

describe("pieSlices", () => {
  it("computes shares and colours", () => {
    const slices = pieSlices(data, "name", "value", { Council: { label: "Island council", color: "red" } })
    expect(slices.map((s) => s.share)).toEqual([0.6, 0.3, 0.1])
    expect(slices[0]!.color).toBe("var(--chart-1)")
    expect(slices[1]).toMatchObject({ name: "Island council", color: "red", key: "slice-1" })
  })

  it("treats non-numeric and negative values as 0", () => {
    const slices = pieSlices([{ name: "a", value: "x" }, { name: "b", value: -5 }, { value: 0 }], "name", "value")
    expect(slices.map((s) => s.value)).toEqual([0, 0, 0])
    expect(slices.map((s) => s.share)).toEqual([0, 0, 0])
    expect(slices[2]!.name).toBe("")
  })
})

describe("PieChart", () => {
  it("renders a sector per slice, a legend and a summary", () => {
    const { container } = renderWithOnu(<PieChart title="Channels" data={data} animate={false} />)
    expect(container.querySelectorAll(".recharts-sector")).toHaveLength(3)
    expect(container.querySelector(".recharts-legend-wrapper")).toHaveTextContent("eFaasCouncilWalk-in")
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent(
      "Pie chart with 3 slices, total 1,000. Largest: eFaas, 600 (60%).",
    )
  })

  it("shows the total in the middle of a donut", () => {
    const { container } = renderWithOnu(<PieChart title="Channels" variant="donut" data={data} animate={false} />)
    const label = container.querySelector('[data-slot="pie-center-label"]')!
    expect(label).toHaveTextContent("1,000Total")
    expect(container.querySelector('[data-slot="chart"]')).toHaveAttribute("data-variant", "donut")
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("Donut chart")
  })

  it("accepts a custom or hidden centre label", () => {
    const { container, rerender } = renderWithOnu(
      <PieChart title="Budget" variant="donut" data={data} animate={false} centerLabel={{ value: "MVR 4.2M" }} />,
    )
    expect(container.querySelector('[data-slot="pie-center-label"]')).toHaveTextContent("MVR 4.2M")
    rerender(<PieChart title="Budget" variant="donut" data={data} animate={false} centerLabel={null} />)
    expect(container.querySelector('[data-slot="pie-center-label"]')).toBeNull()
  })

  it("lists value and share in the table", async () => {
    const user = userEvent.setup()
    renderWithOnu(<PieChart title="Channels" data={data} nameLabel="Channel" showLegend={false} />)
    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByRole("columnheader", { name: "Channel" })).toBeInTheDocument()
    const row = screen.getAllByRole("row")[1]!
    expect(
      within(row)
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["600", "60%"])
  })

  it("is empty when everything is zero", () => {
    renderWithOnu(<PieChart title="Channels" data={[{ name: "a", value: 0 }]} />)
    expect(screen.getByText("No data to show")).toBeInTheDocument()
  })

  it.each(directions)("runs slices from 12 o'clock towards the reading direction in %s", (dir) => {
    const { container } = renderWithOnu(<PieChart title="Channels" data={[...data].reverse()} animate={false} />, {
      dir,
    })
    const d = container.querySelector(".recharts-sector")!.getAttribute("d")!
    const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    // "M cx,top A r,r,0,large,sweep, x,y": the arc end x is right of centre in LTR, left in RTL.
    const cx = numbers[0]!
    const endX = numbers[7]!
    if (dir === "rtl") expect(endX).toBeLessThan(cx)
    else expect(endX).toBeGreaterThan(cx)
  })

  it("uses Dhivehi strings", () => {
    const { container } = renderWithOnu(<PieChart title="ޗެނަލް" variant="donut" data={data} animate={false} />, {
      locale: "dv",
    })
    expect(container.querySelector('[data-slot="pie-center-label"]')).toHaveTextContent("ޖުމްލަ")
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(<PieChart title="Channels" data={data} animate={false} />)
    await expectNoA11yViolations(container)
  })
})

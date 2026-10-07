import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { cssColorToHex, hexToRgb, toneVar } from "./_colors"
import { HEATMAP_TONES } from "./heatmap-layer"
import { MapLegend, MapLegendSwatch, mapLegendSwatchVariants, type MapLegendShape } from "./map-legend-swatch"

describe("MapLegendSwatch", () => {
  it.each(["circle", "square", "pin", "area", "line", "dashed", "gradient"] as MapLegendShape[])(
    "renders the %s shape as decorative SVG",
    (shape) => {
      const { container } = renderWithOnu(<MapLegendSwatch shape={shape} tone="chart-2" className="x" />)
      const svg = container.querySelector("svg")!
      expect(svg).toHaveAttribute("aria-hidden", "true")
      expect(svg).toHaveAttribute("data-shape", shape)
      expect(svg).toHaveClass("x")
    },
  )

  it("supports sizes and gradient colours", () => {
    const { container } = renderWithOnu(
      <MapLegendSwatch shape="gradient" size="lg" colors={HEATMAP_TONES.map(toneVar)} />,
    )
    expect(container.querySelectorAll("stop")).toHaveLength(5)
    expect(mapLegendSwatchVariants({ size: "sm" })).toContain("h-3")
  })
})

describe("MapLegend", () => {
  it("is a labelled list with text for every swatch", async () => {
    renderWithOnu(
      <MapLegend
        items={[
          { label: "Under way", tone: "success", shape: "pin", description: "12" },
          { label: "Distress", tone: "destructive" },
        ]}
        classNames={{ item: "item-x" }}
      />,
    )
    const list = screen.getByRole("list", { name: "Legend" })
    expect(list).toHaveTextContent("Under way12")
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("item-x")
    await expectNoA11yViolations()
  })

  it("can hide the title and lay out horizontally", () => {
    renderWithOnu(<MapLegend title={null} orientation="horizontal" items={[{ label: "A" }]} />)
    expect(screen.queryByText("Legend")).not.toBeInTheDocument()
    expect(screen.getByRole("list")).toHaveClass("flex")
  })

  it.each(directions)("uses the Dhivehi title (%s)", (dir) => {
    renderWithOnu(<MapLegend items={[{ label: "ހެންވޭރު" }]} />, { locale: "dv", dir })
    expect(screen.getByRole("list", { name: "ލެޖެންޑް" })).toBeInTheDocument()
  })
})

describe("colour helpers", () => {
  it("converts colours", () => {
    expect(cssColorToHex("#1F7A4D")).toBe("#1f7a4d")
    expect(cssColorToHex("rgb(255, 0, 16)")).toBe("#ff0010")
    expect(cssColorToHex("rgba(1 2 3 / 50%)")).toBe("#010203")
    expect(cssColorToHex("")).toBeNull()
    expect(cssColorToHex("oklch(0.5 0.1 150)")).toBeNull()
    expect(hexToRgb("#ff0010")).toEqual([255, 0, 16])
    expect(toneVar("chart-3")).toBe("var(--chart-3)")
  })
})

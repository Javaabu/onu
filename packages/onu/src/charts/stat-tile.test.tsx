import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { mockRecharts } from "../../test/recharts-mock"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { StatTile, StatTiles, statTileVariants } from "./stat-tile"

vi.mock("recharts", async (importOriginal) => mockRecharts(await importOriginal()))

const strip = (s: string | null | undefined) => (s ?? "").replace(/[⁨⁩]/g, "")

describe("StatTile", () => {
  it("is a labelled group with a formatted value", () => {
    const { container } = renderWithOnu(<StatTile label="Applications" value={1284} />)
    expect(screen.getByRole("group", { name: "Applications" })).toHaveAttribute("data-slot", "stat-tile")
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toHaveTextContent("1,284")
    expect(container.querySelector('[data-slot="delta-indicator"]')).toBeNull()
  })

  it("formats currency and shows a computed delta with context", () => {
    const { container } = renderWithOnu(
      <StatTile label="Revenue" value={2200} previousValue={2000} valueFormat="currency" />,
    )
    expect(strip(container.querySelector('[data-slot="stat-tile-value"]')!.textContent)).toBe("MVR 2,200.00")
    const delta = container.querySelector('[data-slot="delta-indicator"]')!
    expect(delta).toHaveTextContent("+10%")
    expect(delta).toHaveTextContent("vs previous period")
    expect(delta.querySelector('[data-icon-name="arrow-up"]')).not.toBeNull()
  })

  it("accepts an explicit delta, string values and lower-is-better", () => {
    const { container } = renderWithOnu(
      <StatTile label="Wait" value="3.4 days" delta={-0.2} positiveIsGood={false} deltaContext="vs May" />,
    )
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toHaveTextContent("3.4 days")
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toHaveAttribute("dir", "auto")
    const delta = container.querySelector('[data-slot="delta-indicator"]')!
    expect(delta).toHaveAttribute("data-sentiment", "positive")
    expect(delta).toHaveTextContent("vs May")
  })

  it("shows a placeholder for a missing value", () => {
    const { container } = renderWithOnu(<StatTile label="Users" value={null} />)
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toHaveTextContent("No data")
  })

  it("renders semantic and custom icons, a sparkline and a footer", () => {
    const { container, rerender } = renderWithOnu(
      <StatTile label="Users" value={5} icon="users" sparkline={[1, 3, 2]} footer="Updated today" />,
    )
    expect(container.querySelector('[data-icon-name="users"]')).not.toBeNull()
    expect(screen.getByRole("img", { name: /Users: 3 values/ })).toBeInTheDocument()
    expect(screen.getByText("Updated today")).toBeInTheDocument()
    rerender(<StatTile label={<b>Users</b>} value={5} icon={<span data-testid="custom" />} sparkline={[1, 2]} />)
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /^Value:/ })).toBeInTheDocument()
  })

  it("shows skeletons while loading", () => {
    const { container } = renderWithOnu(<StatTile label="Users" value={5} previousValue={4} loading />)
    expect(screen.getByRole("group")).toHaveAttribute("aria-busy", "true")
    expect(container.querySelector('[data-slot="stat-tile-loading"]')).toBeInTheDocument()
    expect(screen.getByText("Loading…")).toHaveClass("sr-only")
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toBeNull()
    expect(container.querySelector('[data-slot="delta-indicator"]')).toBeNull()
  })

  it("renders as a link with asChild", () => {
    renderWithOnu(
      <StatTile asChild label="Pending" value={17} className="extra">
        <a href="/approvals">Pending</a>
      </StatTile>,
    )
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/approvals")
    expect(link).toHaveAttribute("data-slot", "stat-tile")
    expect(link).toHaveClass("extra", "focus-visible:ring-3")
    expect(link).toHaveTextContent("Pending17")
  })

  it("supports sizes and classNames", () => {
    const { container } = renderWithOnu(
      <StatTile
        size="lg"
        label="Users"
        value={5}
        delta={0.1}
        classNames={{ label: "l-x", value: "v-x", delta: "d-x" }}
      />,
    )
    expect(container.querySelector('[data-slot="stat-tile-label"]')).toHaveClass("l-x")
    expect(container.querySelector('[data-slot="stat-tile-value"]')).toHaveClass("v-x", "text-4xl")
    expect(container.querySelector('[data-slot="delta-indicator"]')).toHaveClass("d-x")
    expect(statTileVariants({ size: "sm" })).toContain("p-3")
  })

  it("is Ant's ChartCard: an info tip, a chart slot and a footer row under a line", async () => {
    const { container } = renderWithOnu(
      <StatTile
        label="Total fees"
        tip="Approved fees this year"
        value="MVR 122,600"
        chart={<div data-testid="bars" />}
        sparkline={[1, 2, 3]}
        footer="Daily fees MVR 336"
      />,
    )
    const tip = screen.getByRole("button", { name: "Approved fees this year" })
    expect(tip).toHaveAttribute("data-slot", "stat-tile-tip")
    // A chart replaces the sparkline in the 46px slot.
    expect(container.querySelector("[data-slot=stat-tile-chart]")).toContainElement(screen.getByTestId("bars"))
    expect(screen.queryByRole("img", { name: /Total fees/ })).toBeNull()
    expect(container.querySelector("[data-slot=stat-tile-footer]")).toHaveClass("border-t")
    expect(screen.getByRole("group", { name: "Total fees" })).toHaveClass("has-[>[data-slot=stat-tile-footer]]:pb-0")
    await expectNoA11yViolations(container)
  })

  it.each(directions)("renders in %s", (dir) => {
    renderWithOnu(<StatTile label="Users" value={5} delta={0.1} />, { dir })
    expect(screen.getByText("+10%")).toHaveAttribute("dir", "ltr")
  })

  it("uses Dhivehi strings", () => {
    renderWithOnu(<StatTile label="ހުށަހެޅުން" value={5} previousValue={4} />, { locale: "dv" })
    expect(screen.getByText("ކުރީގެ މުއްދަތާ އަޅާބަލާއިރު")).toBeInTheDocument()
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(
      <StatTiles>
        <StatTile label="Users" value={5} previousValue={4} sparkline={[1, 2]} icon="users" />
        <StatTile label="Loading" value={5} loading />
      </StatTiles>,
    )
    await expectNoA11yViolations(container)
  })
})

describe("StatTiles", () => {
  it("is a container-query grid with configurable columns", () => {
    const { container, rerender } = renderWithOnu(
      <StatTiles className="x">
        <StatTile label="A" value={1} />
      </StatTiles>,
    )
    expect(container.querySelector('[data-slot="stat-tiles"]')).toHaveClass("@container/stat-tiles")
    const grid = container.querySelector('[data-slot="stat-tiles"] > div')!
    expect(grid).toHaveClass("grid-cols-1", "@4xl/stat-tiles:grid-cols-4", "x")
    rerender(
      <StatTiles columns={3}>
        <StatTile label="A" value={1} />
      </StatTiles>,
    )
    expect(container.querySelector('[data-slot="stat-tiles"] > div')).toHaveClass("@3xl/stat-tiles:grid-cols-3")
  })
})

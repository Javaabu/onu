import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { DeltaIndicator, deltaIndicatorVariants } from "./delta-indicator"

function indicator(container: HTMLElement) {
  return container.querySelector('[data-slot="delta-indicator"]')!
}

describe("DeltaIndicator", () => {
  it("shows an up arrow, a plus sign and success colour for growth", () => {
    const { container } = renderWithOnu(<DeltaIndicator value={0.125} />)
    const el = indicator(container)
    expect(el).toHaveAttribute("data-direction", "up")
    expect(el).toHaveClass("text-success")
    expect(el.querySelector('[data-icon-name="arrow-up"]')).not.toBeNull()
    expect(el.querySelector('[aria-hidden="true"][dir="ltr"]')).toHaveTextContent("+12.5%")
    expect(screen.getByText("Up 12.5%")).toHaveClass("sr-only")
  })

  it("shows a down arrow and destructive colour for a fall", () => {
    const { container } = renderWithOnu(<DeltaIndicator value={-0.05} />)
    expect(indicator(container)).toHaveClass("text-destructive")
    expect(indicator(container)).toHaveTextContent("−5%")
    expect(screen.getByText("Down 5%")).toBeInTheDocument()
  })

  it("inverts colours when lower is better", () => {
    const { container } = renderWithOnu(<DeltaIndicator value={-0.05} positiveIsGood={false} variant="badge" />)
    expect(indicator(container)).toHaveAttribute("data-sentiment", "positive")
    expect(indicator(container)).toHaveClass("bg-success/10")
  })

  it("is neutral with no change", () => {
    const { container } = renderWithOnu(<DeltaIndicator value={0} />)
    expect(indicator(container)).toHaveAttribute("data-sentiment", "neutral")
    expect(indicator(container).querySelector('[data-icon-name="minus"]')).not.toBeNull()
    expect(screen.getByText("No change")).toBeInTheDocument()
  })

  it("computes the change from current and previous", () => {
    const { container } = renderWithOnu(<DeltaIndicator current={120} previous={100} context="vs last week" />)
    expect(indicator(container)).toHaveTextContent("+20%")
    expect(screen.getByText("vs last week")).toBeInTheDocument()
  })

  it("handles a previous value of 0", () => {
    const { container } = renderWithOnu(<DeltaIndicator current={5} previous={0} />)
    expect(indicator(container)).toHaveAttribute("data-direction", "up")
    expect(indicator(container)).toHaveTextContent("No data")
    expect(screen.getByText("Up")).toHaveClass("sr-only")
  })

  it("is neutral without any input", () => {
    const { container } = renderWithOnu(<DeltaIndicator />)
    expect(indicator(container)).toHaveAttribute("data-direction", "flat")
  })

  it.each(directions)("keeps the sign before the number in %s", (dir) => {
    const { container } = renderWithOnu(<DeltaIndicator value={0.1} />, { dir })
    expect(indicator(container).querySelector('[dir="ltr"]')).toHaveTextContent("+10%")
  })

  it("speaks Dhivehi", () => {
    renderWithOnu(<DeltaIndicator value={0.1} />, { locale: "dv" })
    expect(screen.getByText("10% އިތުރުވެއްޖެ")).toBeInTheDocument()
  })

  it("merges className and exports variants", () => {
    const { container } = renderWithOnu(<DeltaIndicator value={0.1} className="extra" />)
    expect(indicator(container)).toHaveClass("extra")
    expect(deltaIndicatorVariants({ sentiment: "negative", variant: "badge" })).toContain("bg-destructive/10")
  })

  it("has no axe violations", async () => {
    const { container } = renderWithOnu(<DeltaIndicator value={0.1} context="vs last month" />)
    await expectNoA11yViolations(container)
  })
})

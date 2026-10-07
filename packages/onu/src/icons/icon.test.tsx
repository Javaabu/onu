import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Icon } from "./icon"

describe("Icon", () => {
  it("is decorative by default", () => {
    const { container } = renderWithOnu(<Icon name="close" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("data-icon-name", "close")
  })

  it("becomes an image with a label", async () => {
    renderWithOnu(<Icon name="search" label="Search" />)
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("mirrors directional icons in RTL only via the rtl: variant", () => {
    const { container } = renderWithOnu(
      <>
        <Icon name="chevron-right" />
        <Icon name="check" />
        <Icon name="check" flip />
      </>,
    )
    const [chevron, check, flipped] = Array.from(container.querySelectorAll("svg"))
    expect(chevron!.getAttribute("class")).toContain("rtl:-scale-x-100")
    expect(check!.getAttribute("class")).not.toContain("rtl:-scale-x-100")
    expect(flipped!.getAttribute("class")).toContain("rtl:-scale-x-100")
  })

  it("uses icon map overrides from the provider (component and element)", () => {
    const Custom = (props: { className?: string }) => <svg data-testid="custom" {...props} />
    renderWithOnu(
      <>
        <Icon name="close" />
        <Icon name="check" />
      </>,
      { provider: { icons: { close: Custom, check: <svg data-testid="element" /> } } },
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(screen.getByTestId("element")).toHaveAttribute("data-icon-name", "check")
  })

  it("applies size tokens and numeric sizes", () => {
    const { container } = renderWithOnu(
      <>
        <Icon name="close" size="lg" />
        <Icon name="close" size={20} />
      </>,
    )
    const [a, b] = Array.from(container.querySelectorAll("svg"))
    expect(a!.getAttribute("class")).toContain("size-5")
    expect(b).toHaveAttribute("width", "20")
  })

  it("falls back for unknown names", () => {
    const { container } = renderWithOnu(<Icon name="does-not-exist" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})

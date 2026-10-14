import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { LiveRegion } from "./live-region"

const region = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-slot=live-region]")!

describe("LiveRegion", () => {
  it("is a visually hidden, polite, atomic span by default", () => {
    const { container } = renderWithOnu(<LiveRegion>3 results</LiveRegion>)
    const el = region(container)
    expect(el.tagName).toBe("SPAN")
    expect(el).toHaveTextContent("3 results")
    expect(el).toHaveAttribute("aria-live", "polite")
    expect(el).toHaveAttribute("aria-atomic", "true")
    expect(el).toHaveClass("sr-only")
    expect(el).not.toHaveAttribute("role")
  })

  it("can be assertive, non-atomic, visible, another element and a status", () => {
    const { container } = renderWithOnu(
      <LiveRegion politeness="assertive" atomic={false} visible as="div" role="status" className="text-sm">
        Upload failed
      </LiveRegion>,
    )
    const el = region(container)
    expect(el.tagName).toBe("DIV")
    expect(el).toHaveAttribute("aria-live", "assertive")
    expect(el).toHaveAttribute("aria-atomic", "false")
    expect(el).not.toHaveClass("sr-only")
    expect(el).toHaveClass("text-sm")
    expect(screen.getByRole("status")).toBe(el)
  })

  it("is assertive with role alert unless told otherwise", () => {
    const { container, rerender } = renderWithOnu(<LiveRegion role="alert">Payment failed</LiveRegion>)
    expect(region(container)).toHaveAttribute("aria-live", "assertive")
    rerender(
      <LiveRegion role="alert" politeness="polite">
        Payment failed
      </LiveRegion>,
    )
    expect(region(container)).toHaveAttribute("aria-live", "polite")
  })

  it("keeps the same element as its text changes, so the change is read", () => {
    const { container, rerender } = renderWithOnu(<LiveRegion>{null}</LiveRegion>)
    const el = region(container)
    expect(el).toBeEmptyDOMElement()
    rerender(<LiveRegion>Saved</LiveRegion>)
    expect(region(container)).toBe(el)
    expect(el).toHaveTextContent("Saved")
  })

  it.each(directions)("has no axe violations (%s)", async (dir) => {
    renderWithOnu(
      <>
        <LiveRegion>Saved</LiveRegion>
        <LiveRegion role="status" as="div" visible>
          2 of 5 uploaded
        </LiveRegion>
      </>,
      { dir },
    )
    await expectNoA11yViolations()
  })
})

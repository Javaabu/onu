import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Divider, dividerVariants } from "./divider"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("Divider", () => {
  it("renders a plain separator, decorative by default", async () => {
    const { container } = renderWithOnu(
      <>
        <Divider className="extra" />
        <Divider decorative={false} orientation="vertical" variant="dashed" spacing="md" />
      </>,
    )
    const [first] = container.querySelectorAll("[data-slot=separator]")
    expect(first).toHaveClass("extra")
    expect(first).toHaveAttribute("role", "none")
    const real = screen.getByRole("separator")
    expect(real).toHaveAttribute("aria-orientation", "vertical")
    expect(real).toHaveClass("border-dashed")
    await expectNoA11yViolations()
  })

  it("renders a label with alignment and slot classes", () => {
    const { container } = renderWithOnu(
      <>
        <Divider label="or" classNames={{ label: "lbl", line: "ln" }} spacing="sm" />
        <Divider label="Start" align="start" />
        <Divider label="End" align="end" orientation="vertical" />
      </>,
    )
    expect(screen.getByText("or")).toHaveClass("lbl")
    const dividers = container.querySelectorAll("[data-slot=divider]")
    expect(dividers).toHaveLength(3)
    expect(dividers[1]).toHaveAttribute("data-align", "start")
    expect(dividers[2]).toHaveAttribute("data-orientation", "vertical")
    expect(dividers[0]!.querySelector("[data-slot=separator]")).toHaveClass("ln")
    expect(dividerVariants({ variant: "dashed" })).toContain("border-dashed")
  })

  it.each(directions)("works in %s", async (dir) => {
    renderWithOnu(<Divider label="ނުވަތަ" />, { locale: "dv", dir })
    expect(screen.getByText("ނުވަތަ")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

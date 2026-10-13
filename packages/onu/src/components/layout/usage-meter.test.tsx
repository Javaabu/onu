import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { UsageMeter } from "./usage-meter"

describe("UsageMeter", () => {
  it("shows a labelled bar with used / total, a link and a note", async () => {
    renderWithOnu(
      <UsageMeter
        label="Records quota"
        icon="file-archive"
        value={1284}
        max={2000}
        link={{ label: "Get more space", href: "/billing" }}
        meta="v5.0.42"
        className="extra"
      />,
    )
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "1284")
    expect(bar).toHaveAttribute("aria-valuemax", "2000")
    expect(screen.getByText("1,284 / 2,000")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Get more space" })).toHaveAttribute("href", "/billing")
    expect(screen.getByText("v5.0.42")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=usage-meter]")).toHaveClass("extra", "border-t")
    expect(document.querySelector('[data-icon-name="file-archive"]')).not.toBeNull()
    await expectNoA11yViolations()
  })

  it("turns warning and then destructive as the quota fills, unless a colour is given", () => {
    const indicator = () => document.querySelector("[data-slot=progress-bar-indicator]")
    const { rerender } = renderWithOnu(<UsageMeter label="Storage" value={10} max={100} />)
    expect(indicator()).toHaveClass("bg-primary")
    rerender(<UsageMeter label="Storage" value={85} max={100} />)
    expect(indicator()).toHaveClass("bg-warning")
    rerender(<UsageMeter label="Storage" value={99} max={100} />)
    expect(indicator()).toHaveClass("bg-destructive")
    rerender(<UsageMeter label="Storage" value={99} max={100} color="info" formatValue={(v) => `${v} GB`} />)
    expect(indicator()).toHaveClass("bg-info")
    expect(screen.getByText("99 GB")).toBeInTheDocument()
  })

  it.each(directions)("uses the locale's digits in %s", (dir) => {
    renderWithOnu(<UsageMeter label="ކޯޓާ" value={5} max={10} />, { locale: "dv", dir })
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=usage-meter-footer]")).toBeNull()
  })
})

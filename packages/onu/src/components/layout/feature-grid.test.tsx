import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FeatureGrid, type FeatureItem } from "./feature-grid"

vi.setConfig({ testTimeout: 30_000 })

const items: FeatureItem[] = [
  { id: "passport", icon: "file-text", title: "Passports", description: "Apply or renew online.", href: "/passports" },
  {
    id: "tax",
    icon: "banknote",
    title: "Pay tax",
    description: "MIRA payments.",
    href: "https://mira.gov.mv",
    external: true,
  },
  { id: "info", icon: "info", title: "Help centre", description: "Answers to common questions." },
]

describe("FeatureGrid", () => {
  it("lists features with icons, headings and one link per linked item", async () => {
    const { container } = renderWithOnu(<FeatureGrid items={items} className="extra" aria-label="Services" />)
    expect(container.querySelector("[data-slot=feature-grid]")).toHaveClass("extra", "@container/features")
    const list = screen.getByRole("list", { name: "Services" })
    const entries = within(list).getAllByRole("listitem")
    expect(entries).toHaveLength(3)
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Passports",
      "Pay tax (opens in a new tab)",
      "Help centre",
    ])
    // The title is the only link: its name is the title, and the "Learn more" cue is hidden.
    expect(within(entries[0]!).getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link", { name: "Passports" })).toHaveAttribute("href", "/passports")
    expect(screen.getByRole("link", { name: /Pay tax/ })).toHaveAttribute("target", "_blank")
    expect(within(entries[0]!).getByText("Learn more").closest("[aria-hidden]")).toBeTruthy()
    // Unlinked items have no link cue.
    expect(within(entries[2]!).queryByRole("link")).toBeNull()
    expect(within(entries[2]!).queryByText("Learn more")).toBeNull()
    // Icons are decorative.
    expect(entries[0]!.querySelector("[data-slot=feature-grid-icon]")).toHaveAttribute("aria-hidden", "true")
    await expectNoA11yViolations()
  })

  it("sets columns from container queries", () => {
    const { rerender } = renderWithOnu(<FeatureGrid items={items} />)
    expect(screen.getByRole("list")).toHaveClass("grid-cols-1", "@xl/features:grid-cols-2", "@4xl/features:grid-cols-3")
    rerender(<FeatureGrid items={items} columns={4} />)
    expect(screen.getByRole("list")).toHaveClass("@6xl/features:grid-cols-4")
    rerender(<FeatureGrid items={items} columns={2} />)
    expect(screen.getByRole("list")).not.toHaveClass("@4xl/features:grid-cols-3")
  })

  it("supports variants, alignment, heading level, custom icons and link labels", () => {
    renderWithOnu(
      <FeatureGrid
        variant="muted"
        align="center"
        headingLevel={4}
        classNames={{ item: "itm", title: "ttl" }}
        items={[
          { title: "Custom", icon: <svg data-testid="logo" />, href: "/c", linkLabel: "Open" },
          { title: "No cue", href: "/n", linkLabel: false },
        ]}
      />,
    )
    const [first, second] = screen.getAllByRole("listitem")
    expect(first).toHaveClass("bg-muted/50", "text-center", "itm")
    expect(screen.getAllByRole("heading", { level: 4 })[0]).toHaveClass("ttl")
    expect(screen.getByTestId("logo")).toBeInTheDocument()
    expect(within(first!).getByText("Open")).toBeInTheDocument()
    expect(within(second!).queryByText("Learn more")).toBeNull()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(
      <FeatureGrid
        aria-label="ޚިދުމަތްތައް"
        items={[{ icon: "file-text", title: "ޕާސްޕޯޓް", description: "އޮންލައިންކޮށް", href: "/p" }]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("link", { name: "ޕާސްޕޯޓް" })).toBeInTheDocument()
    expect(screen.getByText("އިތުރަށް ބައްލަވާ")).toBeInTheDocument()
    expect(screen.getByRole("listitem")).toHaveClass("text-start")
    await expectNoA11yViolations()
  })
})

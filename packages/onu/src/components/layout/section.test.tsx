import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Section } from "./section"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("Section", () => {
  it("is a region labelled by its heading, with description and actions", async () => {
    renderWithOnu(
      <Section
        id="contact"
        title="Contact details"
        description="How we reach you"
        actions={<button type="button">Edit</button>}
        variant="card"
        className="extra"
        classNames={{ title: "ttl", actions: "act", content: "cnt" }}
      >
        <p>Body</p>
      </Section>,
    )
    const region = screen.getByRole("region", { name: "Contact details" })
    expect(region).toHaveAccessibleDescription("How we reach you")
    expect(region).toHaveClass("extra", "rounded-xl")
    expect(screen.getByRole("heading", { level: 2, name: "Contact details" })).toHaveClass("ttl")
    expect(screen.getByRole("button", { name: "Edit" }).parentElement).toHaveClass("act")
    expect(screen.getByText("Body").parentElement).toHaveClass("cnt")
    await expectNoA11yViolations()
  })

  it("supports heading levels and renders without a header", () => {
    const { container } = renderWithOnu(
      <>
        <Section title="Level 3" headingLevel={3} />
        <Section aria-label="Bare">Only content</Section>
      </>,
    )
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument()
    expect(container.querySelectorAll("[data-slot=section-header]")).toHaveLength(1)
    expect(container.querySelectorAll("[data-slot=section-content]")).toHaveLength(1)
  })

  it.each(directions)("works in %s", async (dir) => {
    renderWithOnu(<Section title="ގުޅޭނެ ގޮތް">ތަފްސީލު</Section>, { locale: "dv", dir })
    expect(screen.getByRole("region", { name: "ގުޅޭނެ ގޮތް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

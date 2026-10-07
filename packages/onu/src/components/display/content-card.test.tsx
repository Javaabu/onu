import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ContentCard } from "./content-card"

describe("ContentCard", () => {
  it("renders image, title link, excerpt, date and category", () => {
    const { container } = renderWithOnu(
      <ContentCard
        title="New ferry routes to Hulhumalé"
        href="/news/ferry"
        excerpt="MTCC announces new routes."
        image={{ src: "/ferry.jpg", alt: "Ferry at the jetty" }}
        date="2026-03-12T10:00:00Z"
        dateFormat="yyyy-MM-dd"
        category="News"
        meta={<span>3 min read</span>}
        footer={<span>Tags</span>}
      />,
    )
    expect(screen.getByRole("article")).toHaveAttribute("data-orientation", "vertical")
    expect(screen.getByRole("heading", { level: 3 })).toContainElement(
      screen.getByRole("link", { name: "New ferry routes to Hulhumalé" }),
    )
    expect(screen.getByRole("img", { name: "Ferry at the jetty" })).toHaveAttribute("loading", "lazy")
    expect(container.querySelector("time")).toHaveTextContent("2026-03-12")
    expect(screen.getByText("News")).toBeInTheDocument()
    expect(screen.getByText("3 min read")).toBeInTheDocument()
    expect(screen.getByText("Tags")).toBeInTheDocument()
  })

  it("supports horizontal layout, heading level and no link", () => {
    renderWithOnu(<ContentCard title="Passport services" orientation="horizontal" headingLevel={2} className="c" />)
    expect(screen.getByRole("article")).toHaveClass("c", "@lg:flex-row")
    expect(screen.getByRole("heading", { level: 2, name: "Passport services" })).toBeInTheDocument()
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("formats dates in Dhivehi", () => {
    renderWithOnu(<ContentCard title="ޚަބަރު" date="2026-03-12T10:00:00Z" dateFormat="d MMMM" />, { locale: "dv" })
    expect(screen.getByText(/މާޗު/)).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(
      <ContentCard title="Event" href="/e" image={{ src: "/e.jpg", alt: "" }} excerpt="Text" />,
      { dir },
    )
    await expectNoA11yViolations(container)
  })
})

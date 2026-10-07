import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { cn } from "../../lib/utils"
import { Hero } from "./hero"

vi.setConfig({ testTimeout: 30_000 })

describe("Hero", () => {
  it("renders a labelled region with heading, lead text, search and actions", async () => {
    renderWithOnu(
      <Hero
        eyebrow="eFaas services"
        title="Government services, in one place"
        description="Apply, pay and track requests online."
        search={<input type="search" aria-label="Search services" />}
        actions={<a href="/services">Browse services</a>}
        className="extra"
      />,
    )
    const region = screen.getByRole("region", { name: "Government services, in one place" })
    expect(region).toHaveAttribute("data-slot", "hero")
    expect(region).toHaveClass("extra", "@container/hero")
    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveClass("text-fluid-4xl")
    expect(screen.getByText("Apply, pay and track requests online.")).toHaveClass("text-fluid-lg")
    expect(screen.getByRole("searchbox", { name: "Search services" }).closest("[data-slot=hero-search]")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Browse services" })).toBeInTheDocument()
    expect(screen.getByText("eFaas services")).toHaveAttribute("data-slot", "hero-eyebrow")
    await expectNoA11yViolations()
  })

  it("covers a decorative background image with a token scrim", async () => {
    const { container } = renderWithOnu(
      <Hero title="Visit Addu" backgroundImage="/addu.jpg" tone="primary" size="lg" headingLevel={2} />,
    )
    const image = container.querySelector("[data-slot=hero-image]")!
    expect(image).toHaveAttribute("alt", "")
    expect(image).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelector("[data-slot=hero-overlay]")).toHaveClass("from-primary/95")
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-fluid-5xl")
    expect(container.querySelector("[data-slot=hero]")).toHaveClass("bg-primary", "text-primary-foreground")
    await expectNoA11yViolations()
  })

  it("keeps alt text for a meaningful image and its focal point", () => {
    renderWithOnu(
      <Hero
        title="Hulhumalé"
        backgroundImage={{ src: "/h.jpg", alt: "Hulhumalé beach at sunset", position: "center 30%" }}
      />,
    )
    const image = screen.getByRole("img", { name: "Hulhumalé beach at sunset" })
    expect(image).not.toHaveAttribute("aria-hidden")
    expect(image).toHaveStyle({ objectPosition: "center 30%" })
  })

  it("centres content without media and splits it with media", () => {
    const { container, rerender } = renderWithOnu(<Hero title="Centred" align="center" actions={<button>Go</button>} />)
    expect(container.querySelector("[data-slot=hero-content]")).toHaveClass("text-center", "items-center")
    expect(container.querySelector("[data-slot=hero-actions]")).toHaveClass("justify-center")
    rerender(<Hero title="Split" align="center" media={<img src="/m.png" alt="Ferry" />} />)
    // With media the text stays at the inline start, beside the media in wide containers.
    expect(container.querySelector("[data-slot=hero-content]")).toHaveClass("text-start")
    expect(container.querySelector("[data-slot=hero-container]")!.className).toContain("@4xl/hero:grid-cols-")
    expect(screen.getByRole("img", { name: "Ferry" }).closest("[data-slot=hero-media]")).toBeTruthy()
  })

  it("accepts classNames for each part", () => {
    const { container } = renderWithOnu(
      <Hero
        title="T"
        description="D"
        maxWidth="none"
        rounded
        classNames={{ title: "tt", description: "dd", container: "cc" }}
      />,
    )
    expect(screen.getByRole("heading")).toHaveClass("tt")
    expect(screen.getByText("D")).toHaveClass("dd")
    expect(container.querySelector("[data-slot=hero-container]")).toHaveClass("cc")
    expect(container.querySelector("[data-slot=hero-container]")).not.toHaveClass("max-w-6xl")
    expect(container.querySelector("[data-slot=hero]")).toHaveClass("rounded-xl")
  })

  it("merges fluid text sizes as font sizes, not colours", () => {
    expect(cn("text-fluid-lg text-muted-foreground")).toBe("text-fluid-lg text-muted-foreground")
    expect(cn("text-sm text-fluid-2xl")).toBe("text-fluid-2xl")
    expect(cn("text-fluid-4xl", "text-fluid-5xl")).toBe("text-fluid-5xl")
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(
      <Hero
        title="ސަރުކާރުގެ ޚިދުމަތްތައް"
        description="އޮންލައިންކޮށް އެޕްލައި ކުރައްވާ"
        actions={<a href="/s">ޚިދުމަތްތައް</a>}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("region", { name: "ސަރުކާރުގެ ޚިދުމަތްތައް" })).toBeInTheDocument()
    // Logical alignment: start follows the direction.
    expect(screen.getByRole("heading").parentElement).toHaveClass("text-start", "items-start")
    await expectNoA11yViolations()
  })
})

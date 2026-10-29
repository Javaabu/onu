import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Card, cardVariants } from "./card"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("Card", () => {
  it("composes like the shadcn card when no props are given", async () => {
    const { container } = renderWithOnu(
      <Card className="extra" size="sm">
        <CardHeader>
          <CardTitle>Classic</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    )
    const card = container.querySelector("[data-slot=card]")
    expect(card).toHaveClass("extra", "bg-card")
    expect(card).toHaveAttribute("data-size", "sm")
    expect(screen.getByText("Classic")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("pads content placed straight in the card, keeping images full-bleed", () => {
    const { container } = renderWithOnu(
      <>
        <Card data-testid="bare">
          <img src="/a.jpg" alt="" />
          <p>Body</p>
        </Card>
        <Card data-testid="text">Just text</Card>
        <Card data-testid="flush" padded={false}>
          <table />
        </Card>
      </>,
    )
    const bare = screen.getByTestId("bare")
    expect(bare).toHaveAttribute("data-padded", "true")
    expect(bare).toHaveClass("[&>:not(img)]:px-(--card-spacing)")
    const text = screen.getByText("Just text")
    expect(text).toHaveAttribute("data-slot", "card-content")
    expect(screen.getByTestId("text")).not.toHaveClass("[&>:not(img)]:px-(--card-spacing)")
    const flush = screen.getByTestId("flush")
    expect(flush).not.toHaveAttribute("data-padded")
    expect(flush).not.toHaveClass("[&>:not(img)]:px-(--card-spacing)")
    // Edge to edge: no vertical padding either.
    expect(flush).toHaveClass("py-0", "gap-0")
    expect(bare).not.toHaveClass("py-0")
    expect(container.querySelectorAll("[data-slot=card-content]")).toHaveLength(1)
  })

  it("leaves composed cards (title or CardContent) to their own padding", () => {
    renderWithOnu(
      <Card title="T" data-testid="titled">
        Body
      </Card>,
    )
    expect(screen.getByTestId("titled")).not.toHaveAttribute("data-padded")
    expect(screen.getAllByText("Body")).toHaveLength(1)
  })

  it("renders title, description, header actions and footer", async () => {
    renderWithOnu(
      <Card
        title="Payments"
        description="Last 30 days"
        actions={<button type="button">Export</button>}
        footer={<span>MVR 12,400.00</span>}
        headingLevel={2}
        variant="muted"
        classNames={{ title: "ttl", content: "cnt", footer: "ftr", actions: "act", header: "hdr", description: "dsc" }}
      >
        Content
      </Card>,
    )
    expect(screen.getByRole("heading", { level: 2, name: "Payments" })).toHaveClass("ttl", "font-semibold")
    // Ant: the header is its own row with a bottom line.
    expect(document.querySelector("[data-slot=card-header]")).toHaveClass("border-b", "min-h-14")
    expect(screen.getByText("Last 30 days")).toHaveClass("dsc")
    expect(screen.getByText("Content")).toHaveClass("cnt")
    expect(screen.getByText("MVR 12,400.00").parentElement).toHaveClass("ftr")
    expect(screen.getByRole("button", { name: "Export" }).parentElement).toHaveClass("act")
    await expectNoA11yViolations()
  })

  it("becomes a link card with href, keeping actions clickable", async () => {
    const { container } = renderWithOnu(
      <Card title="Malé City Council" href="/councils/male" actions={<button type="button">More</button>}>
        12 islands
      </Card>,
    )
    const link = screen.getByRole("link", { name: "Malé City Council" })
    expect(link).toHaveAttribute("href", "/councils/male")
    expect(link).toHaveClass("after:absolute")
    expect(container.querySelector("[data-slot=card]")).toHaveClass("relative")
    expect(screen.getByRole("button", { name: "More" }).parentElement).toHaveClass("z-10")
    await expectNoA11yViolations()
  })

  it("renders as its child with asChild", () => {
    renderWithOnu(
      <>
        <Card asChild title="Article" footer="Footer">
          <article data-testid="article">Body</article>
        </Card>
        <Card asChild>
          <section data-testid="plain">Plain</section>
        </Card>
      </>,
    )
    const article = screen.getByTestId("article")
    expect(article.tagName).toBe("ARTICLE")
    expect(article).toHaveAttribute("data-slot", "card")
    expect(article).toHaveTextContent("ArticleBodyFooter")
    expect(screen.getByTestId("plain")).toHaveClass("bg-card")
    expect(cardVariants({ interactive: true })).toContain("focus-within:ring-2")
  })

  it.each(directions)("works in %s with Dhivehi text", async (dir) => {
    renderWithOnu(<Card title="ފައިސާ">ތަފްސީލު</Card>, { locale: "dv", dir })
    expect(screen.getByRole("heading", { name: "ފައިސާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("Card as a form card", () => {
  it("renders media, a heading, header actions, content and a stacking footer", async () => {
    const { container } = renderWithOnu(
      <Card
        title="New user"
        description="Invite a staff member."
        actions={<span>Draft</span>}
        footer={<button type="button">Save</button>}
        media={<span>logo</span>}
        width="lg"
        classNames={{ footer: "foot", media: "med" }}
        className="root"
      >
        <p>Body</p>
      </Card>,
    )
    const card = container.querySelector("[data-slot=card]")
    expect(card).toHaveClass("root", "max-w-3xl", "mx-auto", "w-full", "@container/card")
    expect(screen.getByRole("heading", { level: 3, name: "New user" })).toBeInTheDocument()
    expect(container.querySelector(".med")).toHaveTextContent("logo")
    expect(screen.getByText("Draft")).toBeInTheDocument()
    const footer = container.querySelector(".foot")
    expect(footer).toContainElement(screen.getByRole("button"))
    expect(footer).toHaveClass("flex-col-reverse", "@sm/card:flex-row")
    await expectNoA11yViolations()
  })

  it("keeps cards without width as they were", () => {
    const { container } = renderWithOnu(<Card title="T" footer="f" />)
    const card = container.querySelector("[data-slot=card]")
    expect(card).not.toHaveClass("mx-auto")
    expect(card).not.toHaveClass("@container/card")
    expect(container.querySelector("[data-slot=card-footer]")).not.toHaveClass("flex-col-reverse")
    expect(container.querySelector("[data-slot=card-header]")).toHaveAttribute("data-bordered")
  })

  it("supports the plain variant, full width, heading level 1 and centring", () => {
    const { container } = renderWithOnu(
      <Card variant="plain" width="full" headingLevel={1} title="Sign in" centered footer="f">
        x
      </Card>,
    )
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-lg")
    const card = container.querySelector("[data-slot=card]")
    expect(card).toHaveAttribute("data-variant", "plain")
    expect(card).toHaveClass("max-w-none", "bg-transparent", "ring-0")
    const header = container.querySelector("[data-slot=card-header]")
    expect(header).not.toHaveAttribute("data-bordered")
    expect(header).toHaveClass("text-center")
  })

  it("becomes a titled region or form with asChild", async () => {
    renderWithOnu(
      <Card asChild title={<span id="t">Sign in</span>} width="sm" centered footer={<button type="submit">Go</button>}>
        <form aria-labelledby="t" data-testid="form">
          <label>
            Email <input />
          </label>
        </form>
      </Card>,
    )
    const form = screen.getByRole("form", { name: "Sign in" })
    expect(form).toHaveAttribute("data-slot", "card")
    expect(form).toContainElement(screen.getByRole("button", { name: "Go" }))
    await expectNoA11yViolations()
  })
})

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
    expect(screen.getByRole("heading", { level: 2, name: "Payments" })).toHaveClass("ttl")
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

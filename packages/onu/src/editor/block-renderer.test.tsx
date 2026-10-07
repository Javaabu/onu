import type { JSONContent } from "@tiptap/core"
import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { detectDirection, isSafeImageUrl, isSafeUrl, normalizeUrl, toEmbedUrl } from "./_schema"
import { BlockRenderer } from "./block-renderer"

/** axe-core cannot message iframes in jsdom; check everything else. */
async function axeWithoutFrames() {
  document.querySelectorAll("iframe").forEach((frame) => frame.remove())
  await expectNoA11yViolations()
}

const text = (value: string, marks?: JSONContent["marks"]): JSONContent => ({ type: "text", text: value, marks })
const p = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content })

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [text("Raajje news")] },
    p(text("Hello "), text("Malé", [{ type: "bold" }]), text(" and "), text("ހުޅުމާލެ", [{ type: "italic" }])),
    p(text("ދިވެހި ބަސް")),
    {
      type: "bulletList",
      content: [{ type: "listItem", content: [p(text("Addu"))] }],
    },
    { type: "blockquote", content: [p(text("A quote"))] },
    { type: "horizontalRule" },
    { type: "image", attrs: { src: "https://example.mv/a.jpg", alt: "Beach" } },
    { type: "callout", attrs: { variant: "warning" }, content: [text("Mind the tide")] },
    { type: "embed", attrs: { src: "https://youtu.be/dQw4w9WgXcQ", title: "Reef video" } },
    { type: "codeBlock", attrs: { language: "php" }, content: [text("echo 'hi';")] },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [{ type: "tableHeader", content: [p(text("Island"))] }],
        },
        {
          type: "tableRow",
          content: [{ type: "tableCell", content: [p(text("Fuvahmulah"))] }],
        },
      ],
    },
    p(text("Visit", [{ type: "link", attrs: { href: "https://visitmaldives.com", target: "_blank" } }])),
  ],
}

// Rendering with Shiki and axe is slow under jsdom on busy machines.
vi.setConfig({ testTimeout: 30_000 })

describe("BlockRenderer", () => {
  it("renders every block type without the editor", async () => {
    const { container } = renderWithOnu(<BlockRenderer content={doc} className="root-x" />)
    const root = container.querySelector("[data-slot=block-renderer]")!
    expect(root).toHaveClass("root-x")
    expect(screen.getByRole("heading", { level: 1, name: "Raajje news" })).toHaveAttribute("dir", "auto")
    expect(screen.getByText("Malé").tagName).toBe("STRONG")
    expect(screen.getByText("ދިވެހި ބަސް")).toHaveAttribute("dir", "auto")
    expect(screen.getByRole("listitem")).toHaveTextContent("Addu")
    expect(container.querySelector("blockquote")).toHaveTextContent("A quote")
    expect(container.querySelector("hr")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Beach" })).toHaveAttribute("loading", "lazy")
    const note = screen.getByRole("note")
    expect(note).toHaveAttribute("data-variant", "warning")
    expect(note.querySelector("[data-icon-name=warning]")).toBeInTheDocument()
    // Embeds are click-to-load: no iframe until the reader presses play.
    expect(container.querySelector("iframe")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: /Reef video/ }))
    expect(container.querySelector("iframe")?.getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(container.querySelector("[data-slot=code-block]")).toHaveAttribute("data-language", "php")
    expect(container.querySelector(".tableWrapper table")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Island" })).toBeInTheDocument()
    const link = screen.getByRole("link", { name: "Visit" })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow")
    await axeWithoutFrames()
  })

  it("is safe by default: no script URLs, unsafe images or raw HTML", () => {
    const { container } = renderWithOnu(
      <BlockRenderer
        content={{
          type: "doc",
          content: [
            p(text("Click", [{ type: "link", attrs: { href: "javascript:alert(1)" } }])),
            p(text("<img src=x onerror=alert(1)>")),
            { type: "image", attrs: { src: "javascript:alert(1)", alt: "x" } },
            { type: "embed", attrs: { src: "https://evil.example/frame" } },
            { type: "embed", attrs: { src: "javascript:alert(1)" } },
            { type: "callout", attrs: { variant: "bogus" }, content: [text("Note")] },
          ],
        }}
      />,
    )
    expect(screen.queryByRole("link", { name: "Click" })).not.toBeInTheDocument()
    expect(screen.getByText("Click")).toBeInTheDocument()
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument()
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector("iframe")).toBeNull()
    expect(screen.getByRole("link", { name: "https://evil.example/frame" })).toBeInTheDocument()
    expect(screen.getByRole("note")).toHaveAttribute("data-variant", "info")
  })

  it("accepts a JSON string, shows the empty state and survives invalid content", () => {
    const { rerender } = renderWithOnu(
      <BlockRenderer content={JSON.stringify({ type: "doc", content: [p(text("Hi"))] })} />,
    )
    expect(screen.getByText("Hi")).toBeInTheDocument()
    rerender(<BlockRenderer content={null} empty={<p>Nothing yet</p>} />)
    expect(screen.getByText("Nothing yet")).toBeInTheDocument()
    rerender(<BlockRenderer content="not json" empty="Empty" />)
    expect(screen.getByText("Empty")).toBeInTheDocument()
    rerender(<BlockRenderer content={{ type: "doc", content: [{ type: "unknownNode" }] }} />)
    expect(document.querySelector("[data-slot=block-renderer]")).toBeEmptyDOMElement()
  })

  it("lets nodes and marks be overridden", () => {
    renderWithOnu(
      <BlockRenderer
        content={{
          type: "doc",
          content: [{ type: "image", attrs: { src: "/a.png", alt: "A" } }, p(text("B", [{ type: "bold" }]))],
        }}
        nodes={{ image: ({ node }) => <figure data-testid="custom">{String(node.attrs.alt)}</figure> }}
        marks={{ bold: ({ children }) => <b data-testid="b">{children}</b> }}
        codeBlock={{ lineNumbers: true }}
        size="sm"
      />,
    )
    expect(screen.getByTestId("custom")).toHaveTextContent("A")
    expect(screen.getByTestId("b")).toHaveTextContent("B")
  })

  it("gives lists and quotes the direction of their content, not dir=auto", () => {
    const list = (type: string, ...items: string[]): JSONContent => ({
      type,
      content: items.map((item) => ({ type: "listItem", content: [p(text(item))] })),
    })
    const { container } = renderWithOnu(
      <BlockRenderer
        content={{
          type: "doc",
          content: [
            list("bulletList", "ހުޅުމާލެ", "Addu"),
            list("orderedList", "2024 Malé", "ފުވައްމުލައް"),
            { type: "blockquote", content: [p(text("« "), text("ދިވެހި ރާއްޖެ"))] },
            { type: "blockquote", content: [p(text("An English quote"))] },
            { type: "blockquote", attrs: { dir: "ltr" }, content: [p(text("ދިވެހި"))] },
            list("bulletList", "123"),
          ],
        }}
      />,
      { dir: "ltr" },
    )
    const [dvList, enList, numbersOnly] = container.querySelectorAll<HTMLElement>("ul, ol")
    expect(dvList).toHaveAttribute("dir", "rtl")
    expect(enList).toHaveAttribute("dir", "ltr")
    // No strong character: the browser decides.
    expect(numbersOnly).toHaveAttribute("dir", "auto")
    const quotes = container.querySelectorAll("blockquote")
    expect(quotes[0]).toHaveAttribute("dir", "rtl")
    expect(quotes[1]).toHaveAttribute("dir", "ltr")
    // An explicit direction wins.
    expect(quotes[2]).toHaveAttribute("dir", "ltr")
    // Paragraphs inside keep their own auto direction.
    expect(dvList!.querySelector("p")).toHaveAttribute("dir", "auto")
  })

  it.each(directions)("renders mixed content in %s with Dhivehi labels", async (dir) => {
    renderWithOnu(
      <BlockRenderer
        content={{ type: "doc", content: [{ type: "embed", attrs: { src: "https://vimeo.com/123456" } }] }}
      />,
      { dir, locale: "dv" },
    )
    fireEvent.click(screen.getByRole("button", { name: /އެމްބެޑްކުރެވިފައިވާ ކޮންޓެންޓް/ }))
    expect(screen.getByTitle("އެމްބެޑްކުރެވިފައިވާ ކޮންޓެންޓް").getAttribute("src")).toContain(
      "player.vimeo.com/video/123456",
    )
    await axeWithoutFrames()
  })
})

describe("detectDirection", () => {
  it("finds the first strong character", () => {
    expect(detectDirection("ދިވެހި")).toBe("rtl")
    expect(detectDirection("12, ދިވެހި then English")).toBe("rtl")
    expect(detectDirection("« Malé ދިވެހި")).toBe("ltr")
    expect(detectDirection("مرحبا")).toBe("rtl")
    expect(detectDirection("2024 — !")).toBeNull()
    expect(detectDirection("")).toBeNull()
  })
})

describe("URL safety helpers", () => {
  it("allows only safe link schemes", () => {
    expect(isSafeUrl("https://gov.mv")).toBe(true)
    expect(isSafeUrl("mailto:info@gov.mv")).toBe(true)
    expect(isSafeUrl("/relative/path")).toBe(true)
    expect(isSafeUrl("#top")).toBe(true)
    expect(isSafeUrl("java\nscript:alert(1)")).toBe(false)
    expect(isSafeUrl("data:text/html,hi")).toBe(false)
    expect(isSafeUrl("  ")).toBe(false)
    expect(isSafeUrl(null)).toBe(false)
  })

  it("allows raster data and blob images but not mailto", () => {
    expect(isSafeImageUrl("data:image/png;base64,AAAA")).toBe(true)
    expect(isSafeImageUrl("data:image/svg+xml;base64,AAAA")).toBe(false)
    expect(isSafeImageUrl("blob:https://x/1")).toBe(true)
    expect(isSafeImageUrl("mailto:a@b.mv")).toBe(false)
    expect(isSafeImageUrl(undefined)).toBe(false)
  })

  it("normalises typed URLs", () => {
    expect(normalizeUrl("gov.mv")).toBe("https://gov.mv")
    expect(normalizeUrl("//gov.mv")).toBe("//gov.mv")
    expect(normalizeUrl("/page")).toBe("/page")
    expect(normalizeUrl("javascript:alert(1)")).toBeNull()
    expect(normalizeUrl("")).toBeNull()
  })

  it("embeds only YouTube and Vimeo", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    )
    expect(toEmbedUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toContain("/embed/dQw4w9WgXcQ")
    expect(toEmbedUrl("https://youtu.be/bad")).toBeNull()
    expect(toEmbedUrl("https://www.youtube.com/watch")).toBeNull()
    expect(toEmbedUrl("https://vimeo.com/channels/staff/76979871")).toBe("https://player.vimeo.com/video/76979871")
    expect(toEmbedUrl("https://vimeo.com/about")).toBeNull()
    expect(toEmbedUrl("ftp://youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(toEmbedUrl("not a url")).toBeNull()
    expect(toEmbedUrl(null)).toBeNull()
  })
})

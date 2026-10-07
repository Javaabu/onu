import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ShareButtons, shareUrl } from "./share-buttons"

const URL_ = "https://gov.mv/news/1"

describe("shareUrl", () => {
  it.each([
    ["facebook", "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fgov.mv%2Fnews%2F1"],
    ["x", "https://x.com/intent/post?url=https%3A%2F%2Fgov.mv%2Fnews%2F1&text=Title"],
    ["whatsapp", "https://wa.me/?text=Title%20https%3A%2F%2Fgov.mv%2Fnews%2F1"],
    ["viber", "viber://forward?text=Title%20https%3A%2F%2Fgov.mv%2Fnews%2F1"],
    ["telegram", "https://t.me/share/url?url=https%3A%2F%2Fgov.mv%2Fnews%2F1&text=Title"],
    ["email", "mailto:?subject=Title&body=Body%0A%0Ahttps%3A%2F%2Fgov.mv%2Fnews%2F1"],
  ] as const)("%s", (network, expected) => {
    expect(shareUrl(network, URL_, "Title", "Body")).toBe(expected)
  })

  it("omits empty titles", () => {
    expect(shareUrl("x", URL_)).not.toContain("text=")
    expect(shareUrl("telegram", URL_)).not.toContain("text=")
  })
})

describe("ShareButtons", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete (navigator as { share?: unknown }).share
  })

  it("falls back to network buttons without the Web Share API", () => {
    renderWithOnu(<ShareButtons url={URL_} title="Title" />)
    expect(screen.getByRole("group", { name: "Share" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy link" })).toBeInTheDocument()
    for (const name of ["Facebook", "X", "WhatsApp", "Viber", "Telegram"]) {
      expect(screen.getByRole("link", { name: `Share on ${name}` })).toHaveAttribute("target", "_blank")
    }
    expect(screen.getByRole("link", { name: "Share by email" })).not.toHaveAttribute("target")
  })

  it("uses the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", { value: share, configurable: true })
    const onShare = vi.fn()
    renderWithOnu(<ShareButtons url={URL_} title="Title" text="Body" onShare={onShare} />)
    expect(screen.queryByRole("link")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Share" }))
    expect(share).toHaveBeenCalledWith({ url: URL_, title: "Title", text: "Body" })
    expect(onShare).toHaveBeenCalledWith("native")
  })

  it("ignores a cancelled native share and can show networks too", async () => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockRejectedValue(new DOMException("cancel", "AbortError")),
      configurable: true,
    })
    const onShare = vi.fn()
    renderWithOnu(<ShareButtons url={URL_} native="always" networks={["facebook"]} onShare={onShare} />)
    await userEvent.click(screen.getByRole("button", { name: "Share" }))
    expect(onShare).not.toHaveBeenCalled()
    expect(screen.getByRole("link", { name: "Share on Facebook" })).toBeInTheDocument()
  })

  it("copies the link and announces it", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const onShare = vi.fn()
    renderWithOnu(<ShareButtons url={URL_} networks={["copy"]} onShare={onShare} />)
    await user.click(screen.getByRole("button", { name: "Copy link" }))
    expect(writeText).toHaveBeenCalledWith(URL_)
    expect(onShare).toHaveBeenCalledWith("copy")
    expect(await screen.findAllByText("Link copied")).not.toHaveLength(0)
  })

  it("supports icon-only buttons with accessible names, custom icons and the current URL", async () => {
    const onShare = vi.fn()
    renderWithOnu(
      <ShareButtons
        iconOnly
        size="sm"
        networks={["copy", "telegram"]}
        icons={{ telegram: <span data-testid="tg" /> }}
        onShare={onShare}
        native="never"
      />,
      { locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ލިންކް ކޮޕީކުރޭ" })).toBeInTheDocument()
    const tg = screen.getByRole("link", { name: "ޓެލެގްރާމް ގައި ހިއްސާކުރޭ" })
    expect(tg.getAttribute("href")).toContain(encodeURIComponent(window.location.href))
    expect(screen.getByTestId("tg")).toBeInTheDocument()
    tg.addEventListener("click", (e) => e.preventDefault())
    await userEvent.click(tg)
    expect(onShare).toHaveBeenCalledWith("telegram")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<ShareButtons url={URL_} size="lg" />, { dir })
    await expectNoA11yViolations(container)
  })
})

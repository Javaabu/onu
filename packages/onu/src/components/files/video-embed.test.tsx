import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { parseVideoUrl, VideoEmbed, videoEmbedUrl } from "./video-embed"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("parseVideoUrl", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abc123&t=42", { provider: "youtube", id: "abc123", start: 42 }],
    ["https://youtu.be/xyz?t=5", { provider: "youtube", id: "xyz", start: 5 }],
    ["https://www.youtube.com/embed/emb-1", { provider: "youtube", id: "emb-1", start: undefined }],
    ["https://m.youtube.com/shorts/sh_9", { provider: "youtube", id: "sh_9", start: undefined }],
    ["https://vimeo.com/76979871", { provider: "vimeo", id: "76979871" }],
    ["https://player.vimeo.com/video/76979871", { provider: "vimeo", id: "76979871" }],
  ])("parses %s", (url, expected) => {
    expect(parseVideoUrl(url)).toEqual(expected)
  })

  it.each([
    "not a url",
    "https://example.com/v/1",
    "https://youtu.be/",
    "https://youtube.com/channel/x",
    "https://vimeo.com/about",
  ])("rejects %s", (url) => {
    expect(parseVideoUrl(url)).toBeNull()
  })

  it("builds privacy-enhanced embed URLs", () => {
    expect(videoEmbedUrl("youtube", "abc", { start: 10 })).toBe(
      "https://www.youtube-nocookie.com/embed/abc?autoplay=1&rel=0&playsinline=1&start=10",
    )
    expect(videoEmbedUrl("vimeo", "123")).toBe("https://player.vimeo.com/video/123?autoplay=1&dnt=1")
  })
})

describe("VideoEmbed", () => {
  it("shows a thumbnail and loads the iframe only on click", async () => {
    const { container } = renderWithOnu(
      <VideoEmbed url="https://youtu.be/dQw4w9WgXcQ" title="Hulhumalé phase 2 tour" notice="Loads from YouTube" />,
    )
    expect(container.querySelector("iframe")).toBeNull()
    expect(container.querySelector("img")).toHaveAttribute("src", "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg")
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy")
    expect(screen.getByText("Loads from YouTube")).toBeInTheDocument()
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button", { name: "Play video: Hulhumalé phase 2 tour" }))
    const iframe = screen.getByTitle("Hulhumalé phase 2 tour")
    expect(iframe).toHaveAttribute("src", expect.stringContaining("youtube-nocookie.com/embed/dQw4w9WgXcQ"))
    expect(iframe).toHaveFocus()
    expect(container.firstChild).toHaveAttribute("data-state", "loaded")
  })

  it("works with Vimeo ids, custom thumbnails and keyboard", async () => {
    const { container } = renderWithOnu(
      <VideoEmbed
        provider="vimeo"
        videoId="76979871"
        title="Reef"
        thumbnail="/reef.jpg"
        aspectRatio={4 / 3}
        className="x"
      />,
    )
    expect(container.firstChild).toHaveClass("x")
    expect(container.querySelector("img")).toHaveAttribute("src", "/reef.jpg")
    screen.getByRole("button").focus()
    await userEvent.keyboard("{Enter}")
    expect(screen.getByTitle("Reef")).toHaveAttribute("src", "https://player.vimeo.com/video/76979871?autoplay=1&dnt=1")
  })

  it("is disabled for unknown URLs and has no thumbnail for Vimeo without one", () => {
    const { container } = renderWithOnu(<VideoEmbed url="https://example.com/x" title="Unknown" />)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(container.querySelector("img")).toBeNull()
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<VideoEmbed url="https://youtu.be/a" title="ވީޑިއޯ" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ވީޑިއޯ ކުޅުވާ: ވީޑިއޯ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

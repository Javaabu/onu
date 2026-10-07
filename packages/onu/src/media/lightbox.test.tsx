import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { Gallery, type GalleryImage } from "./gallery"
import { Lightbox } from "./lightbox"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const images: GalleryImage[] = [
  {
    src: "/g/1.jpg",
    thumbnail: "/g/1-sm.jpg",
    alt: "Sunset at Fuvahmulah",
    title: "Fuvahmulah",
    width: 1200,
    height: 800,
  },
  { src: "/g/2.jpg", alt: "Malé skyline", title: "Malé", description: "From Hulhumalé ferry" },
  { src: "/g/3.jpg", alt: "Whale shark" },
]

describe("Lightbox", () => {
  it("opens as a labelled modal dialog with translated controls and closes with Escape", async () => {
    const onOpenChange = vi.fn()
    const onIndexChange = vi.fn()
    renderWithOnu(
      <Lightbox
        open
        slides={images}
        index={1}
        onOpenChange={onOpenChange}
        onIndexChange={onIndexChange}
        className="lb-x"
      />,
    )
    const dialog = await screen.findByRole("dialog", { name: "Image viewer" })
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveClass("lb-x")
    expect(screen.getByRole("button", { name: "Previous image" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next image" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeInTheDocument()
    expect(screen.getByText("From Hulhumalé ferry")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument()
    expect(onIndexChange).toHaveBeenCalledWith(1)
    fireEvent.keyDown(dialog.querySelector(".yarl__container")!, { key: "Escape" })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it.each(directions)("arrow keys follow the reading direction in %s", async (dir) => {
    const onIndexChange = vi.fn()
    renderWithOnu(<Lightbox open slides={images} index={1} onOpenChange={vi.fn()} onIndexChange={onIndexChange} />, {
      dir,
    })
    const dialog = await screen.findByRole("dialog")
    onIndexChange.mockClear()
    fireEvent.keyDown(dialog.querySelector(".yarl__container")!, { key: "ArrowRight" })
    await waitFor(() => expect(onIndexChange).toHaveBeenCalledWith(dir === "rtl" ? 0 : 2))
  })

  it("can turn off zoom, captions and the counter", async () => {
    renderWithOnu(
      <Lightbox open slides={images} onOpenChange={vi.fn()} zoom={false} captions={false} counter={false} loop />,
    )
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument()
    expect(screen.queryByText("Fuvahmulah")).not.toBeInTheDocument()
  })

  it("uses Dhivehi labels", async () => {
    renderWithOnu(<Lightbox open slides={images} onOpenChange={vi.fn()} />, { locale: "dv" })
    expect(await screen.findByRole("dialog", { name: "ފޮޓޯ ބަލާ ސްކްރީން" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
  })
})

describe("Gallery", () => {
  it("renders lazy thumbnails named by their alt text and opens the lightbox", async () => {
    const onImageClick = vi.fn()
    const { container } = renderWithOnu(
      <Gallery images={images} showCaptions onImageClick={onImageClick} className="g-x" />,
    )
    expect(container.firstChild).toHaveClass("g-x")
    const thumb = screen.getByRole("button", { name: "Sunset at Fuvahmulah" })
    expect(thumb).toHaveAttribute("aria-haspopup", "dialog")
    expect(screen.getByRole("img", { name: "Sunset at Fuvahmulah" })).toHaveAttribute("src", "/g/1-sm.jpg")
    expect(screen.getByRole("img", { name: "Sunset at Fuvahmulah" })).toHaveAttribute("loading", "lazy")
    expect(screen.getByText("Malé")).toBeInTheDocument()
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button", { name: "Malé skyline" }))
    expect(onImageClick).toHaveBeenCalledWith(1)
    const dialog = await screen.findByRole("dialog")
    expect(screen.getByRole("group", { name: "2 of 3" })).toBeInTheDocument()
    fireEvent.keyDown(dialog.querySelector(".yarl__container")!, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByRole("button", { name: "Malé skyline" })).toHaveFocus()
  })

  it("supports masonry, column counts and no lightbox", async () => {
    const onImageClick = vi.fn()
    const { container } = renderWithOnu(
      <Gallery
        images={images}
        layout="masonry"
        columns={4}
        lightbox={false}
        onImageClick={onImageClick}
        aspect="video"
      />,
    )
    expect(container.firstChild).toHaveAttribute("data-layout", "masonry")
    expect(container.querySelector("ul")).toHaveClass("columns-2", "@2xl/gallery:columns-4")
    await userEvent.click(screen.getByRole("button", { name: "Whale shark" }))
    expect(onImageClick).toHaveBeenCalledWith(2)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it.each(["video", "portrait"] as const)("uses the %s aspect", (aspect) => {
    renderWithOnu(<Gallery images={images.slice(0, 1)} aspect={aspect} columns={2} />)
    expect(screen.getByRole("img")).toHaveClass(aspect === "video" ? "aspect-video" : "aspect-[3/4]")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    renderWithOnu(<Gallery images={images} />, { dir, locale: "dv" })
    await expectNoA11yViolations()
  })
})

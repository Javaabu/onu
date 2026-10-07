import * as React from "react"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { MediaLister, type MediaId, type MediaItem } from "./media-lister"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const items: MediaItem[] = [
  { id: 1, name: "Maafushi beach.jpg", url: "/m/1.jpg", type: "image/jpeg", size: 320_000, alt: "Beach" },
  { id: 2, name: "Council minutes.pdf", url: "/m/2.pdf", type: "application/pdf", size: 88_000 },
  { id: 3, name: "Harbour drone.mp4", thumbnailUrl: "/m/3.jpg", type: "video/mp4" },
  { id: 4, name: "Budget 2026.xlsx" },
]

afterEach(() => vi.unstubAllGlobals())

describe("MediaLister", () => {
  it("lists media in a grid with lazy thumbnails and type icons", async () => {
    const onItemOpen = vi.fn()
    const { container } = renderWithOnu(<MediaLister items={items} onItemOpen={onItemOpen} className="extra" />)
    const list = screen.getByRole("list", { name: "Media library" })
    expect(list).toHaveAttribute("data-view", "grid")
    expect(container.firstChild).toHaveClass("extra")
    expect(screen.getByRole("img", { name: "Beach" })).toHaveAttribute("loading", "lazy")
    expect(container.querySelectorAll("[data-slot=file-icon]")).toHaveLength(2)
    expect(screen.getByText("313 KB")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /Council minutes/ }))
    expect(onItemOpen).toHaveBeenCalledWith(items[1])
    await expectNoA11yViolations()
  })

  it("switches between grid and list views", async () => {
    const onViewChange = vi.fn()
    renderWithOnu(<MediaLister items={items} onViewChange={onViewChange} />)
    await userEvent.click(screen.getByRole("radio", { name: "List view" }))
    expect(onViewChange).toHaveBeenCalledWith("list")
    expect(screen.getByRole("list", { name: "Media library" })).toHaveAttribute("data-view", "list")
    await expectNoA11yViolations()
  })

  it("filters locally by name, or hands the search to the consumer", async () => {
    const { unmount } = renderWithOnu(<MediaLister items={items} />)
    await userEvent.type(screen.getByRole("searchbox", { name: "Search media" }), "BEACH")
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    await userEvent.clear(screen.getByRole("searchbox"))
    await userEvent.type(screen.getByRole("searchbox"), "zzz")
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument()
    unmount()

    const onSearchChange = vi.fn()
    renderWithOnu(<MediaLister items={items} search="x" onSearchChange={onSearchChange} />)
    expect(screen.getAllByRole("listitem")).toHaveLength(4)
    await userEvent.type(screen.getByRole("searchbox"), "y")
    expect(onSearchChange).toHaveBeenCalledWith("xy")
  })

  it("selects multiple items, announces the count and selects all", async () => {
    const onSelectedChange = vi.fn()
    renderWithOnu(<MediaLister items={items} selectionMode="multiple" onSelectedChange={onSelectedChange} />)
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Nothing selected")
    const first = screen.getByRole("button", { name: /Maafushi/ })
    await userEvent.click(first)
    await userEvent.click(screen.getByRole("button", { name: /Council/ }))
    expect(first).toHaveAttribute("aria-pressed", "true")
    expect(status).toHaveTextContent("2 selected")
    await userEvent.click(first)
    expect(onSelectedChange).toHaveBeenLastCalledWith([2])
    await userEvent.click(screen.getByRole("button", { name: "Select all" }))
    expect(status).toHaveTextContent("4 selected")
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(status).toHaveTextContent("Nothing selected")
  })

  it("selects a single item (controlled) with the keyboard", async () => {
    function Controlled() {
      const [selected, setSelected] = React.useState<MediaId[]>([3])
      return <MediaLister items={items} selectionMode="single" selected={selected} onSelectedChange={setSelected} />
    }
    renderWithOnu(<Controlled />)
    const beach = screen.getByRole("button", { name: /Maafushi/ })
    beach.focus()
    await userEvent.keyboard(" ")
    expect(beach).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /Harbour/ })).toHaveAttribute("aria-pressed", "false")
    await userEvent.keyboard("{Enter}")
    expect(beach).toHaveAttribute("aria-pressed", "false")
  })

  it("loads more on scroll and with the button", async () => {
    let trigger: ((entries: { isIntersecting: boolean }[]) => void) | undefined
    class IO {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        trigger = cb
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IO)
    const onLoadMore = vi.fn()
    const { rerender } = renderWithOnu(<MediaLister items={items} hasMore onLoadMore={onLoadMore} />)
    act(() => trigger?.([{ isIntersecting: false }]))
    expect(onLoadMore).not.toHaveBeenCalled()
    act(() => trigger?.([{ isIntersecting: true }]))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole("button", { name: "Load more" }))
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    rerender(<MediaLister items={items} hasMore loading onLoadMore={onLoadMore} />)
    expect(screen.getByRole("button", { name: "Load more" })).toBeDisabled()
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Loading…")
  })

  it("pages through results", async () => {
    const onPageChange = vi.fn()
    const { rerender } = renderWithOnu(
      <MediaLister items={items} page={1} pageCount={3} onPageChange={onPageChange} view="list" />,
    )
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    rerender(<MediaLister items={items} page={3} pageCount={3} onPageChange={onPageChange} />)
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Go to previous page" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("shows item actions, loading skeletons, an empty state and a toolbar", () => {
    const { rerender } = renderWithOnu(
      <MediaLister
        items={items.slice(0, 1)}
        hideSearch
        toolbar={<Button>Upload</Button>}
        renderActions={(item) => <Button aria-label={`Delete ${item.name}`}>x</Button>}
        defaultView="list"
        classNames={{ item: "item-x" }}
      />,
    )
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete Maafushi beach.jpg" })).toBeInTheDocument()
    expect(screen.getByRole("listitem")).toHaveClass("item-x")
    rerender(<MediaLister items={[]} loading />)
    expect(document.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(0)
    rerender(<MediaLister items={[]} emptyMessage="Upload your first photo" />)
    expect(screen.getByText("Upload your first photo")).toBeInTheDocument()
    rerender(<MediaLister items={[]} />)
    expect(screen.getByText("No media yet")).toBeInTheDocument()
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<MediaLister items={items} selectionMode="multiple" searchThaana />, { locale: "dv", dir })
    expect(screen.getByRole("list", { name: "މީޑިއާ ލައިބްރަރީ" })).toBeInTheDocument()
    expect(screen.getByRole("searchbox")).toHaveAttribute("lang", "dv")
    // Names follow their own direction (so they truncate at their own end); sizes stay "313 KB".
    expect(screen.getByText("Maafushi beach.jpg").parentElement).toHaveAttribute("dir", "auto")
    expect(screen.getByText("313 KB")).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

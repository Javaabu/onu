import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { BackToTop } from "./back-to-top"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

function scrollWindow(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true })
  act(() => {
    window.dispatchEvent(new Event("scroll"))
  })
}

describe("BackToTop", () => {
  afterEach(() => {
    scrollWindow(0)
    vi.restoreAllMocks()
  })

  it("appears after scrolling past the threshold and scrolls smoothly to the top", async () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    renderWithOnu(
      <>
        <BackToTop threshold={100} focusTargetId="top" className="extra" />
        <h1 id="top">Top</h1>
      </>,
    )
    expect(screen.queryByRole("button")).toBeNull()
    scrollWindow(500)
    const button = screen.getByRole("button", { name: "Back to top" })
    expect(button).toHaveClass("fixed", "extra")
    fireEvent.click(button)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
    expect(screen.getByText("Top")).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("jumps instantly when the user prefers reduced motion", () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    renderWithOnu(<BackToTop alwaysVisible showLabel position="static" />)
    const button = screen.getByRole("button", { name: "Back to top" })
    expect(button).not.toHaveClass("fixed")
    fireEvent.click(button)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" })
    window.matchMedia = original
  })

  it("scrolls a container and honours onClick preventDefault", () => {
    function Demo({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
      const ref = React.useRef<HTMLDivElement>(null)
      return (
        <div ref={ref} data-testid="box">
          <BackToTop scrollContainer={ref} alwaysVisible onClick={onClick} />
        </div>
      )
    }
    const { unmount } = renderWithOnu(<Demo />)
    const box = screen.getByTestId("box")
    const scrollTo = vi.fn()
    box.scrollTo = scrollTo as unknown as typeof box.scrollTo
    fireEvent.click(screen.getByRole("button"))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
    unmount()

    const prevent = vi.fn((e: React.MouseEvent) => e.preventDefault())
    renderWithOnu(<Demo onClick={prevent} />)
    const box2 = screen.getByTestId("box")
    const scrollTo2 = vi.fn()
    box2.scrollTo = scrollTo2 as unknown as typeof box2.scrollTo
    fireEvent.click(screen.getByRole("button"))
    expect(prevent).toHaveBeenCalled()
    expect(scrollTo2).not.toHaveBeenCalled()
  })

  it.each(directions)("is translated in %s", (dir) => {
    renderWithOnu(<BackToTop alwaysVisible />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "މައްޗަށް" })).toBeInTheDocument()
  })
})

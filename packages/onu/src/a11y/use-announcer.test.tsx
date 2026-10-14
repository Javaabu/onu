import * as React from "react"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { announce, useAnnouncer, type UseAnnouncerOptions } from "./use-announcer"

function Mover({ options }: { options?: UseAnnouncerOptions }) {
  const { announce, clear, message, region } = useAnnouncer(options)
  return (
    <>
      <button type="button" onClick={() => announce("Row moved to position 2")}>
        Move
      </button>
      <button type="button" onClick={() => announce("Row moved to position 3")}>
        Move again
      </button>
      <button type="button" onClick={clear}>
        Clear
      </button>
      <span data-testid="message">{message}</span>
      {region}
    </>
  )
}

const liveRegion = () => document.querySelector<HTMLElement>("[data-slot=live-region]")!

describe("useAnnouncer", () => {
  afterEach(() => vi.useRealTimers())

  it("renders an empty polite region and announces a message through it", async () => {
    const user = userEvent.setup()
    renderWithOnu(<Mover />)
    expect(liveRegion()).toBeEmptyDOMElement()
    expect(liveRegion()).toHaveAttribute("aria-live", "polite")
    await user.click(screen.getByRole("button", { name: "Move" }))
    expect(liveRegion()).toHaveTextContent("Row moved to position 2")
    expect(screen.getByTestId("message")).toHaveTextContent("Row moved to position 2")
    await user.click(screen.getByRole("button", { name: "Move again" }))
    expect(liveRegion()).toHaveTextContent("Row moved to position 3")
  })

  it("clears and re-sets a repeated message, so it is read again", () => {
    vi.useFakeTimers()
    renderWithOnu(<Mover />)
    const move = screen.getByRole("button", { name: "Move" })
    act(() => move.click())
    expect(liveRegion()).toHaveTextContent("Row moved to position 2")
    act(() => move.click())
    expect(liveRegion()).toBeEmptyDOMElement()
    act(() => vi.advanceTimersByTime(100))
    expect(liveRegion()).toHaveTextContent("Row moved to position 2")
  })

  it("lets a new message replace a pending repeat", () => {
    vi.useFakeTimers()
    renderWithOnu(<Mover />)
    act(() => screen.getByRole("button", { name: "Move" }).click())
    act(() => screen.getByRole("button", { name: "Move" }).click())
    act(() => screen.getByRole("button", { name: "Move again" }).click())
    expect(liveRegion()).toHaveTextContent("Row moved to position 3")
    act(() => vi.advanceTimersByTime(500))
    expect(liveRegion()).toHaveTextContent("Row moved to position 3")
  })

  it("clears the region, and announces the same message again after a clear", () => {
    vi.useFakeTimers()
    renderWithOnu(<Mover />)
    act(() => screen.getByRole("button", { name: "Move" }).click())
    act(() => screen.getByRole("button", { name: "Clear" }).click())
    expect(liveRegion()).toBeEmptyDOMElement()
    act(() => screen.getByRole("button", { name: "Move" }).click())
    expect(liveRegion()).toHaveTextContent("Row moved to position 2")
  })

  it("passes options to the region", () => {
    renderWithOnu(<Mover options={{ politeness: "assertive", role: "status", className: "x" }} />)
    expect(screen.getByRole("status")).toBe(liveRegion())
    expect(liveRegion()).toHaveAttribute("aria-live", "assertive")
    expect(liveRegion()).toHaveClass("x", "sr-only")
  })

  it("does not set state after unmounting", () => {
    vi.useFakeTimers()
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { unmount } = renderWithOnu(<Mover />)
    act(() => screen.getByRole("button", { name: "Move" }).click())
    act(() => screen.getByRole("button", { name: "Move" }).click())
    unmount()
    act(() => vi.advanceTimersByTime(200))
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it("has no axe violations", async () => {
    renderWithOnu(<Mover />, { dir: "rtl" })
    await expectNoA11yViolations()
  })
})

describe("announce", () => {
  const polite = () => document.querySelector<HTMLElement>('[data-onu-announcer="polite"]')
  const assertive = () => document.querySelector<HTMLElement>('[data-onu-announcer="assertive"]')

  afterEach(() => {
    vi.useRealTimers()
    polite()?.remove()
    assertive()?.remove()
  })

  it("creates one hidden page-wide region and fills it after a short delay", () => {
    vi.useFakeTimers()
    announce("Settings saved")
    const el = polite()!
    expect(el.parentElement).toBe(document.body)
    expect(el).toHaveAttribute("aria-live", "polite")
    expect(el).toHaveAttribute("aria-atomic", "true")
    expect(el.style.position).toBe("absolute")
    expect(el.style.width).toBe("1px")
    // A new region is filled a moment later, so screen readers notice the change.
    expect(el).toBeEmptyDOMElement()
    vi.advanceTimersByTime(100)
    expect(el).toHaveTextContent("Settings saved")

    announce("Draft deleted")
    expect(document.querySelectorAll('[data-onu-announcer="polite"]')).toHaveLength(1)
    expect(el).toHaveTextContent("Draft deleted")
  })

  it("repeats the same message by clearing it first", () => {
    vi.useFakeTimers()
    announce("Copied")
    vi.advanceTimersByTime(100)
    announce("Copied")
    expect(polite()).toBeEmptyDOMElement()
    vi.advanceTimersByTime(100)
    expect(polite()).toHaveTextContent("Copied")
  })

  it("uses a separate assertive region", () => {
    vi.useFakeTimers()
    announce("Connection lost", { politeness: "assertive" })
    vi.advanceTimersByTime(100)
    expect(assertive()).toHaveTextContent("Connection lost")
    expect(assertive()).toHaveAttribute("aria-live", "assertive")
    expect(polite()).toBeNull()
  })

  it("cancels a pending message when a newer one arrives", () => {
    vi.useFakeTimers()
    announce("First")
    announce("Second")
    expect(polite()).toHaveTextContent("Second")
    vi.advanceTimersByTime(200)
    expect(polite()).toHaveTextContent("Second")
  })
})

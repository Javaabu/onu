import * as React from "react"
import { act, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AutosaveIndicator, useAutosave } from "./autosave-indicator"

afterEach(() => {
  vi.useRealTimers()
})

describe("AutosaveIndicator", () => {
  it.each([
    ["idle", "All changes saved", ""],
    ["saving", "Saving…", "Saving…"],
    ["saved", "Saved", "Saved"],
    ["error", "Couldn’t save changes", "Couldn’t save changes"],
  ] as const)("shows the %s state and announces it", async (status, text, spoken) => {
    const { container } = renderWithOnu(<AutosaveIndicator status={status} />)
    expect(container.firstElementChild).toHaveAttribute("data-status", status)
    expect(container.firstElementChild).toHaveTextContent(text)
    expect(screen.getByRole("status")).toHaveTextContent(spoken)
    await expectNoA11yViolations()
  })

  it("shows relative time that refreshes, and 'just now' for recent saves", () => {
    vi.useFakeTimers({ now: new Date("2026-03-12T10:00:00Z") })
    const { container, rerender } = renderWithOnu(<AutosaveIndicator status="saved" lastSavedAt={Date.now() - 5000} />)
    expect(container).toHaveTextContent("Saved just now")
    rerender(<AutosaveIndicator status="saved" lastSavedAt={new Date(Date.now() - 2 * 60_000)} />)
    expect(container).toHaveTextContent("Saved 2 minutes ago")
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(container).toHaveTextContent("Saved 3 minutes ago")
    // The live region only says "Saved", not the ticking time.
    expect(screen.getByRole("status")).toHaveTextContent(/^Saved$/)
  })

  it("offers Retry on error and accepts a custom message", async () => {
    const onRetry = vi.fn()
    renderWithOnu(<AutosaveIndicator status="error" error="Offline" onRetry={onRetry} />)
    expect(screen.getByRole("status")).toHaveTextContent("Offline")
    await userEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalled()
  })

  it("compact mode hides the text visually", () => {
    const { container } = renderWithOnu(<AutosaveIndicator status="saving" compact className="x" />)
    expect(container.firstElementChild).toHaveAttribute("title", "Saving…")
    expect(container.firstElementChild).toHaveClass("x")
  })

  it.each(directions)("uses Dhivehi strings and relative time (%s)", async (dir) => {
    vi.useFakeTimers({ now: new Date("2026-03-12T10:00:00Z") })
    renderWithOnu(<AutosaveIndicator status="saved" lastSavedAt={Date.now() - 3 * 60_000} />, { locale: "dv", dir })
    expect(screen.getByRole("status")).toHaveTextContent("ސޭވްކުރެވިއްޖެ")
    expect(document.querySelector("[data-slot=autosave-indicator]")!.textContent).toContain("ސޭވްކުރެވުނު")
    vi.useRealTimers()
    await expectNoA11yViolations()
  })
})

describe("useAutosave", () => {
  it("debounces saves and reports saving → saved", async () => {
    vi.useFakeTimers()
    const onSave = vi.fn(() => Promise.resolve())
    const { result, rerender } = renderHook(({ value }) => useAutosave(value, { onSave, delay: 500 }), {
      initialProps: { value: "a" },
    })
    expect(result.current.status).toBe("idle")
    rerender({ value: "ab" })
    rerender({ value: "abc" })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith("abc")
    expect(result.current.status).toBe("saved")
    expect(result.current.lastSavedAt).toEqual(expect.any(Number))
    // Unchanged value: flush does nothing.
    await act(() => result.current.flush())
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("goes to error and retries", async () => {
    vi.useFakeTimers()
    let fail = true
    const onSave = vi.fn(() => (fail ? Promise.reject(new Error("x")) : Promise.resolve()))
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave(value, { onSave, isEqual: (a, b) => a.n === b.n }),
      { initialProps: { value: { n: 1 } } },
    )
    rerender({ value: { n: 2 } })
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.status).toBe("error")
    fail = false
    await act(async () => {
      result.current.onRetry()
    })
    expect(result.current.status).toBe("saved")
  })

  it("does not save while disabled", () => {
    vi.useFakeTimers()
    const onSave = vi.fn()
    const { rerender } = renderHook(({ value }) => useAutosave(value, { onSave, enabled: false }), {
      initialProps: { value: 1 },
    })
    rerender({ value: 2 })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onSave).not.toHaveBeenCalled()
  })

  it("works with the indicator", () => {
    function Demo() {
      const [v] = React.useState("x")
      const autosave = useAutosave(v, { onSave: () => {} })
      return <AutosaveIndicator {...autosave} />
    }
    renderWithOnu(<Demo />)
    expect(screen.getByText("All changes saved")).toBeInTheDocument()
  })
})

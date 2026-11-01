import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useCopyToClipboard, writeClipboard } from "./use-copy-to-clipboard"

function stubClipboard(writeText: (text: string) => Promise<void>) {
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
}

describe("useCopyToClipboard", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("reports copied, then goes back to idle after the timeout", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)
    const { result } = renderHook(() => useCopyToClipboard(1000))
    await act(async () => {
      expect(await result.current.copy("hello")).toBe(true)
    })
    expect(writeText).toHaveBeenCalledWith("hello")
    expect(result.current.status).toBe("copied")
    act(() => void vi.advanceTimersByTime(1000))
    expect(result.current.status).toBe("idle")
  })

  it("reports failed when neither path can copy", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")))
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      expect(await result.current.copy("hello")).toBe(false)
    })
    expect(result.current.status).toBe("failed")
  })

  it("falls back to execCommand", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")))
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true })
    expect(await writeClipboard("hello")).toBe(true)
    expect(execCommand).toHaveBeenCalledWith("copy")
    Reflect.deleteProperty(document, "execCommand")
  })
})

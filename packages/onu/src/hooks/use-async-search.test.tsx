import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAsyncSearch, useDebouncedValue } from "./use-async-search"

const flush = () => act(async () => {})

describe("useAsyncSearch", () => {
  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  it("waits 300 ms by default, then reports the result", async () => {
    const search = vi.fn(async (q: string) => [q])
    const { result } = renderHook(() => useAsyncSearch({ search, query: "a" }))
    expect(result.current.pending).toBe(true)
    expect(result.current.status).toBe("idle")
    act(() => void vi.advanceTimersByTime(299))
    expect(search).not.toHaveBeenCalled()
    act(() => void vi.advanceTimersByTime(1))
    expect(search).toHaveBeenCalledTimes(1)
    await flush()
    expect(result.current).toMatchObject({ data: ["a"], status: "done", pending: false })
  })

  it("aborts the older request when the query changes", async () => {
    const signals: AbortSignal[] = []
    const search = vi.fn((q: string, { signal }: { signal: AbortSignal }) => {
      signals.push(signal)
      return new Promise<string>((resolve) => setTimeout(() => resolve(q), 100))
    })
    const { result, rerender } = renderHook(({ query }) => useAsyncSearch({ search, query, delay: 10 }), {
      initialProps: { query: "a" },
    })
    act(() => void vi.advanceTimersByTime(10))
    expect(result.current.status).toBe("loading")
    rerender({ query: "ab" })
    expect(signals[0]!.aborted).toBe(true)
    await act(async () => void vi.advanceTimersByTime(200))
    expect(result.current.data).toBe("ab")
  })

  it("does nothing while disabled", () => {
    const search = vi.fn(async () => [])
    const { result } = renderHook(() => useAsyncSearch({ search, query: "a", enabled: false }))
    act(() => void vi.advanceTimersByTime(1000))
    expect(search).not.toHaveBeenCalled()
    expect(result.current).toMatchObject({ status: "idle", pending: false })
  })

  it("keeps the last data on failure, retries without the debounce, and clears", async () => {
    const search = vi
      .fn<(q: string) => Promise<string>>()
      .mockResolvedValueOnce("first")
      .mockRejectedValueOnce(new Error())
    const { result, rerender } = renderHook(({ query }) => useAsyncSearch({ search, query }), {
      initialProps: { query: "a" },
    })
    await act(async () => void vi.advanceTimersByTime(300))
    rerender({ query: "ab" })
    await act(async () => void vi.advanceTimersByTime(300))
    expect(result.current).toMatchObject({ data: "first", status: "error", pending: false })

    search.mockResolvedValueOnce("second")
    act(() => result.current.retry())
    expect(result.current).toMatchObject({ status: "loading", pending: true })
    await act(async () => void vi.advanceTimersByTime(0))
    expect(result.current).toMatchObject({ data: "second", status: "done", pending: false })

    act(() => result.current.clear())
    expect(result.current.data).toBeUndefined()
  })
})

describe("useDebouncedValue", () => {
  beforeEach(() => void vi.useFakeTimers())
  afterEach(() => void vi.useRealTimers())

  it("updates after the delay, and at once when the delay is 0", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: "a", delay: undefined as number | undefined },
    })
    rerender({ value: "b", delay: undefined })
    expect(result.current).toBe("a")
    act(() => void vi.advanceTimersByTime(300))
    expect(result.current).toBe("b")
    rerender({ value: "c", delay: 0 })
    expect(result.current).toBe("c")
  })
})

import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useControllableState } from "./use-controllable-state"

describe("useControllableState", () => {
  it("keeps its own state when uncontrolled, and calls onChange", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<string>(undefined, "a", onChange))
    expect(result.current[0]).toBe("a")
    act(() => result.current[1]("b"))
    expect(result.current[0]).toBe("b")
    expect(onChange).toHaveBeenCalledWith("b")
  })

  it("follows the value when controlled, and still calls onChange", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<string>("a", "z", onChange))
    act(() => result.current[1]("b"))
    expect(result.current[0]).toBe("a")
    expect(onChange).toHaveBeenCalledWith("b")
  })

  it("treats undefined as uncontrolled and null as a value", () => {
    const { result } = renderHook(() => useControllableState<string | null>(null, "z"))
    expect(result.current[0]).toBeNull()
    act(() => result.current[1]("b"))
    expect(result.current[0]).toBeNull()
  })

  it("passes extra arguments to onChange", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<string, [number]>(undefined, "a", onChange))
    act(() => result.current[1]("b", 2))
    expect(onChange).toHaveBeenCalledWith("b", 2)
  })

  it("has a stable setter that calls the latest onChange", () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(({ cb }) => useControllableState<string>(undefined, "a", cb), {
      initialProps: { cb: first },
    })
    const setter = result.current[1]
    rerender({ cb: second })
    expect(result.current[1]).toBe(setter)
    act(() => setter("b"))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith("b")
  })
})

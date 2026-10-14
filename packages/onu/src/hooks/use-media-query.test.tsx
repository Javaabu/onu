import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { controllableMatchMedia } from "../../test/match-media"
import { useCoarsePointer, useMediaQuery, useNoHover } from "./use-media-query"
import { useIsMobile } from "./use-mobile"

describe("useMediaQuery", () => {
  let media: ReturnType<typeof controllableMatchMedia>
  afterEach(() => media.restore())

  it("returns whether the query matches and follows changes", () => {
    media = controllableMatchMedia(() => false)
    const { result, unmount } = renderHook(() => useMediaQuery("(min-width: 1024px)"))
    expect(result.current).toBe(false)
    act(() => media.set((q) => q === "(min-width: 1024px)"))
    expect(result.current).toBe(true)
    expect(media.listenerCount()).toBe(1)
    unmount()
    expect(media.listenerCount()).toBe(0)
  })

  it("resubscribes when the query changes", () => {
    media = controllableMatchMedia((q) => q === "(orientation: portrait)")
    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(orientation: landscape)" },
    })
    expect(result.current).toBe(false)
    rerender({ query: "(orientation: portrait)" })
    expect(result.current).toBe(true)
    expect(media.listenerCount()).toBe(1)
  })

  it("has helpers for touch-first devices", () => {
    media = controllableMatchMedia((q) => q === "(pointer: coarse)" || q === "(hover: none)")
    expect(renderHook(() => useCoarsePointer()).result.current).toBe(true)
    expect(renderHook(() => useNoHover()).result.current).toBe(true)
    media.set(() => false)
    expect(renderHook(() => useCoarsePointer()).result.current).toBe(false)
  })
})

describe("useIsMobile", () => {
  let media: ReturnType<typeof controllableMatchMedia>
  afterEach(() => media.restore())

  it("is true below the md breakpoint (768px)", () => {
    const below = (width: number) => (q: string) => {
      const max = /max-width: (\d+)px/.exec(q)
      return max ? width <= Number(max[1]) : false
    }
    media = controllableMatchMedia(below(1280))
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => media.set(below(767)))
    expect(result.current).toBe(true)
    act(() => media.set(below(768)))
    expect(result.current).toBe(false)
  })
})

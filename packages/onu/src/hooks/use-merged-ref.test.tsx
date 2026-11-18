import * as React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useMergedRef } from "./use-merged-ref"

function Probe({ a, b }: { a?: React.Ref<HTMLDivElement>; b?: React.Ref<HTMLDivElement> }) {
  return <div ref={useMergedRef(a, b)} />
}

describe("useMergedRef", () => {
  it("sets object and callback refs, and clears them on unmount", () => {
    const object = React.createRef<HTMLDivElement>()
    const callback = vi.fn()
    const { container, unmount } = render(<Probe a={object} b={callback} />)
    expect(object.current).toBe(container.firstChild)
    expect(callback).toHaveBeenCalledWith(container.firstChild)
    unmount()
    expect(object.current).toBeNull()
    expect(callback).toHaveBeenLastCalledWith(null)
  })

  it("calls a React 19 callback ref's cleanup instead of calling it with null (#66, 4.5)", () => {
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)
    const object = React.createRef<HTMLDivElement>()
    const { container, unmount } = render(<Probe a={callback} b={object} />)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(container.firstChild)
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(object.current).toBeNull()
  })

  it("still calls a callback ref without a cleanup with null, next to one with a cleanup", () => {
    const plain = vi.fn()
    const cleanup = vi.fn()
    const { unmount } = render(<Probe a={plain} b={() => cleanup} />)
    unmount()
    expect(plain).toHaveBeenLastCalledWith(null)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})

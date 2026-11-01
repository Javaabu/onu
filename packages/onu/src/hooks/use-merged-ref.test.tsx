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
})

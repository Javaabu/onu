import * as React from "react"
import { act, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FloatingSubmit } from "./floating-submit"
import { Form } from "./form"
import { SubmitButton } from "./submit-button"

type Callback = (entries: { isIntersecting: boolean }[]) => void
let observers: { cb: Callback; target?: Element; disconnect: ReturnType<typeof vi.fn> }[] = []

beforeEach(() => {
  observers = []
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      cb: Callback
      disconnect = vi.fn()
      constructor(cb: Callback) {
        this.cb = cb
        observers.push(this as never)
      }
      observe(target: Element) {
        ;(this as unknown as { target: Element }).target = target
      }
      unobserve() {}
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const scroll = (visible: boolean) =>
  act(() => {
    observers.forEach((o) => o.cb([{ isIntersecting: visible }]))
  })

describe("FloatingSubmit", () => {
  it("appears when the main submit scrolls out of view and hides when it is back", async () => {
    renderWithOnu(
      <Form>
        <SubmitButton>Save application</SubmitButton>
        <FloatingSubmit>Save</FloatingSubmit>
      </Form>,
    )
    expect(observers[0]!.target).toHaveTextContent("Save application")
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
    scroll(false)
    const floating = screen.getByRole("button", { name: "Save" })
    expect(floating).toHaveAttribute("type", "submit")
    expect(floating.closest("[data-slot=floating-submit]")).toHaveClass("fixed")
    await expectNoA11yViolations()
    scroll(true)
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument()
  })

  it("watches an explicit target and disconnects on unmount", () => {
    function Page() {
      const ref = React.useRef<HTMLDivElement>(null)
      return (
        <>
          <div ref={ref}>footer</div>
          <FloatingSubmit target={ref} />
        </>
      )
    }
    const { unmount } = renderWithOnu(<Page />)
    expect(observers[0]!.target).toHaveTextContent("footer")
    unmount()
    expect(observers[0]!.disconnect).toHaveBeenCalled()
  })

  it("shows the processing state of the form and can be forced visible", () => {
    renderWithOnu(
      <Form processing>
        <FloatingSubmit forceVisible classNames={{ root: "r", button: "b" }} />
      </Form>,
    )
    const button = screen.getByRole("button", { name: "Submit" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveClass("b")
  })

  it("does nothing without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined)
    renderWithOnu(
      <form>
        <button type="submit">Go</button>
        <FloatingSubmit />
      </form>,
    )
    expect(screen.getAllByRole("button")).toHaveLength(1)
  })

  it.each(directions)("sits at the inline end in %s", (dir) => {
    renderWithOnu(<FloatingSubmit forceVisible />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ހުށަހަޅާ" }).parentElement).toHaveClass("sm:end-6")
  })
})

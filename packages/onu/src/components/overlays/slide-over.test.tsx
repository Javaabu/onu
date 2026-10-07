import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import {
  SlideOver,
  SlideOverBody,
  SlideOverClose,
  SlideOverContent,
  SlideOverFooter,
  SlideOverHeader,
  SlideOverRoot,
  SlideOverTitle,
  SlideOverTrigger,
  physicalSide,
} from "./slide-over"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("physicalSide", () => {
  it("maps logical sides to physical ones per direction", () => {
    expect(physicalSide("start", "ltr")).toBe("left")
    expect(physicalSide("end", "ltr")).toBe("right")
    expect(physicalSide("start", "rtl")).toBe("right")
    expect(physicalSide("end", "rtl")).toBe("left")
  })
})

describe("SlideOver", () => {
  it("opens from the trigger with a sticky header, scrolling body and footer", async () => {
    renderWithOnu(
      <SlideOver
        trigger={<Button>Edit vessel</Button>}
        title="Edit vessel"
        description="MV Hithadhoo Express"
        footer={<Button>Save</Button>}
      >
        <p>Body</p>
      </SlideOver>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Edit vessel" }))
    const panel = screen.getByRole("dialog", { name: "Edit vessel" })
    expect(panel).toHaveAccessibleDescription("MV Hithadhoo Express")
    expect(panel).toHaveAttribute("data-side", "right")
    expect(panel).toHaveAttribute("data-logical-side", "end")
    expect(panel.querySelector("[data-slot=slide-over-header]")).toBeInTheDocument()
    expect(panel.querySelector("[data-slot=slide-over-body]")).toHaveClass("overflow-y-auto")
    expect(panel.querySelector("[data-slot=slide-over-footer]")).toContainElement(
      screen.getByRole("button", { name: "Save" }),
    )
    await expectNoA11yViolations()
  })

  it.each(directions)("puts side=end on the inline end in %s", (dir) => {
    renderWithOnu(<SlideOver defaultOpen side="end" title="Panel" />, { dir })
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", dir === "rtl" ? "left" : "right")
  })

  it.each(directions)("puts side=start on the inline start in %s", (dir) => {
    renderWithOnu(<SlideOver defaultOpen side="start" title="Panel" />, { dir })
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", dir === "rtl" ? "right" : "left")
  })

  it.each(["sm", "md", "lg", "xl", "full"] as const)("applies size %s", (size) => {
    renderWithOnu(<SlideOver defaultOpen title="Panel" size={size} />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-size", size)
  })

  it("closes with Escape and returns focus to the trigger", async () => {
    renderWithOnu(<SlideOver trigger={<Button>Open</Button>} title="Panel" />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus()
  })

  it("returns focus to the opener when controlled without a trigger", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Details</Button>
          <SlideOver open={open} onOpenChange={setOpen} title="Details" />
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.click(screen.getByRole("button", { name: "Details" }))
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Details" })).toHaveFocus()
  })

  it("accepts className, classNames and ref", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithOnu(
      <SlideOver
        defaultOpen
        ref={ref}
        title="Panel"
        footer="Footer"
        closeButton
        className="root-x"
        classNames={{ header: "h-x", title: "t-x", body: "b-x", footer: "f-x", close: "c-x" }}
      >
        Body
      </SlideOver>,
    )
    const panel = screen.getByRole("dialog")
    expect(ref.current).toBe(panel)
    expect(panel).toHaveClass("root-x")
    expect(panel.querySelector(".h-x")).toBeInTheDocument()
    expect(screen.getByText("Panel")).toHaveClass("t-x")
    expect(screen.getByText("Body")).toHaveClass("b-x")
    expect(screen.getByText("Footer")).toHaveClass("f-x")
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("c-x")
  })

  it("composes from parts without a close button", async () => {
    renderWithOnu(
      <SlideOverRoot>
        <SlideOverTrigger asChild>
          <Button>Filters</Button>
        </SlideOverTrigger>
        <SlideOverContent side="start" aria-describedby={undefined}>
          <SlideOverHeader closeButton={false}>
            <SlideOverTitle>Filters</SlideOverTitle>
          </SlideOverHeader>
          <SlideOverBody>Island</SlideOverBody>
          <SlideOverFooter>
            <SlideOverClose asChild>
              <Button>Apply</Button>
            </SlideOverClose>
          </SlideOverFooter>
        </SlideOverContent>
      </SlideOverRoot>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Filters" }))
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<SlideOver defaultOpen title="ތަފްސީލު" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

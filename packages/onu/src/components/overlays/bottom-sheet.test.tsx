import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetRoot,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "./bottom-sheet"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("BottomSheet", () => {
  it("opens from the trigger with a handle, title, body and footer", async () => {
    renderWithOnu(
      <BottomSheet
        trigger={<Button>Filter by island</Button>}
        title="Filter by island"
        description="Show offices on these islands."
        footer={<Button>Apply</Button>}
      >
        <p>Malé</p>
      </BottomSheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Filter by island" }))
    const sheet = await screen.findByRole("dialog", { name: "Filter by island" })
    expect(sheet).toHaveAccessibleDescription("Show offices on these islands.")
    expect(sheet).toHaveAttribute("data-slot", "bottom-sheet-content")
    expect(sheet.querySelector("[data-slot=bottom-sheet-handle]")).toHaveAttribute("aria-hidden", "true")
    expect(sheet.querySelector("[data-slot=bottom-sheet-body]")).toHaveTextContent("Malé")
    expect(sheet.querySelector("[data-slot=bottom-sheet-footer]")).toContainElement(
      screen.getByRole("button", { name: "Apply" }),
    )
    expect(sheet.className).toContain("pb-[env(safe-area-inset-bottom)]")
    await expectNoA11yViolations()
  })

  it("closes with Escape (keyboard alternative to dragging) and returns focus", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(<BottomSheet trigger={<Button>Open</Button>} title="Sheet" onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 2000 })
    await waitFor(() => expect(screen.getByRole("button", { name: "Open" })).toHaveFocus())
  })

  it("closes with the close button (button alternative to dragging)", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(<BottomSheet defaultOpen title="Sheet" onOpenChange={onOpenChange} />)
    await userEvent.click(await screen.findByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("does not close on Escape when not dismissible", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <BottomSheet open onOpenChange={onOpenChange} dismissible={false} closeButton={false} title="Terms" />,
    )
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("toggles between the first and last snap point with the expand button", async () => {
    const onSnap = vi.fn()
    renderWithOnu(<BottomSheet defaultOpen title="Route" snapPoints={[0.4, 1]} onActiveSnapPointChange={onSnap} />)
    const sheet = await screen.findByRole("dialog")
    expect(sheet).toHaveAttribute("data-snapping", "true")
    const expand = screen.getByRole("button", { name: "Expand" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(expand)
    expect(onSnap).toHaveBeenLastCalledWith(1)
    const collapse = screen.getByRole("button", { name: "Collapse" })
    expect(collapse).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(collapse)
    expect(onSnap).toHaveBeenLastCalledWith(0.4)
  })

  it("supports a controlled snap point", async () => {
    renderWithOnu(<BottomSheet defaultOpen title="Route" snapPoints={["200px", 0.6, 1]} activeSnapPoint={1} />)
    expect(await screen.findByRole("button", { name: "Collapse" })).toBeInTheDocument()
  })

  it("hides the title visually and accepts className, classNames and ref", async () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithOnu(
      <BottomSheet
        defaultOpen
        ref={ref}
        title="Hidden"
        hideTitle
        handle={false}
        size="lg"
        footer="Footer"
        className="root-x"
        classNames={{ header: "h-x", body: "b-x", footer: "f-x", close: "c-x" }}
      >
        Body
      </BottomSheet>,
    )
    const sheet = await screen.findByRole("dialog", { name: "Hidden" })
    expect(ref.current).toBe(sheet)
    expect(sheet).toHaveClass("root-x")
    expect(sheet).toHaveAttribute("data-size", "lg")
    expect(sheet.querySelector("[data-slot=bottom-sheet-handle]")).toBeNull()
    expect(screen.getByText("Hidden")).toHaveClass("sr-only")
    expect(sheet.querySelector(".h-x")).toBeInTheDocument()
    expect(screen.getByText("Body")).toHaveClass("b-x")
    expect(screen.getByText("Footer")).toHaveClass("f-x")
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("c-x")
  })

  it("composes from parts", async () => {
    renderWithOnu(
      <BottomSheetRoot>
        <BottomSheetTrigger asChild>
          <Button>Open</Button>
        </BottomSheetTrigger>
        <BottomSheetContent aria-describedby={undefined}>
          <BottomSheetHeader closeButton={false}>
            <BottomSheetTitle>Parts</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody>Body</BottomSheetBody>
          <BottomSheetFooter>
            <BottomSheetClose asChild>
              <Button>Done</Button>
            </BottomSheetClose>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheetRoot>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(await screen.findByRole("dialog", { name: "Parts" })).toBeInTheDocument()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<BottomSheet defaultOpen title="ރަށް" snapPoints={[0.5, 1]} />, { locale: "dv", dir })
    expect(await screen.findByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ބޮޑުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

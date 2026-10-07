import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { Tip } from "./tip"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const touch = { pointerType: "touch", pointerId: 1, button: 0 }

describe("Tip", () => {
  afterEach(() => vi.useRealTimers())

  it("shows on keyboard focus and hides on Escape", async () => {
    renderWithOnu(
      <Tip content="Edit (E)">
        <Button aria-label="Edit">E</Button>
      </Tip>,
    )
    await userEvent.tab()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit (E)")
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAccessibleDescription("Edit (E)")
    await expectNoA11yViolations()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument())
  })

  it("renders a labelled ⓘ button when there is no trigger", async () => {
    renderWithOnu(<Tip content="A 10% service charge applies." />)
    const button = screen.getByRole("button", { name: "More information" })
    expect(button).toHaveAttribute("data-slot", "tip-trigger")
    await expectNoA11yViolations()
  })

  it("toggles on tap on touch screens (no hover-only content, R3.26)", async () => {
    renderWithOnu(<Tip content="Service charge" />)
    const button = screen.getByRole("button", { name: "More information" })
    fireEvent.pointerDown(button, touch)
    fireEvent.pointerUp(button, touch)
    fireEvent.click(button)
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Service charge")
    fireEvent.pointerDown(button, touch)
    fireEvent.click(button)
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument())
  })

  it("opens on long press for triggers with their own action, without blocking the action on tap", () => {
    vi.useFakeTimers()
    const onClick = vi.fn()
    renderWithOnu(
      <Tip content="Print receipt">
        <Button aria-label="Print" onClick={onClick}>
          P
        </Button>
      </Tip>,
    )
    const button = screen.getByRole("button", { name: "Print" })
    // A short tap runs the action and shows nothing.
    fireEvent.pointerDown(button, touch)
    fireEvent.pointerUp(button, touch)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    // A long press shows the tip, and the click that ends it doesn't close it.
    fireEvent.pointerDown(button, touch)
    const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true })
    button.dispatchEvent(menu)
    expect(menu.defaultPrevented).toBe(true)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    fireEvent.pointerUp(button, touch)
    fireEvent.click(button)
    expect(screen.getByRole("tooltip")).toHaveTextContent("Print receipt")
  })

  it("cancels the long press when the finger lifts early", () => {
    vi.useFakeTimers()
    renderWithOnu(
      <Tip content="Tip" touch="long-press">
        <Button>Hold</Button>
      </Tip>,
    )
    const button = screen.getByRole("button", { name: "Hold" })
    fireEvent.pointerDown(button, touch)
    act(() => {
      vi.advanceTimersByTime(200)
    })
    fireEvent.pointerCancel(button, touch)
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("ignores mouse clicks (hover handles mice)", () => {
    renderWithOnu(<Tip content="Tip" />)
    const button = screen.getByRole("button", { name: "More information" })
    fireEvent.pointerDown(button, { pointerType: "mouse" })
    fireEvent.click(button)
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it("is controllable and accepts className", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(<Tip content="Always" open onOpenChange={onOpenChange} className="tip-x" />)
    await screen.findByRole("tooltip")
    expect(document.querySelector("[data-slot=tip-content]")).toHaveClass("tip-x")
  })

  it("renders only the trigger when disabled", () => {
    renderWithOnu(
      <Tip content="Never" disabled defaultOpen>
        <Button>Plain</Button>
      </Tip>,
    )
    expect(screen.getByRole("button", { name: "Plain" })).toBeInTheDocument()
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Tip content="ޖީއެސްޓީ 8%" defaultOpen />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "އިތުރު މަޢުލޫމާތު" })).toBeInTheDocument()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("ޖީއެސްޓީ 8%")
    await expectNoA11yViolations()
  })
})

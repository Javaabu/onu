import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { InlineEdit } from "./inline-edit"

describe("InlineEdit", () => {
  it("shows the value as a button and edits on click", async () => {
    renderWithOnu(<InlineEdit label="Name" defaultValue="Aishath Shifa" />)
    const display = screen.getByRole("button", { name: "Edit Name: Aishath Shifa" })
    await expectNoA11yViolations()
    await userEvent.click(display)
    const input = screen.getByRole("textbox", { name: "Name" })
    expect(input).toHaveValue("Aishath Shifa")
    expect(input).toHaveFocus()
    expect(input).toHaveAccessibleDescription("Press Enter to save or Escape to cancel.")
    await expectNoA11yViolations()
  })

  it("Enter saves, focus returns to the value and the save is announced (uncontrolled)", async () => {
    const onSave = vi.fn()
    renderWithOnu(<InlineEdit label="Name" defaultValue="Ali" onSave={onSave} />)
    screen.getByRole("button").focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.clear(screen.getByRole("textbox"))
    await userEvent.type(screen.getByRole("textbox"), "Ahmed{Enter}")
    expect(onSave).toHaveBeenCalledWith("Ahmed")
    const display = await screen.findByRole("button", { name: /Ahmed/ })
    await waitFor(() => expect(display).toHaveFocus())
    expect(screen.getByRole("status")).toHaveTextContent("Name saved")
  })

  it("Escape cancels and restores the value", async () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()
    renderWithOnu(<InlineEdit label="Name" defaultValue="Ali" onSave={onSave} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button"))
    await userEvent.type(screen.getByRole("textbox"), "zzz{Escape}")
    expect(onSave).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: /Ali/ })).toHaveFocus()
  })

  it("shows a saving state and an error when an async save fails, staying in edit mode", async () => {
    let reject!: (e: Error) => void
    const onSave = vi.fn(() => new Promise((_, r) => (reject = r)))
    renderWithOnu(<InlineEdit label="Island" defaultValue="Male'" onSave={onSave} />)
    await userEvent.click(screen.getByRole("button"))
    await userEvent.type(screen.getByRole("textbox"), "x{Enter}")
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly")
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("aria-busy", "true")
    await act(async () => reject(new Error("Island not found")))
    expect(screen.getByRole("alert")).toHaveTextContent("Island not found")
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("textbox")).toHaveValue("Male'x")
  })

  it("uses a generic error message when the error has none", async () => {
    renderWithOnu(
      <InlineEdit
        label="X"
        defaultValue="a"
        onSave={() => {
          throw "nope"
        }}
      />,
    )
    await userEvent.click(screen.getByRole("button"))
    await userEvent.type(screen.getByRole("textbox"), "b{Enter}")
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t save. Please try again.")
  })

  it("validates before saving", async () => {
    const onSave = vi.fn()
    renderWithOnu(
      <InlineEdit label="Name" defaultValue="Ali" onSave={onSave} validate={(v) => (v ? null : "Required")} />,
    )
    await userEvent.click(screen.getByRole("button"))
    await userEvent.clear(screen.getByRole("textbox"))
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("alert")).toHaveTextContent("Required")
    expect(onSave).not.toHaveBeenCalled()
  })

  it("closes without saving when unchanged, and save/cancel buttons work", async () => {
    const onSave = vi.fn()
    renderWithOnu(<InlineEdit label="Name" defaultValue="Ali" onSave={onSave} />)
    await userEvent.click(screen.getByRole("button"))
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(onSave).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: /Edit Name/ }))
    await userEvent.type(screen.getByRole("textbox"), "!")
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByRole("button", { name: "Edit Name: Ali" })).toBeInTheDocument()
  })

  it("saves on blur by default, cancels on blur when asked", async () => {
    const onSave = vi.fn()
    const { rerender } = renderWithOnu(
      <>
        <InlineEdit label="A" defaultValue="1" onSave={onSave} />
        <button type="button">outside</button>
      </>,
    )
    await userEvent.click(screen.getByRole("button", { name: /Edit A/ }))
    await userEvent.type(screen.getByRole("textbox"), "2")
    await userEvent.click(screen.getByRole("button", { name: "outside" }))
    expect(onSave).toHaveBeenCalledWith("12")
    rerender(
      <>
        <InlineEdit label="A" defaultValue="1" onSave={onSave} blurBehavior="cancel" />
        <button type="button">outside</button>
      </>,
    )
    await userEvent.click(screen.getByRole("button", { name: /Edit A/ }))
    await userEvent.type(screen.getByRole("textbox"), "3")
    await userEvent.click(screen.getByRole("button", { name: "outside" }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("is controlled, multiline (Ctrl+Enter saves) and reports changes", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("Line 1")
      return <InlineEdit label="Notes" value={value} onSave={setValue} multiline onChange={changes} />
    }
    const changes = vi.fn()
    renderWithOnu(<Controlled />)
    await userEvent.click(screen.getByRole("button"))
    const textarea = screen.getByRole("textbox")
    expect(textarea.tagName).toBe("TEXTAREA")
    await userEvent.type(textarea, "{Enter}Line 2")
    expect(textarea).toHaveValue("Line 1\nLine 2")
    expect(changes).toHaveBeenCalled()
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true })
    expect(await screen.findByRole("button", { name: /Line 2/ })).toBeInTheDocument()
  })

  it("shows a placeholder when empty, can start editing and can be disabled", async () => {
    const { unmount } = renderWithOnu(<InlineEdit label="Bio" placeholder="Add a bio" disabled />)
    expect(screen.getByRole("button", { name: "Edit Bio: Empty" })).toBeDisabled()
    expect(screen.getByText("Add a bio")).toBeInTheDocument()
    unmount()
    renderWithOnu(
      <InlineEdit
        label="Bio"
        defaultValue="Hi"
        defaultEditing
        renderValue={(v) => <b>{v}</b>}
        classNames={{ input: "in" }}
      />,
    )
    expect(screen.getByRole("textbox")).toHaveClass("in")
    await userEvent.keyboard("{Escape}")
    expect(screen.getByText("Hi").tagName).toBe("B")
  })

  it("types Thaana with the thaana prop", async () => {
    renderWithOnu(<InlineEdit label="ނަން" defaultValue="އަލީ" thaana />, { locale: "dv" })
    const display = screen.getByRole("button")
    expect(display).toHaveAttribute("lang", "dv")
    await userEvent.click(display)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("dir", "rtl")
    expect(input).toHaveAttribute("lang", "dv")
  })

  it.each(directions)("renders in %s", async (dir) => {
    renderWithOnu(<InlineEdit label="ރަށް" defaultValue="ހުޅުމާލެ" defaultEditing />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ސޭވްކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

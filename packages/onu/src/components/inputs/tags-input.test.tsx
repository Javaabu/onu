import * as React from "react"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { TagsInput } from "./tags-input"

const tagTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-slot=tag]")).map((t) => t.textContent)

function typeThaana(el: HTMLElement, data: string) {
  for (const ch of data) {
    el.dispatchEvent(
      new InputEvent("beforeinput", { inputType: "insertText", data: ch, cancelable: true, bubbles: true }),
    )
  }
}

describe("TagsInput", () => {
  it("adds tags with Enter and comma, and announces them", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(<TagsInput aria-label="Tags" onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Tags" })
    await userEvent.type(input, "ferry{Enter}tourism,")
    expect(tagTexts(container)).toEqual(["ferry", "tourism"])
    expect(onValueChange).toHaveBeenLastCalledWith(["ferry", "tourism"])
    expect(input).toHaveValue("")
    expect(screen.getByText("tourism added")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("removes the last tag with Backspace and any tag with its button", async () => {
    const { container } = renderWithOnu(<TagsInput aria-label="Tags" defaultValue={["a", "b", "c"]} />)
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.keyboard("{Backspace}")
    expect(tagTexts(container)).toEqual(["a", "b"])
    expect(screen.getByText("c removed")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove a" }))
    expect(tagTexts(container)).toEqual(["b"])
    expect(input).toHaveFocus()
  })

  it("splits pasted lists and skips duplicates and blanks", async () => {
    const { container } = renderWithOnu(<TagsInput aria-label="Tags" defaultValue={["male"]} />)
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    await userEvent.paste("addu, male,\nfuvahmulah,, ")
    expect(tagTexts(container)).toEqual(["male", "addu", "fuvahmulah"])
    // Plain text without delimiters is pasted normally.
    await userEvent.paste("hulhumale")
    expect(input).toHaveValue("hulhumale")
  })

  it("splits typed text that contains delimiters (e.g. autofill)", () => {
    const { container } = renderWithOnu(<TagsInput aria-label="Tags" />)
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "one,two,thr" } })
    expect(tagTexts(container)).toEqual(["one", "two"])
    expect(screen.getByRole("combobox")).toHaveValue("thr")
  })

  it("enforces a maximum and explains it", async () => {
    const { container } = renderWithOnu(<TagsInput aria-label="Tags" max={2} />)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "a{Enter}b{Enter}c{Enter}")
    expect(tagTexts(container)).toEqual(["a", "b"])
    expect(screen.getByText("You can add up to 2 tags")).toBeInTheDocument()
    expect(input.getAttribute("aria-describedby")).toContain("-max")
  })

  it("allows duplicates and custom transforms and delimiters", async () => {
    const { container } = renderWithOnu(
      <TagsInput
        aria-label="Codes"
        allowDuplicates
        delimiters={["Enter", ";"]}
        transform={(t) => (t.trim().length > 1 ? t.trim().toUpperCase() : null)}
      />,
    )
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "mv{Enter}mv{Enter}x{Enter}")
    expect(tagTexts(container)).toEqual(["MV", "MV"])
    await userEvent.clear(input)
    await userEvent.paste("lk;in")
    expect(tagTexts(container)).toEqual(["MV", "MV", "LK", "IN"])
  })

  it("ignores Enter on an empty field so forms can still submit", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderWithOnu(
      <form onSubmit={onSubmit}>
        <TagsInput aria-label="Tags" />
        <button type="submit">Save</button>
      </form>,
    )
    const input = screen.getByRole("combobox")
    fireEvent.keyDown(input, { key: "," })
    await userEvent.type(input, "{Enter}")
    expect(onSubmit).toHaveBeenCalled()
  })

  it("suggests tags, excluding ones already added", async () => {
    const { container } = renderWithOnu(
      <TagsInput aria-label="Tags" defaultValue={["Malé"]} suggestions={["Malé", "Maafushi", "Hulhumalé"]} />,
    )
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "ma")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Maafushi", "Hulhumalé"])
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(tagTexts(container)).toEqual(["Malé", "Maafushi"])
    await userEvent.type(input, "hul")
    await userEvent.click(screen.getByRole("option", { name: "Hulhumalé" }))
    expect(tagTexts(container)).toEqual(["Malé", "Maafushi", "Hulhumalé"])
    await userEvent.type(input, "x")
    await userEvent.keyboard("{Escape}")
    expect(input).toHaveAttribute("aria-expanded", "false")
  })

  it("loads async suggestions", async () => {
    const fetcher = vi.fn(async (q: string) => [`${q}-1`, `${q}-2`])
    renderWithOnu(<TagsInput aria-label="Tags" suggestions={fetcher} debounce={0} />)
    await userEvent.type(screen.getByRole("combobox"), "x")
    expect(await screen.findByRole("option", { name: "x-1" })).toBeInTheDocument()
  })

  it("is controlled, submits name[] and is wired by a FormField", async () => {
    function Controlled() {
      const [tags, setTags] = React.useState(["one"])
      return (
        <form>
          <FormField label="Keywords" name="keywords" error="Too many" required>
            <TagsInput value={tags} onValueChange={setTags} classNames={{ tag: "tag-x" }} placeholder="Add" />
          </FormField>
        </form>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    const input = screen.getByLabelText(/Keywords/)
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).not.toHaveAttribute("placeholder")
    await userEvent.type(input, "two{Enter}")
    const data = new FormData(container.querySelector("form")!)
    expect(data.getAll("keywords[]")).toEqual(["one", "two"])
    expect(container.querySelector(".tag-x")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=tags-input]")).toHaveAttribute("data-invalid", "true")
  })

  it("focuses the input when the empty area is pressed, and hides remove buttons when disabled", () => {
    const { container, rerender } = renderWithOnu(<TagsInput aria-label="Tags" defaultValue={["a"]} />)
    fireEvent.pointerDown(container.querySelector("[data-slot=tags-input]")!)
    expect(screen.getByRole("combobox")).toHaveFocus()
    rerender(<TagsInput aria-label="Tags" defaultValue={["a"]} disabled />)
    expect(screen.queryByRole("button", { name: "Remove a" })).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("types Thaana tags; the Thaana comma also adds a tag", async () => {
    const { container } = renderWithOnu(<TagsInput aria-label="ޓެގް" thaana thaanaToggle />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("dir", "rtl")
    input.focus()
    typeThaana(input, "mAle")
    await waitFor(() => expect(input).toHaveValue("މާލެ"))
    fireEvent.keyDown(input, { key: "," })
    expect(tagTexts(container)).toEqual(["މާލެ"])
    fireEvent.change(input, { target: { value: "ހުޅުމާލެ،އައްޑޫ،" } })
    expect(tagTexts(container)).toEqual(["މާލެ", "ހުޅުމާލެ", "އައްޑޫ"])
    expect(screen.getByRole("button", { name: /Thaana and Latin/ })).toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<TagsInput aria-label="ޓެގް" defaultValue={["މާލެ"]} />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "މާލެ ނައްތާލާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

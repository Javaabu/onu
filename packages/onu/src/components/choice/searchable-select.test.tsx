import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { MultiSelect } from "./multi-select"
import { QuickCreateSelect } from "./quick-create-select"
import { SearchableSelect } from "./searchable-select"
import type { ChoiceOption } from "./options"

const islands: ChoiceOption[] = [
  { value: "male", label: "Malé", group: "Kaafu" },
  { value: "hulhumale", label: "Hulhumalé", group: "Kaafu" },
  { value: "addu", label: "Addu City", description: "Seenu", group: "Seenu" },
  { value: "fuvahmulah", label: "Fuvahmulah", disabled: true, group: "Gnaviyani" },
]

const dvIslands: ChoiceOption[] = [
  { value: "male", label: "މާލެ" },
  { value: "addu", label: "އައްޑޫ" },
  { value: "kulhudhuffushi", label: "ކުޅުދުއްފުށި" },
]

describe("SearchableSelect", () => {
  it("opens a searchable list and selects an option", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<SearchableSelect aria-label="Island" options={islands} onValueChange={onValueChange} />)
    const trigger = screen.getByRole("combobox", { name: "Island" })
    expect(trigger).toHaveTextContent("Select an option")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toHaveAttribute(
      "data-slot",
      "choice-popover",
    )
    expect(screen.getByRole("option", { name: "Malé" })).toBeInTheDocument()
    expect(screen.getByText("Kaafu")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("option", { name: /Addu City/ }))
    expect(onValueChange).toHaveBeenCalledWith("addu", expect.objectContaining({ value: "addu" }))
    expect(trigger).toHaveTextContent("Addu City")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
  })

  it("filters with Intl.Collator (accents, case)", async () => {
    renderWithOnu(<SearchableSelect aria-label="Island" options={islands} />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "MALE")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Malé", "Hulhumalé"])
    expect(await screen.findByText("2 results")).toBeInTheDocument()
    await userEvent.clear(screen.getByRole("combobox", { name: "Search…" }))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "zzz")
    expect(screen.getAllByText("No results for “zzz”").length).toBeGreaterThan(0)
  })

  it("matches Thaana and types Thaana in the search field", async () => {
    renderWithOnu(<SearchableSelect aria-label="ރަށް" options={dvIslands} thaana />, { locale: "dv" })
    await userEvent.click(screen.getByRole("combobox", { name: "ރަށް" }))
    const search = screen.getByRole("combobox", { name: "ހޯއްދަވާ…" })
    expect(search).toHaveAttribute("lang", "dv")
    for (const ch of "DU")
      search.dispatchEvent(
        new InputEvent("beforeinput", { inputType: "insertText", data: ch, cancelable: true, bubbles: true }),
      )
    await waitFor(() => expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["އައްޑޫ"]))
  })

  it("supports keyboard: arrows open, Enter selects, Escape closes and returns focus", async () => {
    const user = userEvent.setup()
    renderWithOnu(<SearchableSelect aria-label="Island" options={islands} />)
    const trigger = screen.getByRole("combobox", { name: "Island" })
    trigger.focus()
    await user.keyboard("{ArrowDown}")
    expect(await screen.findByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{ArrowDown}{Enter}")
    expect(trigger).toHaveTextContent("Hulhumalé")
    await waitFor(() => expect(trigger).toHaveFocus())
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("starts a search when typing on the closed field", async () => {
    const user = userEvent.setup()
    renderWithOnu(<SearchableSelect aria-label="Island" options={islands} />)
    screen.getByRole("combobox", { name: "Island" }).focus()
    await user.keyboard("a")
    expect(await screen.findByRole("combobox", { name: "Search…" })).toHaveValue("a")
  })

  it("is controlled and clearable on optional fields", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | null>("male")
      return (
        <>
          <SearchableSelect aria-label="Island" options={islands} value={value} onValueChange={setValue} clearable />
          <output>{String(value)}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("combobox")).toHaveTextContent("Malé")
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.getByText("null")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument()
  })

  it("hides the clear button on required fields and wires FormField", () => {
    renderWithOnu(
      <FormField label="Island" name="island" required error="Pick one">
        <SearchableSelect options={islands} defaultValue="male" clearable />
      </FormField>,
    )
    const trigger = screen.getByRole("combobox", { name: /Island/ })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAttribute("aria-required", "true")
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument()
    expect(document.querySelector("input[type=hidden][name=island]")).toHaveValue("male")
  })

  it("does not open when disabled and keeps disabled options unselectable", async () => {
    const onValueChange = vi.fn()
    const { rerender } = renderWithOnu(<SearchableSelect aria-label="Island" options={islands} disabled />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    rerender(<SearchableSelect aria-label="Island" options={islands} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.getByRole("option", { name: "Fuvahmulah" })).toHaveAttribute("aria-disabled", "true")
  })

  it("applies className, classNames, renderOption, renderValue and a custom filter", async () => {
    const { container } = renderWithOnu(
      <SearchableSelect
        aria-label="Island"
        options={["One", "Two"]}
        defaultValue="Two"
        className="root-x"
        classNames={{ trigger: "trigger-x", item: "item-x" }}
        renderOption={(o) => <b>{o.label}!</b>}
        renderValue={(s) => <i>{s[0]?.label}?</i>}
        filter={(o, q) => o.value.startsWith(q)}
      />,
    )
    expect(container.querySelector("[data-slot=choice-field]")).toHaveClass("root-x")
    expect(screen.getByRole("combobox")).toHaveClass("trigger-x")
    expect(screen.getByText("Two?")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.getByText("One!").closest("[cmdk-item]")).toHaveClass("item-x")
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "T")
    expect(screen.getAllByRole("option")).toHaveLength(1)
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(<SearchableSelect aria-label="ރަށް" options={dvIslands} defaultValue="male" />, { locale: "dv", dir })
    expect(screen.getByRole("combobox")).toHaveTextContent("މާލެ")
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("combobox"))
    await expectNoA11yViolations()
  })
})

describe("MultiSelect", () => {
  it("selects several values as chips and removes them", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<MultiSelect aria-label="Islands" options={islands} onValueChange={onValueChange} name="islands" />)
    await userEvent.click(screen.getByRole("combobox", { name: "Islands" }))
    await userEvent.click(screen.getByRole("option", { name: "Malé" }))
    await userEvent.click(screen.getByRole("option", { name: /Addu/ }))
    expect(onValueChange).toHaveBeenLastCalledWith(["male", "addu"], expect.any(Array))
    expect(screen.getByRole("option", { name: "Malé" })).toHaveAttribute("aria-checked", "true")
    expect(document.querySelectorAll("input[name='islands[]']")).toHaveLength(2)
    await userEvent.keyboard("{Escape}")
    await userEvent.click(screen.getByRole("button", { name: "Remove Malé" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["addu"], expect.any(Array))
  })

  it("selects and deselects all visible options", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<MultiSelect aria-label="Islands" options={islands} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.click(screen.getByRole("option", { name: "Select all" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["male", "hulhumale", "addu"], expect.any(Array))
    await userEvent.click(screen.getByRole("option", { name: "Deselect all" }))
    expect(onValueChange).toHaveBeenLastCalledWith([], [])
  })

  it("respects max and shows +N more", async () => {
    renderWithOnu(
      <MultiSelect
        aria-label="Islands"
        options={islands}
        max={2}
        maxVisibleChips={1}
        defaultValue={["male", "addu"]}
      />,
    )
    expect(screen.getByText("+1 more")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.getByText("You can select up to 2")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Hulhumalé" })).toHaveAttribute("aria-disabled", "true")
    expect(screen.queryByRole("option", { name: "Select all" })).not.toBeInTheDocument()
  })

  it("removes the last chip with Backspace in the empty search and clears all", async () => {
    const user = userEvent.setup()
    renderWithOnu(<MultiSelect aria-label="Islands" options={islands} defaultValue={["male", "addu"]} />)
    await user.click(screen.getByRole("combobox", { name: "Islands" }))
    await user.keyboard("{Backspace}")
    expect(screen.queryByRole("button", { name: "Remove Addu City" })).not.toBeInTheDocument()
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument()
  })

  it("passes axe with chips", async () => {
    renderWithOnu(<MultiSelect aria-label="Islands" options={islands} defaultValue={["male"]} />)
    await expectNoA11yViolations()
  })
})

describe("QuickCreateSelect", () => {
  it("creates an option inline and selects it", async () => {
    const onCreate = vi.fn(async (label: string) => ({ value: "new-1", label }))
    const onValueChange = vi.fn()
    renderWithOnu(
      <QuickCreateSelect aria-label="Island" options={islands} onCreate={onCreate} onValueChange={onValueChange} />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "Thinadhoo")
    await userEvent.click(screen.getByRole("option", { name: "Create “Thinadhoo”" }))
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("new-1", { value: "new-1", label: "Thinadhoo" }))
    expect(screen.getByRole("combobox")).toHaveTextContent("Thinadhoo")
    await waitFor(() => expect(screen.getByText("“Thinadhoo” created and selected")).toBeInTheDocument())
  })

  it("hides Create when the query matches an option exactly", async () => {
    renderWithOnu(<QuickCreateSelect aria-label="Island" options={islands} onCreate={() => null} />)
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "male")
    expect(screen.queryByRole("option", { name: /Create/ })).not.toBeInTheDocument()
  })

  it("reports a failed create", async () => {
    renderWithOnu(
      <QuickCreateSelect aria-label="Island" options={islands} onCreate={() => Promise.reject(new Error("nope"))} />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "Vilimalé")
    await userEvent.click(screen.getByRole("option", { name: /Create/ }))
    expect(await screen.findByRole("option", { name: "Couldn’t create “Vilimalé”" })).toBeInTheDocument()
  })

  it("creates through a dialog callback", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <QuickCreateSelect
        aria-label="Island"
        options={islands}
        multiple
        onValueChange={onValueChange}
        renderCreateDialog={({ query, onCreated, onOpenChange }) => (
          <div role="dialog" aria-label="New island">
            <button type="button" onClick={() => onCreated({ value: "x", label: query })}>
              Save {query}
            </button>
            <button type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
          </div>
        )}
      />,
    )
    await userEvent.click(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "Kudahuvadhoo")
    await userEvent.click(screen.getByRole("option", { name: /Create/ }))
    await userEvent.click(await screen.findByRole("button", { name: "Save Kudahuvadhoo" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["x"], [{ value: "x", label: "Kudahuvadhoo" }])
    expect(screen.queryByRole("dialog", { name: "New island" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove Kudahuvadhoo" })).toBeInTheDocument()
  })
})

// keep imports used
void act
void fireEvent

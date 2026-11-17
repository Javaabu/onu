import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import { DualListbox } from "../choice/dual-listbox"
import { Rating } from "../choice/rating"
import { SearchableSelect } from "../choice/searchable-select"
import { SegmentedControl } from "../choice/segmented-control"
import { DatePicker } from "../date/date-picker"
import { ColorPicker } from "../inputs/color-picker"
import { IconPicker } from "../inputs/icon-picker"
import { NumberInput } from "../inputs/number-input"
import { TagsInput } from "../inputs/tags-input"
import { Form, formDataToObject } from "./form"
import { FormField } from "./form-field"
import { SubmitButton } from "./submit-button"
import { ValidationSummary } from "./validation-summary"
import { ValidationError } from "./validation"

const options = [
  { value: "x", label: "X" },
  { value: "y", label: "Y" },
]

const controls: [string, React.ReactElement][] = [
  ["NumberInput", <NumberInput defaultValue={5} />],
  ["TagsInput", <TagsInput defaultValue={["one"]} />],
  ["SearchableSelect", <SearchableSelect options={options} defaultValue="x" />],
  ["DatePicker", <DatePicker defaultValue={new Date(2026, 0, 5)} />],
  ["ColorPicker", <ColorPicker defaultValue="#1f7a4d" />],
  ["IconPicker", <IconPicker defaultValue="home" />],
  ["SegmentedControl", <SegmentedControl options={options} defaultValue="x" />],
  ["DualListbox", <DualListbox options={options} defaultValue={["x"]} />],
  ["Rating", <Rating defaultValue={3} />],
]

describe("composite controls' submitted value", () => {
  it.each(controls)("%s submits nothing inside a disabled FormField", (_, control) => {
    const { container } = renderWithOnu(
      <form>
        <FormField label="Field" name="field" disabled>
          {control}
        </FormField>
      </form>,
    )
    const values = formDataToObject(new FormData(container.querySelector("form")!))
    expect(Object.keys(values)).toEqual([])
  })

  it.each(controls)("%s submits its value inside an enabled FormField", (_, control) => {
    const { container } = renderWithOnu(
      <form>
        <FormField label="Field" name="field">
          {control}
        </FormField>
      </form>,
    )
    const data = new FormData(container.querySelector("form")!)
    expect([...data.keys()].some((key) => key === "field" || key === "field[]")).toBe(true)
  })

  it("clears a NumberInput's server error when it is edited", async () => {
    renderWithOnu(
      <Form
        onSubmit={() => {
          throw new ValidationError({ amount: "Too small" })
        }}
      >
        <FormField label="Amount" name="amount">
          <NumberInput defaultValue={1} />
        </FormField>
        <SubmitButton>Save</SubmitButton>
      </Form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByRole("spinbutton", { name: "Amount" })).toHaveFocus())
    await userEvent.type(screen.getByRole("spinbutton", { name: "Amount" }), "2")
    expect(screen.queryAllByText("Too small")).toHaveLength(0)
  })

  it("lets the summary focus a NumberInput, a DatePicker and an empty TagsInput from the field name", async () => {
    renderWithOnu(
      <form>
        <ValidationSummary errors={{ amount: "Required", date: "Required", tags: "Required" }} />
        <FormField label="Amount" name="amount">
          <NumberInput />
        </FormField>
        <FormField label="Date" name="date">
          <DatePicker />
        </FormField>
        <FormField label="Tags" name="tags">
          <TagsInput />
        </FormField>
      </form>,
    )
    const links = screen.getAllByRole("link", { name: "Required" })
    await userEvent.click(links[0]!)
    await waitFor(() => expect(screen.getByRole("spinbutton", { name: "Amount" })).toHaveFocus())
    await userEvent.click(links[1]!)
    await waitFor(() =>
      expect(document.activeElement).toBe(document.getElementById(screen.getByText("Date").closest("label")!.htmlFor)),
    )
    await userEvent.click(links[2]!)
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Tags" })).toHaveFocus())
  })
})

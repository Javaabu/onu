import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useFieldArray, useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { FormField } from "./form-field"
import { RepeatingGroup, type RepeatingGroupProps } from "./repeating-group"

interface Row {
  name: string
}

function Plain(props: Partial<RepeatingGroupProps<Row>> & { initial?: Row[] }) {
  const { initial = [{ name: "Aminath" }, { name: "Hussain" }], ...rest } = props
  const [rows, setRows] = React.useState<Row[]>(initial)
  return (
    <RepeatingGroup<Row>
      label="Family members"
      value={rows}
      onChange={setRows}
      createItem={() => ({ name: "" })}
      {...rest}
    >
      {({ item, index, name }) => (
        <FormField label={`Name ${index + 1}`} name={name("name")}>
          <TextInput
            value={item.name}
            onChange={(e) => setRows((r) => r.map((x, i) => (i === index ? { name: e.target.value } : x)))}
          />
        </FormField>
      )}
    </RepeatingGroup>
  )
}

const names = () => screen.getAllByRole("textbox").map((el) => (el as HTMLInputElement).value)

describe("RepeatingGroup (plain array)", () => {
  it("renders rows with generated names and an accessible group", async () => {
    renderWithOnu(<Plain />)
    expect(screen.getByRole("group", { name: "Family members" })).toBeInTheDocument()
    expect(screen.getByLabelText("Name 1")).toHaveAttribute("name", "items[0][name]")
    expect(screen.getByLabelText("Name 2")).toHaveAttribute("name", "items[1][name]")
    expect(screen.getAllByRole("listitem").map((li) => li.getAttribute("aria-label"))).toEqual(["Item 1", "Item 2"])
    await expectNoA11yViolations()
  })

  it("adds a row, focuses it and announces it", async () => {
    renderWithOnu(<Plain />)
    await userEvent.click(screen.getByRole("button", { name: "Add item" }))
    expect(names()).toEqual(["Aminath", "Hussain", ""])
    await waitFor(() => expect(screen.getByLabelText("Name 3")).toHaveFocus())
    expect(screen.getByRole("status")).toHaveTextContent("Item 3 added")
  })

  it("removes a row, moves focus to the next one and announces it", async () => {
    renderWithOnu(<Plain initial={[{ name: "A" }, { name: "B" }, { name: "C" }]} />)
    await userEvent.click(screen.getByRole("button", { name: "Remove item 2" }))
    expect(names()).toEqual(["A", "C"])
    await waitFor(() => expect(screen.getByLabelText("Name 2")).toHaveFocus())
    expect(screen.getByRole("status")).toHaveTextContent("Item 2 removed")
  })

  it("focuses Add after removing the last row and shows the empty state", async () => {
    renderWithOnu(<Plain initial={[{ name: "A" }]} emptyText="No members" />)
    await userEvent.click(screen.getByRole("button", { name: "Remove item 1" }))
    expect(screen.getByText("No members")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("button", { name: "Add item" })).toHaveFocus())
  })

  it("reorders with Move up / Move down, keeping focus on the moved row", async () => {
    renderWithOnu(<Plain initial={[{ name: "A" }, { name: "B" }, { name: "C" }]} />)
    expect(screen.getByRole("button", { name: "Move item 1 up" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Move item 3 down" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move item 3 up" }))
    expect(names()).toEqual(["A", "C", "B"])
    await waitFor(() => expect(screen.getByRole("button", { name: "Move item 2 up" })).toHaveFocus())
    expect(screen.getByRole("status")).toHaveTextContent("Item moved to position 2")
    await userEvent.keyboard("{Enter}")
    expect(names()).toEqual(["C", "A", "B"])
    // At the top, "up" is disabled, so focus lands on "down" for the same row.
    await waitFor(() => expect(screen.getByRole("button", { name: "Move item 1 down" })).toHaveFocus())
    await userEvent.keyboard("{Enter}")
    expect(names()).toEqual(["A", "C", "B"])
  })

  it("enforces min and max and shows the limits", async () => {
    renderWithOnu(<Plain initial={[{ name: "A" }, { name: "B" }]} min={2} max={3} />)
    expect(screen.getByText("At least 2 items · Up to 3 items")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove item 1" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Add item" }))
    expect(screen.getByRole("button", { name: "Add item" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove item 1" })).toBeEnabled()
  })

  it("supports dot names, custom labels, disabled and class overrides", () => {
    const { container } = renderWithOnu(
      <Plain
        name="members"
        nameFormat="dot"
        itemLabel={(i) => (i === 0 ? null : <b>Member {i + 1}</b>)}
        addLabel="Add member"
        disabled
        reorderable={false}
        classNames={{ row: "row-x", add: "add-x" }}
      />,
    )
    expect(screen.getByLabelText("Name 1")).toHaveAttribute("name", "members.0.name")
    expect(screen.getByText("Member 2")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add member" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: /Move/ })).not.toBeInTheDocument()
    expect(container.querySelectorAll(".row-x")).toHaveLength(2)
    expect(container.querySelector(".add-x")).toBeInTheDocument()
  })

  it.each(directions)("renders in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<Plain />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "އައިޓަމެއް އިތުރުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "އައިޓަމް 1 ނައްތާލާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("RepeatingGroup with react-hook-form useFieldArray", () => {
  function Rhf({ onValues }: { onValues: (v: unknown) => void }) {
    const form = useForm<{ items: { name: string; qty: number }[] }>({
      defaultValues: { items: [{ name: "Tuna", qty: 2 }] },
    })
    const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "items" })
    return (
      <form onSubmit={form.handleSubmit(onValues)}>
        <RepeatingGroup
          items={fields}
          onAdd={() => append({ name: "", qty: 1 })}
          onRemove={remove}
          onMove={move}
          name="items"
          nameFormat="dot"
          max={3}
        >
          {({ index, name }) => (
            <FormField label={`Item ${index + 1} name`}>
              <TextInput {...form.register(name("name") as `items.${number}.name`)} />
            </FormField>
          )}
        </RepeatingGroup>
        <button type="submit">Submit</button>
      </form>
    )
  }

  it("adds, edits, moves and removes rows through useFieldArray", async () => {
    const onValues = vi.fn()
    renderWithOnu(<Rhf onValues={onValues} />)
    await userEvent.click(screen.getByRole("button", { name: "Add item" }))
    await waitFor(() => expect(screen.getByLabelText("Item 2 name")).toHaveFocus())
    await userEvent.type(screen.getByLabelText("Item 2 name"), "Rihaakuru")
    await userEvent.click(screen.getByRole("button", { name: "Move item 2 up" }))
    await userEvent.click(screen.getByRole("button", { name: "Add item" }))
    await userEvent.click(screen.getByRole("button", { name: "Remove item 3" }))
    await userEvent.click(screen.getByRole("button", { name: "Submit" }))
    await waitFor(() => expect(onValues).toHaveBeenCalled())
    expect(onValues.mock.calls[0]![0]).toEqual({
      items: [
        { name: "Rihaakuru", qty: 1 },
        { name: "Tuna", qty: 2 },
      ],
    })
  })
})

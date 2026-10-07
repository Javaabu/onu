import * as React from "react"
import { act, fireEvent, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormErrorsProvider } from "../components/form/form-context"
import { CustomAttributeFields, type AttributeField, type AttributeValues } from "./custom-attribute-fields"

vi.setConfig({ testTimeout: 30_000 })

const schema: AttributeField[] = [
  { name: "title", label: "Title", type: "text", required: true, help: "Shown on the listing" },
  { name: "title_dv", label: "ސުރުޚީ", type: "text", thaana: true },
  { name: "summary", label: "Summary", type: "textarea", maxLength: 200 },
  { name: "bedrooms", label: "Bedrooms", type: "number", min: 0, max: 10 },
  { name: "email", label: "Contact email", type: "email" },
  { name: "website", label: "Website", type: "url" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "atoll", label: "Atoll", type: "select", options: ["Kaafu", "Addu", { value: "laamu", label: "Laamu" }] },
  { name: "tenure", label: "Tenure", type: "radio", options: ["Freehold", "Leasehold"] },
  { name: "amenities", label: "Amenities", type: "multiselect", options: ["Pool", "Jetty", "Gym"] },
  { name: "furnished", label: "Furnished", type: "boolean" },
  { name: "available_from", label: "Available from", type: "date" },
  { name: "opens_at", label: "Opens at", type: "time" },
  { name: "inspection", label: "Inspection", type: "datetime" },
  { name: "colour", label: "Colour", type: "color", defaultValue: "#1f7a4d" },
]

describe("CustomAttributeFields", () => {
  it("renders a labelled control for every field type", async () => {
    const { container } = renderWithOnu(<CustomAttributeFields schema={schema} className="root-x" />)
    expect(container.querySelector("[data-slot=custom-attribute-fields]")).toHaveClass("root-x")
    expect(screen.getByRole("textbox", { name: /Title/ })).toBeRequired()
    expect(screen.getByRole("textbox", { name: /Title/ })).toHaveAccessibleDescription("Shown on the listing")
    expect(screen.getByRole("textbox", { name: "ސުރުޚީ" })).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("textbox", { name: "Summary" }).tagName).toBe("TEXTAREA")
    expect(screen.getByRole("spinbutton", { name: "Bedrooms" })).toHaveAttribute("max", "10")
    expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveAttribute("dir", "ltr")
    expect(screen.getByRole("combobox", { name: "Atoll" })).toBeInTheDocument()
    expect(screen.getByRole("radiogroup", { name: "Tenure" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Amenities" })).toBeInTheDocument()
    expect(screen.getByRole("switch", { name: "Furnished" })).not.toBeChecked()
    expect(screen.getByLabelText("Available from")).toHaveAttribute("type", "date")
    expect(screen.getByLabelText("Opens at")).toHaveAttribute("type", "time")
    expect(screen.getByLabelText("Inspection")).toHaveAttribute("type", "datetime-local")
    expect(screen.getByLabelText("Colour")).toHaveValue("#1f7a4d")
    await expectNoA11yViolations()
  })

  it("emits a values object and uses Laravel-style names", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <form>
        <CustomAttributeFields schema={schema} name="attributes" onChange={onChange} />
      </form>,
    )
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Villa")
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Villa" }))
    expect(screen.getByRole("textbox", { name: /Title/ })).toHaveAttribute("name", "attributes[title]")

    await user.type(screen.getByRole("spinbutton", { name: "Bedrooms" }), "3")
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ bedrooms: 3 }))
    await user.clear(screen.getByRole("spinbutton", { name: "Bedrooms" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ bedrooms: null }))

    await user.type(screen.getByRole("textbox", { name: "Summary" }), "Sea view")
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ summary: "Sea view" }))

    await user.click(screen.getByRole("radio", { name: "Leasehold" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ tenure: "Leasehold" }))

    await user.click(screen.getByRole("checkbox", { name: "Pool" }))
    await user.click(screen.getByRole("checkbox", { name: "Gym" }))
    await user.click(screen.getByRole("checkbox", { name: "Pool" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ amenities: ["Gym"] }))

    await user.click(screen.getByRole("switch", { name: "Furnished" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ furnished: true }))
    expect(screen.getByText("Yes")).toBeInTheDocument()

    const data = new FormData(container.querySelector("form")!)
    expect(data.get("attributes[title]")).toBe("Villa")
    expect(data.get("attributes[tenure]")).toBe("Leasehold")
    expect(data.getAll("attributes[amenities][]")).toEqual(["Gym"])
    expect(data.get("attributes[furnished]")).toBe("1")
    expect(data.get("attributes[colour]")).toBe("#1f7a4d")
  })

  it("picks from a select", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithOnu(<CustomAttributeFields schema={schema.filter((f) => f.type === "select")} onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Atoll" }))
    await user.click(await screen.findByRole("option", { name: "Laamu" }))
    expect(onChange).toHaveBeenLastCalledWith({ atoll: "laamu" })
    expect(document.querySelector<HTMLInputElement>("input[type=hidden][name=atoll]")).toHaveValue("laamu")
  })

  it("is controlled with value", () => {
    function Controlled() {
      const [values, setValues] = React.useState<AttributeValues>({ title: "A", furnished: true })
      return (
        <CustomAttributeFields schema={schema.slice(0, 1).concat(schema[10]!)} value={values} onChange={setValues} />
      )
    }
    renderWithOnu(<Controlled />)
    const title = screen.getByRole("textbox", { name: /Title/ })
    fireEvent.change(title, { target: { value: "B" } })
    expect(title).toHaveValue("B")
    expect(screen.getByRole("switch")).toBeChecked()
    expect(document.querySelector<HTMLInputElement>("input[name=furnished]")).toHaveValue("1")
  })

  it("maps Laravel errors to fields, from a prop or a provider", () => {
    const { unmount } = renderWithOnu(
      <CustomAttributeFields
        schema={schema.slice(0, 1)}
        name="attributes"
        errors={{ "attributes.title": ["The title field is required."] }}
      />,
    )
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("The title field is required.")).toBeInTheDocument()
    unmount()
    renderWithOnu(
      <FormErrorsProvider errors={{ "attributes.atoll": "Pick an atoll" }}>
        <CustomAttributeFields schema={schema.filter((f) => f.type === "select")} name="attributes" />
      </FormErrorsProvider>,
    )
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
  })

  it("disables every field, or single ones", () => {
    const { rerender } = renderWithOnu(<CustomAttributeFields schema={schema} disabled />)
    expect(screen.getByRole("textbox", { name: /Title/ })).toBeDisabled()
    expect(screen.getByRole("switch")).toBeDisabled()
    expect(screen.getByRole("combobox")).toBeDisabled()
    expect(screen.getByRole("checkbox", { name: "Pool" })).toBeDisabled()
    rerender(
      <CustomAttributeFields
        schema={[
          {
            name: "x",
            label: "X",
            type: "select",
            disabled: true,
            options: [{ value: "a", label: "A", disabled: true }],
          },
        ]}
      />,
    )
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("lays out in two columns with full-width wide fields and slot classes", () => {
    const { container } = renderWithOnu(
      <CustomAttributeFields
        schema={schema.slice(0, 3)}
        columns={2}
        labelLayout="inline"
        classNames={{ field: "field-x", control: "control-x" }}
      />,
    )
    const root = container.querySelector("[data-slot=custom-attribute-fields]")!
    expect(root.firstElementChild).toHaveClass("@xl/attributes:grid-cols-2")
    expect(container.querySelector("[data-attribute=summary]")).toHaveClass("col-span-full", "field-x")
    expect(container.querySelector("[data-attribute=title]")).not.toHaveClass("col-span-full")
    expect(container.querySelector("[data-attribute=title]")).toHaveAttribute("data-label-layout", "inline")
    expect(screen.getByRole("textbox", { name: "Summary" })).toHaveClass("control-x")
  })

  it("types Thaana in Thaana text fields", () => {
    renderWithOnu(<CustomAttributeFields schema={[schema[1]!]} />)
    const input = screen.getByRole("textbox")
    act(() => {
      input.dispatchEvent(
        new InputEvent("beforeinput", { inputType: "insertText", data: "r", cancelable: true, bubbles: true }),
      )
    })
    expect(input).toHaveValue("ރ")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<CustomAttributeFields schema={schema.filter((f) => ["select", "boolean"].includes(f.type))} />, {
      dir,
      locale: "dv",
    })
    expect(within(screen.getByRole("combobox")).getByText("ޚިޔާރުކުރޭ")).toBeInTheDocument()
    expect(screen.getByText("ނޫން")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

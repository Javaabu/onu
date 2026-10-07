import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { FieldErrors } from "./field-errors"
import { FormErrorsProvider, FormLayoutProvider, toDotNotation, useFieldErrors } from "./form-context"
import { FormField, useFormFieldControl } from "./form-field"

describe("FormField", () => {
  it("labels the control and wires help text", async () => {
    renderWithOnu(
      <FormField label="Email" help="We never share it." required>
        <TextInput type="email" />
      </FormField>,
    )
    const input = screen.getByLabelText(/Email/)
    expect(input).toHaveAccessibleDescription("We never share it.")
    expect(input).toBeRequired()
    expect(input).toHaveAttribute("aria-required", "true")
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true")
    await expectNoA11yViolations()
  })

  it("shows errors and marks the control invalid", async () => {
    renderWithOnu(
      <FormField label="Name" error={["Name is required.", "Too short."]} help="Full name">
        <TextInput />
      </FormField>,
    )
    const input = screen.getByLabelText("Name")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAccessibleDescription("Full name Name is required. Too short.")
    expect(screen.getByText("Name is required.")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("reads Laravel 422 errors by name, including array fields", () => {
    renderWithOnu(
      <FormErrorsProvider errors={{ email: ["The email has already been taken."], "items.0.name": "Required" }}>
        <FormField label="Email" name="email">
          <TextInput />
        </FormField>
        <FormField label="Item" name="items[0][name]">
          <TextInput />
        </FormField>
      </FormErrorsProvider>,
    )
    expect(screen.getByText("The email has already been taken.")).toBeInTheDocument()
    expect(screen.getByText("Required")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email")
  })

  it("supports stacked and inline label layouts from props, forms and the provider", () => {
    const { container } = renderWithOnu(
      <>
        <FormField label="A">
          <TextInput />
        </FormField>
        <FormLayoutProvider labelLayout="inline">
          <FormField label="B">
            <TextInput />
          </FormField>
          <FormField label="C" labelLayout="stacked">
            <TextInput />
          </FormField>
        </FormLayoutProvider>
      </>,
      { provider: { labelLayout: "stacked" } },
    )
    const layouts = Array.from(container.querySelectorAll("[data-slot=form-field]")).map((el) =>
      el.getAttribute("data-label-layout"),
    )
    expect(layouts).toEqual(["stacked", "inline", "stacked"])
  })

  it("uses the global default label layout", () => {
    const { container } = renderWithOnu(
      <FormField label="A">
        <TextInput />
      </FormField>,
      { provider: { labelLayout: "inline" } },
    )
    expect(container.querySelector("[data-slot=form-field]")).toHaveAttribute("data-label-layout", "inline")
  })

  it("disables controls from the field or the form", () => {
    renderWithOnu(
      <FormLayoutProvider disabled>
        <FormField label="A">
          <TextInput />
        </FormField>
        <FormField label="B" disabled={false}>
          <TextInput />
        </FormField>
      </FormLayoutProvider>,
    )
    expect(screen.getByLabelText("A")).toBeDisabled()
    expect(screen.getByLabelText("B")).toBeEnabled()
  })

  it("can hide the label visually, render label asides and custom classes", () => {
    const { container } = renderWithOnu(
      <>
        <FormField label="Search" hideLabel classNames={{ label: "custom-label" }}>
          <TextInput />
        </FormField>
        <FormField label="Password" labelAside={<a href="#forgot">Forgot?</a>}>
          <TextInput type="password" />
        </FormField>
        <FormField label="Inline" labelLayout="inline" labelAside={<span>aside</span>}>
          <TextInput />
        </FormField>
      </>,
    )
    expect(screen.getByLabelText("Search")).toBeInTheDocument()
    expect(container.querySelector(".custom-label")).toBeInTheDocument()
    expect(screen.getByText("Forgot?")).toBeInTheDocument()
    expect(screen.getByText("aside")).toBeInTheDocument()
  })

  it.each(directions)("renders in %s", async (dir) => {
    renderWithOnu(
      <FormField label="ނަން" help="ފުރިހަމަ ނަން">
        <TextInput />
      </FormField>,
      { locale: "dv", dir },
    )
    expect(document.documentElement).toHaveAttribute("dir", dir)
    await expectNoA11yViolations()
  })

  it("leaves explicit control props alone and works outside a field", () => {
    function Probe(props: Record<string, unknown>) {
      const p = useFormFieldControl(props)
      return <input aria-label="probe" {...(p as React.ComponentProps<"input">)} />
    }
    renderWithOnu(
      <>
        <FormField label="X" id="x-field" error="bad">
          <Probe id="custom" aria-invalid={false} aria-describedby="extra" />
        </FormField>
        <Probe />
      </>,
    )
    const [inField, outside] = screen.getAllByLabelText(/probe|X/)
    expect(inField).toHaveAttribute("id", "custom")
    expect(inField).toHaveAttribute("aria-invalid", "false")
    expect(inField!.getAttribute("aria-describedby")).toContain("extra")
    expect(outside).not.toHaveAttribute("id")
  })
})

describe("form helpers", () => {
  it("converts bracket names to dot notation", () => {
    expect(toDotNotation("items[0][name]")).toBe("items.0.name")
    expect(toDotNotation("tags[]")).toBe("tags")
    expect(toDotNotation("email")).toBe("email")
  })

  it("returns no errors without a provider or name", () => {
    function Probe({ name }: { name?: string }) {
      return <span>{useFieldErrors(name).length}</span>
    }
    renderWithOnu(
      <>
        <Probe name="a" />
        <FormErrorsProvider errors={{ a: "x" }}>
          <Probe />
        </FormErrorsProvider>
      </>,
    )
    expect(screen.getAllByText("0")).toHaveLength(2)
  })

  it("FieldErrors can show only the first message", () => {
    renderWithOnu(<FieldErrors errors={["one", "two"]} firstOnly />)
    expect(screen.getByText("one")).toBeInTheDocument()
    expect(screen.queryByText("two")).not.toBeInTheDocument()
  })
})

import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { FormField } from "./form-field"
import { Label } from "./label"
import { RequiredMarker } from "./required-marker"

const marker = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-slot=required-marker]")!

describe("RequiredMarker", () => {
  it("shows * hidden from screen readers, with a translated tooltip", () => {
    const { container } = renderWithOnu(<RequiredMarker />)
    expect(marker(container)).toHaveTextContent("*")
    expect(marker(container)).toHaveAttribute("aria-hidden", "true")
    expect(marker(container)).toHaveAttribute("title", "Required")
    expect(marker(container)).toHaveClass("text-destructive")
  })

  it("takes another symbol, classes and span props", () => {
    const { container } = renderWithOnu(<RequiredMarker symbol="(required)" className="ms-1" data-testid="m" />)
    expect(marker(container)).toHaveTextContent("(required)")
    expect(marker(container)).toHaveClass("ms-1", "text-destructive")
    expect(screen.getByTestId("m")).toBe(marker(container))
  })

  it("translates the tooltip in Dhivehi", () => {
    const { container } = renderWithOnu(<RequiredMarker />, { locale: "dv" })
    expect(marker(container)).toHaveAttribute("title", "ލާޒިމް")
  })

  it("is left out of the label's accessible name", () => {
    renderWithOnu(
      <>
        <label htmlFor="name">
          Name <RequiredMarker />
        </label>
        <input id="name" required />
      </>,
    )
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Name")
  })

  it("is added by Label and FormField when the field is required", () => {
    const { container, unmount } = renderWithOnu(<Label required>Name</Label>)
    expect(marker(container)).toBeInTheDocument()
    unmount()
    const field = renderWithOnu(
      <FormField label="Email" required>
        <TextInput />
      </FormField>,
    )
    expect(marker(field.container)).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired()
  })

  it.each(directions)("has no axe violations (%s)", async (dir) => {
    renderWithOnu(
      <FormField label="Name" required>
        <TextInput />
      </FormField>,
      { dir },
    )
    await expectNoA11yViolations()
  })
})

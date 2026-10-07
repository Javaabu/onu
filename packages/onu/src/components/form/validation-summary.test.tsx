import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "../inputs/text-input"
import { FormField } from "./form-field"
import {
  ValidationError,
  errorEntries,
  findField,
  flattenFieldErrors,
  focusField,
  focusFirstInvalid,
  getValidationErrors,
  isValidationPayload,
  readValidationErrors,
} from "./validation"
import { AjaxValidationErrors, ValidationSummary } from "./validation-summary"

const payload = {
  message: "The email has already been taken. (and 1 more error)",
  errors: { email: ["The email has already been taken."], "items.0.name": ["The item name is required."] },
}

describe("ValidationSummary", () => {
  it("lists every error from a Laravel 422 payload with links that focus the field", async () => {
    renderWithOnu(
      <form>
        <ValidationSummary errors={payload} />
        <FormField label="Email" name="email">
          <TextInput />
        </FormField>
        <FormField label="Item name" name="items[0][name]">
          <TextInput />
        </FormField>
      </form>,
    )
    const summary = screen.getByRole("alert")
    expect(summary).toHaveAccessibleName("There are 2 problems with this form")
    const links = screen.getAllByRole("link")
    expect(links.map((l) => l.textContent)).toEqual(["The email has already been taken.", "The item name is required."])
    await userEvent.click(links[1]!)
    expect(screen.getByLabelText("Item name")).toHaveFocus()
    await userEvent.click(links[0]!)
    expect(screen.getByLabelText("Email")).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("renders nothing without errors", () => {
    const { container } = renderWithOnu(<ValidationSummary errors={{}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows a general message, custom title, labels and focuses itself when asked", async () => {
    const { rerender } = renderWithOnu(<ValidationSummary message="Server unavailable" focusOnShow />)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Server unavailable")
    await waitFor(() => expect(alert).toHaveFocus())
    rerender(
      <ValidationSummary
        title="Check these"
        errors={{ email: "Bad" }}
        labels={{ email: "Email" }}
        message="Custom hint"
        classNames={{ link: "lnk" }}
      />,
    )
    expect(screen.getByRole("alert")).toHaveAccessibleName("Check these")
    expect(screen.getByRole("link")).toHaveTextContent("Email: Bad")
    expect(screen.getByRole("link")).toHaveClass("lnk")
    expect(screen.getByText("Custom hint")).toBeInTheDocument()
  })

  it("follows the href when the field can't be found, and searches a given root", async () => {
    const root = { current: document.createElement("div") }
    renderWithOnu(<AjaxValidationErrors errors={{ missing: "Gone" }} root={root} />)
    await userEvent.click(screen.getByRole("link"))
    expect(window.location.hash).toBe("#missing")
  })

  it.each(directions)("translates to Dhivehi (%s)", async (dir) => {
    renderWithOnu(<ValidationSummary errors={{ name: "ނަން ލިޔުއްވާ" }} />, { locale: "dv", dir })
    expect(screen.getByRole("alert")).toHaveTextContent("މި ފޯމުގައި 1 މައްސަލައެއް ވޭ")
    await expectNoA11yViolations()
  })
})

describe("validation helpers", () => {
  it("detects Laravel payloads", () => {
    expect(isValidationPayload(payload)).toBe(true)
    expect(isValidationPayload({ errors: { a: "x", b: undefined } })).toBe(true)
    expect(isValidationPayload({ errors: { a: 1 } })).toBe(false)
    expect(isValidationPayload({ errors: [] })).toBe(false)
    expect(isValidationPayload(null)).toBe(false)
  })

  it("finds payloads in thrown values", () => {
    expect(getValidationErrors(payload)).toBe(payload)
    expect(getValidationErrors({ response: { status: 422, data: payload } })).toBe(payload)
    expect(getValidationErrors({ data: payload })).toBe(payload)
    expect(getValidationErrors({ body: payload })).toBe(payload)
    expect(getValidationErrors(new Error("x", { cause: payload }))).toBe(payload)
    expect(getValidationErrors(new Error("x"))).toBeNull()
    expect(getValidationErrors("nope")).toBeNull()
    const err = new ValidationError(payload)
    expect(getValidationErrors(err)).toEqual({ message: payload.message, errors: payload.errors })
    expect(new ValidationError({ a: "b" }).message).toBe("The given data was invalid.")
    expect(new ValidationError({ a: "b" }, "Custom").message).toBe("Custom")
  })

  it("reads fetch responses", async () => {
    expect(await readValidationErrors(new Response(JSON.stringify(payload), { status: 422 }))).toEqual(payload)
    expect(await readValidationErrors(new Response("{}", { status: 500 }))).toBeNull()
    expect(await readValidationErrors(new Response("not json", { status: 422 }))).toBeNull()
    expect(await readValidationErrors(payload)).toBe(payload)
  })

  it("flattens react-hook-form errors and entries", () => {
    expect(
      flattenFieldErrors({
        title: { message: "Required", ref: {} },
        items: [{ name: { message: "Name required" } }],
        tags: { types: { min: "Too few", max: 3 } },
        root: { message: "" },
      }),
    ).toEqual({ title: ["Required"], "items.0.name": ["Name required"], tags: ["Too few"] })
    expect(flattenFieldErrors(null)).toEqual({})
    expect(errorEntries({ a: [], b: "x", c: undefined })).toEqual([["b", ["x"]]])
    expect(errorEntries(null)).toEqual([])
  })

  it("finds, reveals and focuses fields", () => {
    document.body.innerHTML = `
      <input type="hidden" name="token" />
      <input name="items[0][name]" />
      <div id="custom" tabindex="-1"></div>
      <span><button type="button">box</button><input aria-hidden="true" name="agree" tabindex="-1" /></span>
      <input name="ok" /><input name="bad" aria-invalid="true" />`
    expect(findField(document, "items.0.name")).toHaveAttribute("name", "items[0][name]")
    expect(findField(document, "custom")).toHaveAttribute("id", "custom")
    expect(findField(document, "token")).toBeNull()
    expect(findField(null, "x")).toBeNull()
    expect(focusField(findField(document, "agree"))).toBe(true)
    expect(document.activeElement).toHaveTextContent("box")
    expect(focusField(null)).toBe(false)
    expect(focusFirstInvalid(document.body, {})).toBe(true)
    expect(document.activeElement).toHaveAttribute("name", "bad")
    expect(focusFirstInvalid(document.body, { ok: "x" })).toBe(true)
    expect(document.activeElement).toHaveAttribute("name", "ok")
    expect(focusFirstInvalid(null)).toBe(false)
    document.body.innerHTML = ""
  })

  it("waits for hidden containers to open before focusing", async () => {
    document.body.innerHTML = `<div hidden id="box"><input name="late" /></div>`
    const input = document.querySelector("input")!
    expect(focusField(input)).toBe(true)
    document.getElementById("box")!.hidden = false
    await waitFor(() => expect(input).toHaveFocus())
    document.body.innerHTML = ""
  })
})

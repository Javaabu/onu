import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { en } from "../../locales"
import { FormField } from "../form/form-field"
import { PhoneInput } from "./phone-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

describe("PhoneInput", () => {
  it("defaults to the Maldives and returns an E.164 value", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<PhoneInput aria-label="Mobile" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox", { name: "Mobile" })
    expect(input).toHaveAttribute("type", "tel")
    expect(input).toHaveAttribute("autocomplete", "tel")
    expect(input).toHaveAttribute("dir", "ltr")
    expect(screen.getByRole("button", { name: /Country: Maldives/ })).toHaveTextContent("+960")
    await userEvent.type(input, "7771234")
    expect(onValueChange).toHaveBeenLastCalledWith("+9607771234")
    expect(input).toHaveValue("777-1234")
    await expectNoA11yViolations()
  })

  it("is forced LTR, even on an RTL page", () => {
    const { container } = renderWithOnu(<PhoneInput aria-label="ފޯނު" />, { dir: "rtl", locale: "dv" })
    expect(container.querySelector("[data-slot=phone-input]")).toHaveAttribute("dir", "ltr")
  })

  it("picks a country from a searchable list", async () => {
    const onCountryChange = vi.fn()
    renderWithOnu(<PhoneInput aria-label="Mobile" onCountryChange={onCountryChange} />)
    await userEvent.click(screen.getByRole("button", { name: /Country/ }))
    const search = await screen.findByPlaceholderText("Search countries")
    await userEvent.type(search, "Sri")
    const option = await screen.findByRole("option", { name: /Sri Lanka/ })
    await userEvent.click(option)
    expect(onCountryChange).toHaveBeenCalledWith("LK")
    expect(screen.getByRole("button", { name: /Country: Sri Lanka/ })).toHaveTextContent("+94")
  })

  it("searches by calling code and shows an empty state", async () => {
    renderWithOnu(<PhoneInput aria-label="Mobile" countries={["MV", "IN", "LK"]} />)
    await userEvent.click(screen.getByRole("button", { name: /Country/ }))
    const search = await screen.findByPlaceholderText("Search countries")
    const list = screen.getByRole("listbox")
    expect(within(list).getAllByRole("option")).toHaveLength(3)
    await userEvent.type(search, "+91")
    expect(within(list).getAllByRole("option")).toHaveLength(1)
    await userEvent.clear(search)
    await userEvent.type(search, "zzzz")
    expect(await screen.findByText("No countries found")).toBeInTheDocument()
  })

  it("is controlled and parses an existing value", () => {
    function Controlled() {
      const [v, setV] = React.useState<string | undefined>("+919876543210")
      return (
        <>
          <PhoneInput aria-label="Mobile" value={v} onValueChange={setV} />
          <output>{v ?? "empty"}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("button", { name: /Country: India/ })).toBeInTheDocument()
    expect(screen.getByText("+919876543210")).toBeInTheDocument()
  })

  it("can hide the country select and wire a FormField", () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithOnu(
      <FormField label="Phone" name="phone" error="Invalid number" required>
        <PhoneInput ref={ref} countrySelect={false} defaultValue="+9603331234" classNames={{ input: "in-x" }} />
      </FormField>,
    )
    expect(screen.queryByRole("button", { name: /Country/ })).not.toBeInTheDocument()
    const input = screen.getByLabelText(/Phone/)
    expect(input).toBe(ref.current)
    expect(input).toHaveAttribute("name", "phone")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveClass("in-x")
    expect(input).toBeRequired()
  })

  it("handles clearing and a custom autocomplete", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<PhoneInput aria-label="Mobile" autoComplete="off" onValueChange={onValueChange} />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("autocomplete", "off")
    await userEvent.type(input, "7771234")
    await userEvent.clear(input)
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })

  it("offers an International choice", async () => {
    const onCountryChange = vi.fn()
    renderWithOnu(
      <PhoneInput aria-label="Mobile" allowInternational countries={["MV"]} onCountryChange={onCountryChange} />,
    )
    await userEvent.click(screen.getByRole("button", { name: /Country/ }))
    await userEvent.click(await screen.findByRole("option", { name: /International/ }))
    expect(onCountryChange).toHaveBeenCalledWith(undefined)
    const trigger = screen.getByRole("button", { name: "Country: International" })
    expect(trigger.querySelector("[data-icon-name=globe]")).toBeInTheDocument()
  })

  it("falls back to English country names for unknown locales", () => {
    const base = { code: "zz-invalid-locale-$", name: "x", dir: "ltr" as const }
    renderWithOnu(<PhoneInput aria-label="Mobile" />, {
      locale: { ...en, ...base },
    })
    expect(screen.getByRole("button", { name: /Country: Maldives/ })).toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<PhoneInput aria-label="ފޯނު ނަންބަރު" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: /^ޤައުމު: / })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

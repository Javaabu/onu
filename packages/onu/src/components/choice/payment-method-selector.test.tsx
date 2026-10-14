import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { PaymentMethodSelector } from "./payment-method-selector"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

describe("PaymentMethodSelector", () => {
  it("offers both BML gateways as large cards with BML's logos by default", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<PaymentMethodSelector onValueChange={onValueChange} />)
    const group = screen.getByRole("radiogroup", { name: "Payment method" })
    expect(group).toHaveAttribute("data-variant", "card")
    const transfer = screen.getByRole("radio", { name: "BML Transfer" })
    const connect = screen.getByRole("radio", { name: "BML Connect" })
    expect(transfer).toHaveAttribute("data-size", "lg")
    expect(connect).toHaveAccessibleDescription("Pay online by card through Bank of Maldives.")
    // Official logos, decorative: the card label already names the method.
    expect(transfer.querySelector("[data-slot=bml-transfer-logo]")).toHaveAttribute("aria-hidden", "true")
    expect(connect.querySelector("[data-slot=bml-connect-logo]")).toHaveAttribute("aria-hidden", "true")
    expect(document.querySelectorAll("[data-slot=payment-logo-placeholder]")).toHaveLength(0)
    await userEvent.click(connect)
    expect(onValueChange).toHaveBeenCalledWith("bml-connect")
  })

  it("can enable one gateway, reorder, set a default and custom text per locale", () => {
    renderWithOnu(
      <PaymentMethodSelector
        methods={[
          {
            id: "bml-connect",
            label: { en: "Card payment", dv: "ކާޑުން" },
            description: "Visa, Mastercard, Amex",
            logo: <img src="/bml-connect.svg" alt="" />,
            aside: "MVR 0",
          },
          { id: "bml-transfer", label: "Bank transfer", disabled: true },
        ]}
        defaultValue="bml-connect"
        size="default"
        aria-label="Pay with"
      />,
      { locale: "dv" },
    )
    const radios = screen.getAllByRole("radio")
    expect(radios.map((r) => r.getAttribute("data-method"))).toEqual(["bml-connect", "bml-transfer"])
    expect(screen.getByRole("radio", { name: "ކާޑުން" })).toBeChecked()
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toBeDisabled()
    expect(screen.getByText("MVR 0")).toBeInTheDocument()
    // The custom logo replaces BML Connect's; BML Transfer keeps its own.
    expect(document.querySelectorAll("[data-slot=bml-connect-logo]")).toHaveLength(0)
    expect(document.querySelectorAll("[data-slot=bml-transfer-logo]")).toHaveLength(1)
  })

  it("shows a neutral placeholder for a project-defined method", () => {
    renderWithOnu(<PaymentMethodSelector methods={["bml-transfer", { id: "cash", label: "Cash", icon: "banknote" }]} />)
    expect(
      screen.getByRole("radio", { name: "Cash" }).querySelector("[data-slot=payment-logo-placeholder]"),
    ).not.toBeNull()
  })

  it("only offers BML Transfer when asked and falls back to English text", () => {
    renderWithOnu(<PaymentMethodSelector methods={[{ id: "bml-transfer", label: { fr: "Virement" } }]} />, {
      locale: "dv",
    })
    expect(screen.getAllByRole("radio")).toHaveLength(1)
    expect(screen.getByRole("radio", { name: "Virement" })).toBeInTheDocument()
  })

  it.each(directions)("is keyboard operable in %s", async (dir) => {
    renderWithOnu(<PaymentMethodSelector defaultValue="bml-transfer" />, { dir })
    screen.getByRole("radio", { name: "BML Transfer" }).focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: "BML Connect" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("uses Dhivehi defaults and a FormField label", async () => {
    renderWithOnu(
      <FormField label="ފައިސާ ދައްކާ ގޮތް" required error="ގޮތެއް އިޚްތިޔާރު ކުރައްވާ">
        <PaymentMethodSelector />
      </FormField>,
      { locale: "dv", dir: "rtl" },
    )
    expect(screen.getByRole("radiogroup", { name: /ފައިސާ ދައްކާ ގޮތް/ })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "BML ޓްރާންސްފަރ" })).toHaveAttribute("aria-invalid", "true")
    await expectNoA11yViolations()
  })
})

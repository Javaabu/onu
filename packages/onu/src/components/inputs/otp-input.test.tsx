import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { cleanOtpPaste, OtpInput } from "./otp-input"

const getInput = () => screen.getByRole("textbox") as HTMLInputElement

beforeAll(() => {
  // input-otp probes for password manager badges with elementFromPoint, which jsdom lacks.
  document.elementFromPoint ??= vi.fn(() => null)
})

describe("OtpInput", () => {
  it("is a numeric one-time-code field with one slot per digit", async () => {
    const { container } = renderWithOnu(<OtpInput />)
    const input = getInput()
    expect(input).toHaveAccessibleName("One-time code")
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("autocomplete", "one-time-code")
    expect(input).toHaveAttribute("maxlength", "6")
    expect(container.querySelectorAll("[data-slot=input-otp-slot]")).toHaveLength(6)
    await expectNoA11yViolations()
  })

  it("accepts digits only and calls onComplete", async () => {
    const onComplete = vi.fn()
    const onValueChange = vi.fn()
    renderWithOnu(<OtpInput aria-label="Code" length={4} onComplete={onComplete} onValueChange={onValueChange} />)
    const input = getInput()
    await userEvent.click(input)
    await userEvent.keyboard("1a2b34")
    expect(input).toHaveValue("1234")
    expect(onValueChange).toHaveBeenLastCalledWith("1234")
    expect(onComplete).toHaveBeenCalledWith("1234")
  })

  it("cleans pasted codes", () => {
    expect(cleanOtpPaste("123 456")).toBe("123456")
    expect(cleanOtpPaste("123-456\n")).toBe("123456")
  })

  it("supports pasting a whole code", async () => {
    const onComplete = vi.fn()
    renderWithOnu(<OtpInput aria-label="Code" onComplete={onComplete} />)
    const input = getInput()
    await userEvent.click(input)
    await userEvent.paste("482 913")
    expect(input).toHaveValue("482913")
    expect(onComplete).toHaveBeenCalledWith("482913")
  })

  it("auto-submits the surrounding form when complete", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const submit = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(function (
      this: HTMLFormElement,
    ) {
      fireEvent.submit(this)
    })
    renderWithOnu(
      <form onSubmit={onSubmit}>
        <OtpInput aria-label="Code" length={4} autoSubmit name="code" />
      </form>,
    )
    await userEvent.click(getInput())
    await userEvent.keyboard("9876")
    expect(submit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    submit.mockRestore()
  })

  it("groups slots, allows letters and is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState("AB")
      return (
        <>
          <OtpInput aria-label="Voucher" alphanumeric groupSize={3} value={v} onValueChange={setV} size="lg" />
          <output>{v}</output>
        </>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(container.querySelectorAll("[data-slot=input-otp-group]")).toHaveLength(2)
    expect(container.querySelectorAll("[data-slot=input-otp-separator]")).toHaveLength(1)
    expect(container.querySelector("[data-slot=input-otp-slot]")).toHaveClass("size-12")
    expect(getInput()).toHaveAttribute("inputmode", "text")
    await userEvent.click(getInput())
    await act(async () => userEvent.keyboard("C"))
    expect(screen.getByText("ABC")).toBeInTheDocument()
  })

  it("is labelled and wired by a FormField", () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithOnu(
      <FormField label="Verification code" name="otp" error="Code expired" help="Sent to 777-1234">
        <OtpInput ref={ref} classNames={{ slot: "slot-x" }} />
      </FormField>,
    )
    const input = screen.getByLabelText("Verification code")
    expect(input).toBe(ref.current)
    expect(input).toHaveAttribute("name", "otp")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(document.querySelector(".slot-x")).toHaveAttribute("aria-invalid", "true")
  })

  it.each(directions)("stays LTR and uses Dhivehi labels in %s", async (dir) => {
    const { container } = renderWithOnu(<OtpInput />, { dir, locale: "dv" })
    expect(getInput()).toHaveAccessibleName("އެއްފަހަރު ބޭނުންކުރާ ކޯޑު")
    expect(container.querySelector("[data-slot=otp-input]")).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

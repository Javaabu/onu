import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { maskSecret, SensitiveInput } from "./sensitive-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

const KEY = "sk_live_51Hx9aBcDeF1234"

describe("maskSecret", () => {
  it("keeps the last characters and hides the length", () => {
    expect(maskSecret(KEY)).toBe("••••••••1234")
    expect(maskSecret("abc")).toBe("••••••••")
    expect(maskSecret("abcdef", 0, 4, "*")).toBe("****")
    expect(maskSecret("")).toBe("")
  })
})

describe("SensitiveInput", () => {
  let writeText: ReturnType<typeof vi.fn>
  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
  })
  afterEach(() => vi.useRealTimers())

  it("masks the secret and reveals it on demand", async () => {
    const onRevealedChange = vi.fn()
    renderWithOnu(<SensitiveInput aria-label="API key" value={KEY} onRevealedChange={onRevealedChange} />)
    const input = screen.getByRole("textbox", { name: "API key" })
    expect(input).toHaveValue("••••••••1234")
    expect(input).toHaveAttribute("readonly")
    expect(input).toHaveAttribute("dir", "ltr")
    expect(document.body.textContent).not.toContain(KEY)
    const reveal = screen.getByRole("button", { name: "Show value" })
    await userEvent.click(reveal)
    expect(input).toHaveValue(KEY)
    expect(reveal).toHaveAttribute("aria-pressed", "true")
    expect(onRevealedChange).toHaveBeenCalledWith(true)
    expect(screen.getByText("Value shown")).toBeInTheDocument()
    await userEvent.click(reveal)
    expect(input).toHaveValue("••••••••1234")
    expect(screen.getByText("Value hidden")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("copies the full secret while masked and announces it", async () => {
    const onCopy = vi.fn()
    renderWithOnu(<SensitiveInput aria-label="API key" value={KEY} onCopy={onCopy} />)
    await userEvent.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeText).toHaveBeenCalledWith(KEY)
    expect(onCopy).toHaveBeenCalledWith(KEY)
    expect(await screen.findByText("Copied")).toBeInTheDocument()
  })

  it("falls back to execCommand and reports failures", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
    const exec = vi.fn().mockReturnValue(false)
    document.execCommand = exec
    renderWithOnu(<SensitiveInput aria-label="API key" value={KEY} />)
    await userEvent.click(screen.getByRole("button", { name: "Copy" }))
    expect(exec).toHaveBeenCalledWith("copy")
    expect(await screen.findByText("Could not copy")).toBeInTheDocument()
  })

  it("resets the copied state after a while", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderWithOnu(<SensitiveInput aria-label="API key" value={KEY} />)
    await act(async () => screen.getByRole("button", { name: "Copy" }).click())
    expect(screen.getByText("Copied")).toBeInTheDocument()
    await act(async () => vi.advanceTimersByTime(2100))
    expect(screen.queryByText("Copied")).not.toBeInTheDocument()
  })

  it("supports controlled reveal and hiding the buttons", () => {
    renderWithOnu(
      <SensitiveInput aria-label="Token" value={KEY} revealed revealable={false} copyable={false} visibleChars={2} />,
    )
    expect(screen.getByRole("textbox")).toHaveValue(KEY)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("selects the value on focus and uses a FormField label", async () => {
    renderWithOnu(
      <FormField label="Client secret" help="Keep this private">
        <SensitiveInput value={KEY} classNames={{ input: "x-input" }} />
      </FormField>,
    )
    const input = screen.getByLabelText("Client secret") as HTMLInputElement
    expect(input).toHaveClass("x-input", "font-mono")
    await userEvent.click(input)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(input.value.length)
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<SensitiveInput aria-label="ކީ" value={KEY} />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "އަގު ދައްކާ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ކޮޕީކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

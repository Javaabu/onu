import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CopyInput } from "./copy-input"

const LINK = "https://portal.gov.mv/apply/REF-2026-00451"

describe("CopyInput", () => {
  let writeText: ReturnType<typeof vi.fn>
  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
  })

  it("shows a read-only value and copies it", async () => {
    const onCopy = vi.fn()
    renderWithOnu(<CopyInput aria-label="Share link" value={LINK} onCopy={onCopy} />)
    const input = screen.getByRole("textbox", { name: "Share link" })
    expect(input).toHaveValue(LINK)
    expect(input).toHaveAttribute("readonly")
    await userEvent.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeText).toHaveBeenCalledWith(LINK)
    expect(onCopy).toHaveBeenCalledWith(LINK)
    expect(await screen.findByText("Copied")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copy" })).toHaveAttribute("data-copied", "true")
    await expectNoA11yViolations()
  })

  it("selects everything on focus", async () => {
    renderWithOnu(<CopyInput aria-label="Reference" value="REF-2026-00451" mono />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input).toHaveClass("font-mono")
    await userEvent.click(input)
    expect(input.selectionEnd).toBe(input.value.length)
  })

  it("does not copy when disabled and keeps extra addons", () => {
    renderWithOnu(<CopyInput aria-label="Reference" value="x" disabled endAddon={<span>MV</span>} />)
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled()
    expect(screen.getByText("MV")).toBeInTheDocument()
  })

  it.each(directions)("announces in Dhivehi in %s", async (dir) => {
    renderWithOnu(<CopyInput aria-label="ލިންކް" value={LINK} />, { dir, locale: "dv" })
    await userEvent.click(screen.getByRole("button", { name: "ކޮޕީކުރޭ" }))
    expect(await screen.findByText("ކޮޕީކުރެވިއްޖެ")).toBeInTheDocument()
  })
})

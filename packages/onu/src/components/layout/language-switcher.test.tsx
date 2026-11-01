import { createRef } from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { LanguageSwitcher } from "./language-switcher"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("LanguageSwitcher", () => {
  it("renders a labelled select with native names and lang attributes", async () => {
    const onChange = vi.fn()
    renderWithOnu(<LanguageSwitcher onValueChange={onChange} className="extra" />)
    const select = screen.getByRole("combobox", { name: "Language" })
    expect(select).toHaveValue("en")
    const dv = screen.getByRole("option", { name: "ދިވެހި" })
    expect(dv).toHaveAttribute("lang", "dv")
    expect(dv).toHaveAttribute("dir", "rtl")
    fireEvent.change(select, { target: { value: "dv" } })
    expect(onChange).toHaveBeenCalledWith("dv")
    expect(document.querySelector("[data-slot=language-switcher]")).toHaveClass("extra")
    await expectNoA11yViolations()
  })

  it("renders as toggle buttons", async () => {
    const onChange = vi.fn()
    renderWithOnu(<LanguageSwitcher variant="toggle" value="dv" onValueChange={onChange} />)
    expect(screen.getByRole("radiogroup", { name: "Language" })).toBeInTheDocument()
    const dv = screen.getByRole("radio", { name: "ދިވެހި" })
    expect(dv).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("radio", { name: "English" }))
    expect(onChange).toHaveBeenCalledWith("en")
    await expectNoA11yViolations()
  })

  it("renders as a menu with custom languages", async () => {
    const onChange = vi.fn()
    renderWithOnu(
      <LanguageSwitcher
        variant="menu"
        size="sm"
        onValueChange={onChange}
        languages={[
          { code: "en", name: "English" },
          { code: "ar", name: "العربية", dir: "rtl" },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Language: English" })
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "العربية" }))
    expect(onChange).toHaveBeenCalledWith("ar")
    expect(trigger).toHaveFocus()
  })

  it("can hide the icon and be disabled", () => {
    renderWithOnu(<LanguageSwitcher showIcon={false} disabled id="lang" />)
    const select = screen.getByRole("combobox")
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute("id", "lang")
  })

  it("shows the code when the current language is not in the list", () => {
    renderWithOnu(<LanguageSwitcher variant="menu" value="fr" showIcon={false} />)
    expect(screen.getByRole("button", { name: "Language: fr" })).toHaveTextContent("fr")
  })

  it.each(directions)("defaults to the active locale in %s", async (dir) => {
    renderWithOnu(<LanguageSwitcher />, { locale: "dv", dir })
    expect(screen.getByRole("combobox", { name: "ބަސް" })).toHaveValue("dv")
    await expectNoA11yViolations()
  })
})

describe("LanguageSwitcher overrides", () => {
  it.each(["select", "toggle", "menu"] as const)("passes rest props and ref to the %s root", (variant) => {
    const ref = createRef<HTMLElement>()
    renderWithOnu(<LanguageSwitcher variant={variant} ref={ref} data-testid="switcher" title="Pick" />)
    expect(screen.getByTestId("switcher")).toBe(ref.current)
    expect(screen.getByTestId("switcher")).toHaveAttribute("title", "Pick")
  })

  it("puts id on the select with select, and on the root otherwise", () => {
    const { rerender } = renderWithOnu(<LanguageSwitcher id="lang" />)
    expect(screen.getByRole("combobox")).toHaveAttribute("id", "lang")
    rerender(<LanguageSwitcher variant="menu" id="lang" />)
    expect(screen.getByRole("button")).toHaveAttribute("id", "lang")
  })

  it("accepts classNames", () => {
    const { container } = renderWithOnu(
      <LanguageSwitcher classNames={{ root: "r", icon: "i", label: "l", select: "s", item: "o" }} />,
    )
    expect(container.querySelector('[data-slot="language-switcher"]')).toHaveClass("r")
    expect(container.querySelector("svg.i")).toBeInTheDocument()
    expect(container.querySelector("label")).toHaveClass("l", "sr-only")
    expect(container.querySelector(".s")).toContainElement(screen.getByRole("combobox"))
    expect(screen.getByRole("option", { name: "English" })).toHaveClass("o")
  })

  it("starts from defaultValue and keeps its own selection when uncontrolled", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<LanguageSwitcher defaultValue="dv" onValueChange={onValueChange} />)
    const select = screen.getByRole<HTMLSelectElement>("combobox")
    expect(select.value).toBe("dv")
    await userEvent.selectOptions(select, "en")
    expect(select.value).toBe("en")
    expect(onValueChange).toHaveBeenCalledWith("en")
  })

  it("follows the active locale without value or defaultValue", async () => {
    renderWithOnu(<LanguageSwitcher />, { locale: "dv" })
    const select = screen.getByRole<HTMLSelectElement>("combobox")
    expect(select.value).toBe("dv")
    await userEvent.selectOptions(select, "en")
    expect(select.value).toBe("dv")
  })
})

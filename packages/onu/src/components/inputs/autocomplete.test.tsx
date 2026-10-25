import * as React from "react"
import { act, configure, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { normalizeOption, optionMatches } from "./_suggestions"
import { Autocomplete } from "./autocomplete"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const ISLANDS = ["Malé", "Hulhumalé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo"]

afterEach(() => vi.useRealTimers())

function typeThaana(el: HTMLElement, data: string) {
  for (const ch of data) {
    el.dispatchEvent(
      new InputEvent("beforeinput", { inputType: "insertText", data: ch, cancelable: true, bubbles: true }),
    )
  }
}

describe("suggestion helpers", () => {
  it("normalizes and matches options", () => {
    expect(normalizeOption("Malé")).toEqual({ value: "Malé", label: "Malé" })
    expect(normalizeOption({ value: "mle", label: "Malé" })).toEqual({ value: "mle", label: "Malé" })
    expect(optionMatches({ value: "mle", label: "Malé" }, "MAL")).toBe(true)
    expect(optionMatches({ value: "x", label: <b /> }, "y")).toBe(false)
    expect(optionMatches({ value: "x", label: "x" }, " ")).toBe(true)
    // Intl.Collator: accents are ignored, keywords match too.
    expect(optionMatches({ value: "Malé", label: "Malé" }, "male")).toBe(true)
    expect(optionMatches({ value: "k", label: "Kaafu", keywords: ["Malé Atoll"] }, "atoll")).toBe(true)
  })
})

describe("Autocomplete", () => {
  it("is a combobox that filters a static list as you type", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Island" })
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).toHaveAttribute("aria-autocomplete", "list")
    await userEvent.type(input, "hu")
    expect(input).toHaveAttribute("aria-expanded", "true")
    const options = screen.getAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual(["Hulhumalé", "Kulhudhuffushi"])
    expect(input).toHaveAttribute("aria-controls", screen.getByRole("listbox").id)
    expect(screen.getByText("2 suggestions available")).toBeInTheDocument()
    expect(onValueChange).toHaveBeenLastCalledWith("hu", null)
    await expectNoA11yViolations()
  })

  it("picks with arrow keys and Enter, keeping focus in the input", async () => {
    const onSelect = vi.fn()
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} onSelect={onSelect} />)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "a")
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    const active = screen.getAllByRole("option")[1]!
    expect(input).toHaveAttribute("aria-activedescendant", active.id)
    expect(active).toHaveAttribute("aria-selected", "true")
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(input).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option").at(-1)!.id)
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(input).toHaveValue("Malé")
    expect(onSelect).toHaveBeenCalledWith({ value: "Malé", label: "Malé" })
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute("aria-expanded", "false")
  })

  it("opens with ArrowDown / ArrowUp, closes with Escape, then Escape clears", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} defaultValue="Ma" />)
    const input = screen.getByRole("combobox")
    input.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(input).toHaveAttribute("aria-expanded", "true")
    await userEvent.keyboard("{Escape}")
    expect(input).toHaveAttribute("aria-expanded", "false")
    expect(input).toHaveValue("Ma")
    await userEvent.keyboard("{ArrowUp}")
    expect(input).toHaveAttribute("aria-expanded", "true")
    await userEvent.keyboard("{Escape}{Escape}")
    expect(input).toHaveValue("")
  })

  it("picks with the pointer and closes on blur and Tab", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} openOnFocus />)
    const input = screen.getByRole("combobox")
    await userEvent.click(input)
    expect(screen.getAllByRole("option")).toHaveLength(6)
    fireEvent.pointerMove(screen.getByRole("option", { name: "Addu City" }))
    expect(screen.getByRole("option", { name: "Addu City" })).toHaveAttribute("data-active", "true")
    await userEvent.click(screen.getByRole("option", { name: "Addu City" }))
    expect(input).toHaveValue("Addu City")
    await userEvent.type(input, "x")
    await userEvent.tab()
    expect(input).toHaveAttribute("aria-expanded", "false")
  })

  it("keeps free text that matches nothing", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} />)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "Vilimalé{Enter}")
    expect(input).toHaveValue("Vilimalé")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("debounces async suggestions and cancels stale requests", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetcher = vi.fn(async (q: string, { signal }: { signal: AbortSignal }) => {
      expect(signal).toBeInstanceOf(AbortSignal)
      return ISLANDS.filter((i) => i.toLowerCase().startsWith(q.toLowerCase())).map((value) => ({
        value,
        description: "Island",
      }))
    })
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={fetcher} debounce={200} />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "h" } })
    fireEvent.change(input, { target: { value: "hu" } })
    await act(async () => vi.advanceTimersByTime(250))
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledWith("hu", expect.anything())
    expect(await screen.findByRole("option", { name: /Hulhumalé/ })).toBeInTheDocument()
    expect(screen.getByText("Island")).toBeInTheDocument()
  })

  it("shows loading and error states with retry", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    let fail = true
    let resolveLater: (() => void) | undefined
    const fetcher = vi.fn(
      () =>
        new Promise<string[]>((resolve, reject) => {
          if (fail) reject(new Error("offline"))
          else resolveLater = () => resolve(["Malé"])
        }),
    )
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={fetcher} debounce={0} />)
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "m" } })
    await act(async () => vi.advanceTimersByTime(10))
    expect(await screen.findByText("Could not load suggestions", { selector: "div" })).toBeInTheDocument()
    fail = false
    await userEvent.click(screen.getByRole("button", { name: "Retry" }))
    await act(async () => vi.advanceTimersByTime(10))
    expect(screen.getAllByText("Loading suggestions…").length).toBeGreaterThan(0)
    await act(async () => resolveLater?.())
    await waitFor(() => expect(screen.getByRole("option", { name: "Malé" })).toBeInTheDocument())
  })

  it("respects minChars", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} minChars={2} />)
    await userEvent.type(screen.getByRole("combobox"), "h")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("is controlled, renders custom options and is wired by a FormField", async () => {
    function Controlled() {
      const [v, setV] = React.useState("")
      return (
        <FormField label="Atoll" name="atoll" required>
          <Autocomplete
            value={v}
            onValueChange={setV}
            suggestions={[{ value: "Kaafu", label: "Kaafu (Malé Atoll)" }]}
            renderOption={(o, { active }) => <span data-active-option={active}>{o.label} ✓</span>}
            classNames={{ option: "opt-x" }}
          />
        </FormField>
      )
    }
    renderWithOnu(<Controlled />)
    const input = screen.getByRole("combobox", { name: /Atoll/ })
    expect(input).toHaveAttribute("name", "atoll")
    expect(input).toBeRequired()
    await userEvent.type(input, "ka")
    expect(screen.getByRole("option")).toHaveClass("opt-x")
    expect(screen.getByText("Kaafu (Malé Atoll) ✓")).toBeInTheDocument()
  })

  it("types Thaana with the thaana prop and lists Thaana suggestions", async () => {
    renderWithOnu(<Autocomplete aria-label="ރަށް" thaana suggestions={["މާލެ", "ހުޅުމާލެ", "ވިލިމާލެ"]} />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("dir", "rtl")
    expect(input).toHaveAttribute("lang", "dv")
    input.focus()
    typeThaana(input, "hu")
    await waitFor(() => expect(input).toHaveValue("ހު"))
    expect(screen.getByRole("listbox")).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("option")).toHaveTextContent("ހުޅުމާލެ")
  })

  it.each(directions)("announces in Dhivehi in %s", async (dir) => {
    renderWithOnu(<Autocomplete aria-label="ރަށް" suggestions={ISLANDS} />, { dir, locale: "dv" })
    await userEvent.type(screen.getByRole("combobox"), "malé")
    expect(screen.getByText(/^2 ހުށަހެޅު/)).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("matches accents and keywords with Intl.Collator", async () => {
    renderWithOnu(
      <Autocomplete
        aria-label="Island"
        suggestions={[...ISLANDS, { value: "Kaafu", keywords: ["North Malé Atoll"] }]}
      />,
    )
    await userEvent.type(screen.getByRole("combobox"), "male")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Malé", "Hulhumalé", "Kaafu"])
  })

  it("passes the picked option, or null for typed text, to onValueChange", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} onValueChange={onValueChange} />)
    await userEvent.type(screen.getByRole("combobox"), "add")
    expect(onValueChange).toHaveBeenLastCalledWith("add", null)
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("Addu City", { value: "Addu City", label: "Addu City" })
  })

  it("does not pick a disabled suggestion with Enter", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={[{ value: "Malé", disabled: true }]} />)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "ma{ArrowDown}{Enter}")
    expect(input).toHaveValue("ma")
  })

  it("opens the full list with showToggleButton", async () => {
    renderWithOnu(<Autocomplete aria-label="Island" suggestions={ISLANDS} defaultValue="Malé" showToggleButton />)
    const button = screen.getByRole("button", { name: "Show options" })
    expect(button).toHaveAttribute("tabindex", "-1")
    await userEvent.click(button)
    expect(screen.getAllByRole("option")).toHaveLength(6)
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(button).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(button)
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("offers the typed text with showCustomOption and highlights the first row with autoHighlight", async () => {
    const onSelect = vi.fn()
    renderWithOnu(
      <Autocomplete aria-label="Island" suggestions={ISLANDS} showCustomOption autoHighlight onSelect={onSelect} />,
    )
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "hul ")
    const options = screen.getAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual(["Use “hul”", "Hulhumalé"])
    expect(options[0]).toHaveAttribute("data-custom", "true")
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id)
    await userEvent.keyboard("{Enter}")
    expect(input).toHaveValue("hul")
    expect(onSelect).not.toHaveBeenCalled()
    await userEvent.clear(input)
    await userEvent.type(input, "malé")
    // An exact match: no custom row.
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Malé")
    expect(screen.queryByText("Use “malé”")).not.toBeInTheDocument()
  })

  it("shows emptyMessage and supports a controlled open state", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <Autocomplete
        aria-label="Island"
        suggestions={ISLANDS}
        emptyMessage={(q) => `Nothing for ${q}`}
        open
        onOpenChange={onOpenChange}
      />,
    )
    expect(screen.getAllByRole("option")).toHaveLength(6)
    await userEvent.type(screen.getByRole("combobox"), "zz")
    expect(screen.getByText("Nothing for zz")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })

  it.each(directions)("passes axe with the toggle button and custom row in Dhivehi in %s", async (dir) => {
    renderWithOnu(
      <Autocomplete aria-label="ރަށް" thaana suggestions={["މާލެ", "ހުޅުމާލެ"]} showToggleButton showCustomOption />,
      { dir, locale: "dv" },
    )
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button", { name: "އިޚްތިޔާރުތައް ދައްކާ" }))
    expect(screen.getAllByRole("option")).toHaveLength(2)
    await expectNoA11yViolations()
  })
})

const titles = ["Director", "Deputy Director", "Assistant Director", { value: "x", label: "Intern", disabled: true }]
// Pick from a list or type your own.
const editable = { showToggleButton: true, showCustomOption: true, autoHighlight: true } as const

describe("Autocomplete as an editable select", () => {
  it("suggests while typing and keeps custom text", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <Autocomplete aria-label="Job title" suggestions={titles} {...editable} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole("combobox", { name: "Job title" })
    expect(input).toHaveAttribute("aria-expanded", "false")
    await userEvent.type(input, "dep")
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Use “dep”", "Deputy Director"])
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("dep", null)
    expect(input).toHaveValue("dep")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("picks a suggestion with arrow keys and moves the active descendant", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <Autocomplete aria-label="Job title" suggestions={titles} {...editable} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole("combobox")
    input.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")).toHaveLength(4)
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0]!.id)
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(
      "Deputy Director",
      expect.objectContaining({ label: "Deputy Director" }),
    )
    expect(input).toHaveValue("Deputy Director")
  })

  it("writes the label of ChoiceOptions mapped to it", async () => {
    const onValueChange = vi.fn()
    const atolls = [{ value: "K", label: "Kaafu" }]
    renderWithOnu(
      <Autocomplete
        aria-label="Atoll"
        suggestions={atolls.map((o) => ({ ...o, value: o.label }))}
        {...editable}
        onValueChange={onValueChange}
      />,
    )
    await userEvent.type(screen.getByRole("combobox"), "kaa{ArrowDown}{Enter}")
    expect(screen.getByRole("combobox")).toHaveValue("Kaafu")
    expect(onValueChange).toHaveBeenLastCalledWith("Kaafu", { value: "Kaafu", label: "Kaafu" })
  })

  it("opens with the button, selects by click and closes with Escape", async () => {
    renderWithOnu(<Autocomplete aria-label="Job title" suggestions={titles} {...editable} defaultValue="Director" />)
    await userEvent.click(screen.getByRole("button", { name: "Show options" }))
    expect(screen.getByRole("option", { name: "Director" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("option", { name: "Intern" }))
    expect(screen.getByRole("combobox")).toHaveValue("Director")
    await userEvent.click(screen.getByRole("option", { name: "Assistant Director" }))
    expect(screen.getByRole("combobox")).toHaveValue("Assistant Director")
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(screen.getByRole("combobox")).toHaveFocus()
  })

  it("shows an empty message and closes on Tab", async () => {
    renderWithOnu(
      <Autocomplete
        aria-label="Job title"
        suggestions={titles}
        {...editable}
        showCustomOption={false}
        emptyMessage={(q) => `No results for “${q}”`}
      />,
    )
    await userEvent.type(screen.getByRole("combobox"), "zzz")
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("is controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("Hello")
      return (
        <>
          <Autocomplete aria-label="t" suggestions={titles} {...editable} value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.type(screen.getByRole("combobox"), "!")
    expect(screen.getByText("Hello!")).toBeInTheDocument()
  })

  it("types Thaana and shows a toggle", async () => {
    renderWithOnu(<Autocomplete aria-label="މަޤާމު" suggestions={["ޑިރެކްޓަރ"]} {...editable} thaana thaanaToggle />, {
      locale: "dv",
    })
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("button", { name: "ތާނައާއި ލަތީނުގެ ދެމެދު ބަދަލުކުރޭ" })).toBeInTheDocument()
  })

  it("wires a FormField and overrides", () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithOnu(
      <FormField label="Title" name="title" required>
        <Autocomplete
          suggestions={titles}
          {...editable}
          ref={ref}
          className="root-x"
          classNames={{ input: "input-x" }}
        />
      </FormField>,
    )
    const input = screen.getByRole("combobox", { name: /Title/ })
    expect(input).toBe(ref.current)
    expect(input).toHaveAttribute("name", "title")
    expect(input).toBeRequired()
    expect(input).toHaveClass("input-x")
    expect(input.closest("[data-slot=autocomplete]")).toBeInTheDocument()
    expect(input.closest("[data-slot=input-group]")).toHaveClass("root-x")
  })

  it("disables the button inside a disabled FormField", () => {
    renderWithOnu(
      <FormField label="Title" disabled>
        <Autocomplete suggestions={titles} {...editable} />
      </FormField>,
    )
    expect(screen.getByRole("button", { name: "Show options" })).toBeDisabled()
  })

  it.each(directions)("passes axe in %s, open and closed", async (dir) => {
    renderWithOnu(<Autocomplete aria-label="Job title" suggestions={titles} {...editable} />, { dir })
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button", { name: "Show options" }))
    await expectNoA11yViolations()
  })
})

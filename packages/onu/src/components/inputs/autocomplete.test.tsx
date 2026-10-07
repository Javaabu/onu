import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { matchesQuery, normalizeOption } from "./_suggestions"
import { Autocomplete } from "./autocomplete"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

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
    expect(matchesQuery({ value: "mle", label: "Malé" }, "MAL")).toBe(true)
    expect(matchesQuery({ value: "x", label: <b /> }, "y")).toBe(false)
    expect(matchesQuery({ value: "x", label: "x" }, " ")).toBe(true)
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
    expect(onValueChange).toHaveBeenLastCalledWith("hu")
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
})

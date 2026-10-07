import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import type { IconSource } from "../../icons/icon-context"
import { FormField } from "../form/form-field"
import { filterIconIds, IconPicker, lucideIconIds } from "./icon-picker"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

const tabler: IconSource = {
  prefixes: ["tabler"],
  label: "Tabler",
  render: (name, { className }) => <svg data-tabler={name} className={className} />,
  list: async () => ["tabler:home", "tabler:house-door", "tabler:ship"],
}

async function openPicker(name = "Icon") {
  await userEvent.click(screen.getByRole("button", { name }))
  return screen.findByRole("combobox", { name: "Search icons" })
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("icon helpers", () => {
  it("lists Lucide ids and filters by name", () => {
    const ids = lucideIconIds()
    expect(ids.length).toBeGreaterThan(1000)
    expect(ids).toContain("lucide:house")
    expect(filterIconIds(["lucide:arrow-left", "lucide:house"], "Arrow left")).toEqual(["lucide:arrow-left"])
    expect(filterIconIds(["a", "b"], " ")).toEqual(["a", "b"])
  })
})

describe("IconPicker", () => {
  it("opens a searchable grid and returns a portable id", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<IconPicker aria-label="Icon" onValueChange={onValueChange} />)
    const search = await openPicker()
    expect(search).toHaveFocus()
    await userEvent.type(search, "house-plus")
    const option = await screen.findByRole("option", { name: "house-plus" })
    await userEvent.click(option)
    expect(onValueChange).toHaveBeenCalledWith("lucide:house-plus")
    expect(screen.getByRole("button", { name: "Icon" })).toHaveTextContent("house-plus")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("moves through the grid with arrow keys (mirrored in RTL) and picks with Enter", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<IconPicker aria-label="Icon" onValueChange={onValueChange} />, { dir: "rtl" })
    const search = await openPicker()
    await userEvent.type(search, "arrow")
    await screen.findAllByRole("option")
    const firstId = search.getAttribute("aria-activedescendant")!
    expect(document.getElementById(firstId)).toHaveAttribute("data-active", "true")
    await userEvent.keyboard("{ArrowLeft}")
    const second = search.getAttribute("aria-activedescendant")!
    expect(second).not.toBe(firstId)
    await userEvent.keyboard("{ArrowRight}")
    expect(search.getAttribute("aria-activedescendant")).toBe(firstId)
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{PageDown}{PageUp}{ArrowRight}")
    expect(search.getAttribute("aria-activedescendant")).toBe(firstId)
    const name = document.getElementById(firstId)!.getAttribute("aria-label")
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenCalledWith(`lucide:${name}`)
  })

  it("shows recently used icons and an empty state", async () => {
    window.localStorage.setItem("onu-icon-picker-recent", JSON.stringify(["lucide:ship", 5]))
    const onValueChange = vi.fn()
    renderWithOnu(<IconPicker aria-label="Icon" onValueChange={onValueChange} />)
    const search = await openPicker()
    expect(screen.getByText("Recently used")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "ship" }))
    expect(onValueChange).toHaveBeenCalledWith("lucide:ship")
    await openPicker("Icon")
    const again = screen.getByRole("combobox", { name: "Search icons" })
    expect(again).toBeInTheDocument()
    await userEvent.type(again, "zzzzzz")
    expect(await screen.findByText("No icons found")).toBeInTheDocument()
    expect(screen.getByText("No icons")).toBeInTheDocument()
    expect(search).toBeDefined()
  })

  it("includes icon sources from OnuProvider and filters by set", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<IconPicker aria-label="Icon" onValueChange={onValueChange} />, {
      provider: { iconSources: [tabler] },
    })
    const search = await openPicker()
    const set = screen.getByRole("combobox", { name: "Icon set" })
    await userEvent.selectOptions(set, "tabler")
    const grid = screen.getByRole("listbox", { name: "Choose an icon" })
    await waitFor(() => expect(within(grid).getAllByRole("option")).toHaveLength(3))
    await userEvent.type(search, "ship")
    await userEvent.click(screen.getByRole("option", { name: "ship" }))
    expect(onValueChange).toHaveBeenCalledWith("tabler:ship")
  })

  it("can be limited to some sets and cleared", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <IconPicker aria-label="Icon" sets={["tabler"]} defaultValue="tabler:home" onValueChange={onValueChange} />,
      { provider: { iconSources: [tabler] } },
    )
    expect(document.querySelector("[data-tabler=home]")).toBeInTheDocument()
    await openPicker()
    expect(screen.queryByRole("combobox", { name: "Icon set" })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3))
    await userEvent.click(screen.getByRole("button", { name: "Remove icon" }))
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("is controlled, submits the id and is wired by a FormField", () => {
    function Controlled() {
      const [v, setV] = React.useState<string | null>("lucide:anchor")
      return (
        <form>
          <FormField label="Menu icon" name="icon" required>
            <IconPicker value={v} onValueChange={setV} recentLimit={0} />
          </FormField>
        </form>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(screen.getByRole("button", { name: /Menu icon/ })).toHaveTextContent("anchor")
    expect(new FormData(container.querySelector("form")!).get("icon")).toBe("lucide:anchor")
  })

  it("keeps working when storage is blocked", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    renderWithOnu(<IconPicker aria-label="Icon" />)
    const search = await openPicker()
    await userEvent.type(search, "anchor")
    fireEvent.click(await screen.findByRole("option", { name: "anchor" }))
    expect(screen.getByRole("button", { name: "Icon" })).toHaveTextContent("anchor")
    getItem.mockRestore()
    setItem.mockRestore()
  })

  it.each(directions)("uses Dhivehi strings in %s and passes axe", async (dir) => {
    renderWithOnu(<IconPicker aria-label="އައިކަން" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "އައިކަން" })).toHaveTextContent("އައިކަނެއް ނެތް")
    await userEvent.click(screen.getByRole("button", { name: "އައިކަން" }))
    expect(await screen.findByRole("combobox", { name: "އައިކަން ހޯދާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

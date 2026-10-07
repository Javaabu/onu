import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import {
  CommandPalette,
  matchesQuery,
  normalizeSearch,
  type CommandPaletteGroup,
  type CommandPaletteItem,
} from "./command-palette"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const groups: CommandPaletteGroup[] = [
  {
    heading: "Pages",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "staff", label: "Staff", icon: "users", keywords: ["employees", "މުވައްޒަފުން"] },
      { id: "male", label: "Malé office", description: "Kaafu" },
    ],
  },
  {
    heading: "Actions",
    items: [
      { id: "new", label: "New permit", shortcut: "⌘N" },
      { id: "print", label: "Print", disabled: true },
    ],
  },
]

function options() {
  return screen.queryAllByRole("option").map((o) => o.textContent)
}

describe("search helpers", () => {
  it("normalises case and Latin diacritics", () => {
    expect(normalizeSearch("  Malé ")).toBe("male")
  })

  it("matches every word against value, label and keywords", () => {
    const item: CommandPaletteItem = { id: "1", label: "Staff list", keywords: ["employees"] }
    expect(matchesQuery(item, "")).toBe(true)
    expect(matchesQuery(item, "staff emp")).toBe(true)
    expect(matchesQuery(item, "staff x")).toBe(false)
    expect(matchesQuery({ id: "2", label: <b>Node</b>, value: "custom" }, "cust")).toBe(true)
    expect(matchesQuery({ id: "3", label: <b>Node</b> }, "node")).toBe(false)
  })
})

describe("CommandPalette", () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it("opens with Ctrl+K and ⌘K and closes with Escape, returning focus", async () => {
    renderWithOnu(
      <>
        <Button>Before</Button>
        <CommandPalette groups={groups} />
      </>,
    )
    const before = screen.getByRole("button", { name: "Before" })
    before.focus()
    await userEvent.keyboard("{Control>}k{/Control}")
    const dialog = screen.getByRole("dialog", { name: "Command palette" })
    expect(screen.getByRole("combobox")).toHaveFocus()
    expect(within(dialog).getByText("Navigate")).toBeInTheDocument()
    await expectNoA11yViolations()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(before).toHaveFocus()
    await userEvent.keyboard("{Meta>}k{/Meta}")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await userEvent.keyboard("{Meta>}k{/Meta}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("ignores the shortcut when disabled and opens from a trigger", async () => {
    renderWithOnu(<CommandPalette groups={groups} shortcut={false} trigger={<Button>Search</Button>} />)
    await userEvent.keyboard("{Control>}k{/Control}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Search" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("filters static groups, including keywords and accents, and shows an empty state", async () => {
    renderWithOnu(<CommandPalette defaultOpen groups={groups} />)
    expect(screen.getByText("Pages")).toBeInTheDocument()
    expect(options()).toHaveLength(5)
    const input = screen.getByRole("combobox")
    await userEvent.type(input, "employ")
    expect(options()).toEqual(["Staff"])
    expect(screen.getByText("1 result")).toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, "male")
    expect(options()).toEqual(["Malé officeKaafu"])
    await userEvent.type(input, "zzz")
    expect(options()).toEqual([])
    expect(screen.getByText("No results for “malezzz”")).toBeInTheDocument()
  })

  it("selects with the keyboard, runs onSelect and closes", async () => {
    const onSelect = vi.fn()
    const onItemSelect = vi.fn()
    renderWithOnu(
      <CommandPalette
        defaultOpen
        groups={[
          {
            heading: "Actions",
            items: [
              { id: "a", label: "Alpha" },
              { id: "b", label: "Beta", onSelect },
            ],
          },
        ]}
        onItemSelect={onItemSelect}
      />,
    )
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("navigates href items through onNavigate, or location.assign", async () => {
    const onNavigate = vi.fn()
    const { unmount } = renderWithOnu(
      <CommandPalette
        defaultOpen
        groups={[{ items: [{ id: "p", label: "Permits", href: "/permits" }] }]}
        onNavigate={onNavigate}
      />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Permits" }))
    expect(onNavigate).toHaveBeenCalledWith("/permits")
    unmount()
    const assign = vi.fn()
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign })
    renderWithOnu(
      <CommandPalette
        defaultOpen
        recent={false}
        closeOnSelect={false}
        groups={[{ items: [{ id: "p", label: "Permits", href: "/permits" }] }]}
      />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Permits" }))
    expect(assign).toHaveBeenCalledWith("/permits")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("ignores disabled items", async () => {
    const onItemSelect = vi.fn()
    renderWithOnu(<CommandPalette defaultOpen groups={groups} onItemSelect={onItemSelect} />)
    const print = screen.getByRole("option", { name: "Print" })
    expect(print).toHaveAttribute("aria-disabled", "true")
    fireEvent.click(print)
    expect(onItemSelect).not.toHaveBeenCalled()
  })

  it("remembers recent items and shows them when the query is empty", async () => {
    const { unmount } = renderWithOnu(
      <CommandPalette defaultOpen groups={groups} recent={{ storageKey: "k", max: 2 }} />,
    )
    await userEvent.click(screen.getByRole("option", { name: "Staff" }))
    unmount()
    expect(JSON.parse(window.localStorage.getItem("k")!)).toEqual(["staff"])
    renderWithOnu(<CommandPalette defaultOpen groups={groups} recent={{ storageKey: "k", max: 2 }} />)
    const recent = screen.getByRole("group", { name: "Recent" })
    expect(within(recent).getByRole("option", { name: "Staff" })).toBeInTheDocument()
    await userEvent.type(screen.getByRole("combobox"), "d")
    expect(screen.queryByRole("group", { name: "Recent" })).not.toBeInTheDocument()
  })

  it("survives broken or blocked storage", async () => {
    window.localStorage.setItem("onu-command-palette-recent", "{not json")
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    renderWithOnu(<CommandPalette defaultOpen groups={groups} />)
    await userEvent.click(screen.getByRole("option", { name: "Dashboard" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("runs a debounced async search, aborts stale requests and ignores late answers (R16.5)", async () => {
    const calls: { query: string; signal: AbortSignal; resolve: (items: CommandPaletteItem[]) => void }[] = []
    const search = vi.fn(
      (query: string, { signal }: { signal: AbortSignal }) =>
        new Promise<CommandPaletteItem[]>((resolve) => calls.push({ query, signal, resolve })),
    )
    renderWithOnu(<CommandPalette defaultOpen search={search} searchHeading="Staff" debounce={100} />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "a" } })
    fireEvent.change(input, { target: { value: "ai" } })
    expect(screen.getAllByText("Searching…").length).toBeGreaterThan(0)
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1))
    // Typing within the debounce window only searched once, for the full query.
    expect(search).toHaveBeenCalledWith("ai", expect.objectContaining({ signal: expect.any(AbortSignal) }))
    fireEvent.change(input, { target: { value: "ais" } })
    expect(calls[0]!.signal.aborted).toBe(true)
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    await act(async () => calls[1]!.resolve([{ id: "s1", label: "Aishath Ali", description: "Hulhumalé" }]))
    expect(await screen.findByRole("group", { name: "Staff" })).toBeInTheDocument()
    expect(options()).toEqual(["Aishath AliHulhumalé"])
    expect(screen.getByText("1 result")).toBeInTheDocument()
    // The stale answer for "ai" arrives late and is ignored.
    await act(async () => calls[0]!.resolve([{ id: "x", label: "Stale" }]))
    expect(options()).toEqual(["Aishath AliHulhumalé"])
  })

  it("accepts grouped async results and keeps chosen async items in recent", async () => {
    const search = vi.fn(async () => [
      { id: "people", heading: "People", items: [{ id: "s2", label: "Mohamed Naseem" }] },
    ])
    const { unmount } = renderWithOnu(<CommandPalette defaultOpen search={search} debounce={0} />)
    await userEvent.type(screen.getByRole("combobox"), "mo")
    await userEvent.click(await screen.findByRole("option", { name: "Mohamed Naseem" }))
    unmount()
    expect(JSON.parse(window.localStorage.getItem("onu-command-palette-recent")!)).toEqual(["s2"])
  })

  it("respects minQueryLength", async () => {
    const search = vi.fn(async () => [])
    renderWithOnu(<CommandPalette defaultOpen search={search} debounce={0} minQueryLength={3} />)
    await userEvent.type(screen.getByRole("combobox"), "ab")
    await new Promise((r) => setTimeout(r, 20))
    expect(search).not.toHaveBeenCalled()
  })

  it("shows an error with a Retry button when the search fails", async () => {
    const search = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([{ id: "1", label: "Found" }])
    renderWithOnu(<CommandPalette defaultOpen search={search} debounce={0} />)
    await userEvent.type(screen.getByRole("combobox"), "x")
    expect(await screen.findByRole("button", { name: "Retry" })).toBeInTheDocument()
    expect(screen.getAllByText("Search failed").length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByRole("option", { name: "Found" })).toBeInTheDocument()
  })

  it("uses a custom empty message, placeholder and title, and can hide the footer", async () => {
    renderWithOnu(
      <CommandPalette
        defaultOpen
        groups={groups}
        title="Search Onu"
        placeholder="Find…"
        footer={false}
        emptyMessage={(q) => `Nothing for ${q}`}
        className="pal-x"
        classNames={{ input: "in-x", list: "list-x", item: "item-x", group: "group-x" }}
      />,
    )
    const dialog = screen.getByRole("dialog", { name: "Search Onu" })
    expect(dialog).toHaveClass("pal-x")
    expect(screen.getByPlaceholderText("Find…")).toHaveClass("in-x")
    expect(screen.queryByText("Navigate")).not.toBeInTheDocument()
    expect(screen.getAllByRole("option")[0]).toHaveClass("item-x")
    await userEvent.type(screen.getByRole("combobox"), "qq")
    expect(screen.getByText("Nothing for qq")).toBeInTheDocument()
  })

  it("types Thaana in the search box with thaana on", () => {
    renderWithOnu(<CommandPalette defaultOpen thaana groups={groups} />)
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("lang", "dv")
    expect(input).toHaveAttribute("dir", "rtl")
    expect(screen.getByRole("button", { name: /Thaana and Latin/ })).toBeInTheDocument()
  })

  it("closes from the phone close button", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(<CommandPalette defaultOpen groups={groups} onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it("is controlled with open / onOpenChange", async () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <CommandPalette open={open} onOpenChange={setOpen} groups={groups} />
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<CommandPalette defaultOpen groups={groups} />, { locale: "dv", dir })
    expect(screen.getByRole("dialog", { name: "ކޮމާންޑް ޕެލެޓް" })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("ކޮމާންޑެއް ލިޔުއްވާ ނުވަތަ ހޯއްދަވާ…")).toBeInTheDocument()
    await userEvent.type(screen.getByRole("combobox"), "މުވައްޒަފުން")
    expect(options()).toEqual(["Staff"])
    await expectNoA11yViolations()
  })
})

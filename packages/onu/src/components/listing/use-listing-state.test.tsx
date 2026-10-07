import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  applyListingState,
  cleanFilters,
  isFilterValueEmpty,
  listingStateToSearchParams,
  parseListingSearchParams,
  useListingState,
  type ListingState,
} from "./use-listing-state"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

function setUrl(path: string) {
  window.history.replaceState(null, "", path)
}

beforeEach(() => setUrl("/users"))
afterEach(() => setUrl("/"))

describe("useListingState", () => {
  it("starts with defaults and page 1", () => {
    const { result } = renderHook(() => useListingState({ url: false }))
    expect(result.current).toMatchObject({ search: "", sort: null, page: 1, perPage: 25, filters: {}, selection: [] })
    expect(result.current.isFiltered).toBe(false)
    expect(result.current.activeFilterCount).toBe(0)
  })

  it("sorts ascending first, flips on the same column, and starts ascending on another column (§25.6)", () => {
    const { result } = renderHook(() => useListingState({ url: false }))
    act(() => result.current.toggleSort("name"))
    expect(result.current.sort).toEqual({ id: "name", desc: false })
    act(() => result.current.toggleSort("name"))
    expect(result.current.sort).toEqual({ id: "name", desc: true })
    act(() => result.current.toggleSort("name"))
    expect(result.current.sort).toEqual({ id: "name", desc: false })
    act(() => result.current.toggleSort("name"))
    act(() => result.current.toggleSort("email"))
    expect(result.current.sort).toEqual({ id: "email", desc: false })
    act(() => result.current.setSort(null))
    expect(result.current.sort).toBeNull()
  })

  it("goes back to page 1 when rows-per-page, search, filters or sort change (§25.6)", () => {
    const { result } = renderHook(() => useListingState({ url: false }))
    const toPage3 = () => act(() => result.current.setPage(3))

    toPage3()
    expect(result.current.page).toBe(3)
    act(() => result.current.setPerPage(50))
    expect(result.current).toMatchObject({ page: 1, perPage: 50 })

    toPage3()
    act(() => result.current.setSearch("jane"))
    expect(result.current).toMatchObject({ page: 1, search: "jane", isFiltered: true })

    toPage3()
    act(() => result.current.setFilters({ status: ["active"] }))
    expect(result.current).toMatchObject({ page: 1, activeFilterCount: 1 })

    toPage3()
    act(() => result.current.toggleSort("name"))
    expect(result.current.page).toBe(1)
  })

  it("clears the selection when paging, searching, filtering or sorting (§25.6)", () => {
    const { result } = renderHook(() => useListingState({ url: false }))
    const select = () => act(() => result.current.setSelection(["1", "2"]))

    select()
    act(() => result.current.setPage(2))
    expect(result.current.selection).toEqual([])

    select()
    act(() => result.current.setSearch("ali"))
    expect(result.current.selection).toEqual([])

    select()
    act(() => result.current.setFilter("status", "active"))
    expect(result.current.selection).toEqual([])

    select()
    act(() => result.current.toggleSort("name"))
    expect(result.current.selection).toEqual([])

    select()
    act(() => result.current.setPerPage(10))
    expect(result.current.selection).toEqual([])
  })

  it("keeps the selection when nothing actually changes", () => {
    const { result } = renderHook(() => useListingState({ url: false, defaultState: { search: "x" } }))
    act(() => result.current.setSelection(["1"]))
    act(() => result.current.setSearch("x"))
    act(() => result.current.setFilters({}))
    act(() => result.current.setFilter("status", undefined))
    expect(result.current.selection).toEqual(["1"])
  })

  it("toggles, adds and removes selected ids", () => {
    const { result } = renderHook(() => useListingState({ url: false, defaultSelection: ["a"] }))
    act(() => result.current.toggleSelected("b"))
    expect(result.current.selection).toEqual(["a", "b"])
    act(() => result.current.toggleSelected("b", true))
    expect(result.current.selection).toEqual(["a", "b"])
    act(() => result.current.toggleSelected("a"))
    expect(result.current.selection).toEqual(["b"])
    act(() => result.current.clearSelection())
    expect(result.current.selection).toEqual([])
  })

  it("removes and clears filters and search", () => {
    const { result } = renderHook(() =>
      useListingState({ url: false, defaultState: { filters: { status: "active", role: ["admin"] } } }),
    )
    expect(result.current.activeFilterCount).toBe(2)
    act(() => result.current.removeFilter("status"))
    expect(result.current.filters).toEqual({ role: ["admin"] })
    act(() => result.current.clearFilters())
    expect(result.current.filters).toEqual({})
    act(() => result.current.setSearch("abc"))
    act(() => result.current.clearSearch())
    expect(result.current.search).toBe("")
  })

  it("sets view and column visibility, and resets", () => {
    const { result } = renderHook(() =>
      useListingState({ url: false, defaultColumnVisibility: { email: false }, defaultState: { view: "table" } }),
    )
    expect(result.current.columnVisibility).toEqual({ email: false })
    act(() => result.current.setColumnVisibility({ email: true }))
    act(() => result.current.setView("grid"))
    act(() => result.current.setPage(4))
    expect(result.current.view).toBe("grid")
    act(() => result.current.reset())
    expect(result.current).toMatchObject({ view: "table", page: 1 })
  })

  it("calls onChange after changes but not on mount", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useListingState({ url: false, onChange }))
    expect(onChange).not.toHaveBeenCalled()
    act(() => result.current.setPage(2))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
  })

  it("keeps search, filters, sort and page in the URL with replaceState (§25.6 browser behaviour)", () => {
    setUrl("/users?tab=1#/components/x")
    const push = vi.spyOn(window.history, "pushState")
    const replace = vi.spyOn(window.history, "replaceState")
    const { result } = renderHook(() => useListingState())
    act(() => result.current.setSearch("jane doe"))
    act(() => result.current.setFilters({ status: ["active", "banned"], created: { from: "2026-03-01" } }))
    act(() => result.current.toggleSort("name"))
    act(() => result.current.toggleSort("name"))
    act(() => result.current.setPage(2))

    const params = new URLSearchParams(window.location.search)
    expect(params.get("search")).toBe("jane doe")
    expect(params.getAll("filter[status][]")).toEqual(["active", "banned"])
    expect(params.get("filter[created][from]")).toBe("2026-03-01")
    expect(params.get("sort")).toBe("-name")
    expect(params.get("page")).toBe("2")
    expect(params.get("tab")).toBe("1")
    expect(window.location.hash).toBe("#/components/x")
    // Back leaves the page: nothing was pushed onto the history stack.
    expect(push).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalled()
    push.mockRestore()
    replace.mockRestore()
  })

  it("restores the view from the URL on reload (§25.6 browser behaviour)", () => {
    setUrl("/users?search=ali&sort=-created_at&page=3&per_page=50&view=grid&filter[status][]=active&filter[role]=admin")
    const { result } = renderHook(() => useListingState())
    expect(result.current).toMatchObject({
      search: "ali",
      sort: { id: "created_at", desc: true },
      page: 3,
      perPage: 50,
      view: "grid",
      filters: { status: ["active"], role: "admin" },
    })
  })

  it("supports a param prefix and custom names", () => {
    setUrl("/x?u_q=a")
    const { result } = renderHook(() => useListingState({ paramPrefix: "u_", paramNames: { search: "q" } }))
    expect(result.current.search).toBe("a")
    act(() => result.current.setPage(2))
    expect(new URLSearchParams(window.location.search).get("u_page")).toBe("2")
  })

  it("builds request params with toSearchParams", () => {
    const { result } = renderHook(() => useListingState({ url: false, defaultState: { perPage: 25 } }))
    act(() => result.current.setSearch("x"))
    const params = result.current.toSearchParams()
    expect(params.get("search")).toBe("x")
    expect(params.get("per_page")).toBe("25")
  })
})

describe("URL helpers", () => {
  it("round-trips state", () => {
    const state: Partial<ListingState> = {
      search: "s",
      sort: { id: "name", desc: false },
      page: 2,
      perPage: 10,
      view: "list",
      filters: { a: "1", b: ["x", "y"], c: { field: "updated_at", from: "2026-01-01", to: "2026-01-31" }, d: "" },
    }
    const params = listingStateToSearchParams(state)
    const parsed = parseListingSearchParams(params)
    expect(parsed).toEqual({ ...state, filters: { a: "1", b: ["x", "y"], c: state.filters?.c } })
  })

  it("ignores malformed values", () => {
    const parsed = parseListingSearchParams(
      new URLSearchParams("page=abc&per_page=-1&filter[x][bad]=1&filter=2&filter]["),
    )
    expect(parsed).toEqual({})
  })

  it("knows empty filter values", () => {
    expect(isFilterValueEmpty(undefined)).toBe(true)
    expect(isFilterValueEmpty(" ")).toBe(true)
    expect(isFilterValueEmpty([])).toBe(true)
    expect(isFilterValueEmpty({ field: "x" })).toBe(true)
    expect(isFilterValueEmpty({ to: "2026-01-01" })).toBe(false)
    expect(cleanFilters({ a: "", b: "1" })).toEqual({ b: "1" })
  })
})

describe("applyListingState", () => {
  const rows = [
    { id: "1", name: "Mariyam", island: "Malé", balance: 30, joined: new Date(2024, 1, 1) },
    { id: "2", name: "Ahmed", island: "Hulhumalé", balance: 10, joined: new Date(2023, 1, 1) },
    { id: "3", name: "ޢާއިޝާ", island: "Addu", balance: null, joined: new Date(2025, 1, 1) },
  ]
  const base: ListingState = { search: "", sort: null, page: 1, perPage: 2, filters: {} }

  it("searches every text field, case-insensitively", () => {
    expect(applyListingState(rows, { ...base, search: "HULHU" }).rows.map((r) => r.id)).toEqual(["2"])
    expect(applyListingState(rows, { ...base, search: "ޢާއި" }).total).toBe(1)
    expect(applyListingState(rows, { ...base, search: "x" }, { searchFields: (r) => [r.id] }).total).toBe(0)
  })

  it("filters with filter functions", () => {
    const result = applyListingState(
      rows,
      { ...base, filters: { island: ["Malé", "Addu"], unknown: "x" } },
      { filterFns: { island: (row, value) => (value as string[]).includes(row.island) } },
    )
    expect(result.total).toBe(2)
  })

  it("sorts text with a collator, numbers, dates and nulls last", () => {
    const byName = applyListingState(
      rows,
      { ...base, perPage: 10, sort: { id: "name", desc: false } },
      { locale: "en" },
    )
    expect(byName.rows.map((r) => r.id)).toEqual(["2", "1", "3"])
    const byBalance = applyListingState(rows, { ...base, perPage: 10, sort: { id: "balance", desc: true } })
    expect(byBalance.rows.map((r) => r.id)).toEqual(["3", "1", "2"])
    const byDate = applyListingState(rows, { ...base, perPage: 10, sort: { id: "joined", desc: false } })
    expect(byDate.rows.map((r) => r.id)).toEqual(["2", "1", "3"])
    const custom = applyListingState(
      rows,
      { ...base, perPage: 10, sort: { id: "x", desc: false } },
      { sortValue: (r) => r.id },
    )
    expect(custom.rows.map((r) => r.id)).toEqual(["1", "2", "3"])
    const withNulls = applyListingState([{ v: null }, { v: 1 }, { v: null }], {
      ...base,
      perPage: 10,
      sort: { id: "v", desc: false },
    })
    expect(withNulls.rows.map((r) => r.v)).toEqual([1, null, null])
  })

  it("pages", () => {
    const result = applyListingState(rows, { ...base, page: 2 })
    expect(result).toEqual({ rows: [rows[2]], total: 3 })
  })
})

"use client"

import * as React from "react"

import type { DateRangeValue, FilterValue, FilterValues, ListingSort } from "./listing-types"

/** Everything that decides which rows an index page shows (§25.6). */
export interface ListingState {
  search: string
  sort: ListingSort | null
  /** 1-based page number. */
  page: number
  perPage: number
  filters: FilterValues
  /** Current view of a view switcher (`table`, `list`, `grid`, `kanban`, …). */
  view?: string
}

export interface ListingParamNames {
  search: string
  sort: string
  page: string
  perPage: string
  filter: string
  view: string
}

/** Laravel / spatie-query-builder style names: `search`, `sort=-name`, `page`, `per_page`, `filter[status]`. */
export const DEFAULT_PARAM_NAMES: ListingParamNames = {
  search: "search",
  sort: "sort",
  page: "page",
  perPage: "per_page",
  filter: "filter",
  view: "view",
}

export const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export interface UseListingStateOptions {
  /** Starting state. Values in the URL win when `url` is on. */
  defaultState?: Partial<ListingState>
  /**
   * Keep search, filters, sort, page and view in the address bar with
   * `history.replaceState`, so reloading or sharing the link shows the same view
   * and Back leaves the page (§25.6). Default `true`.
   */
  url?: boolean
  /** Prefix for every URL parameter, for pages with more than one listing. */
  paramPrefix?: string
  paramNames?: Partial<ListingParamNames>
  /** Called after every change, e.g. to fetch the page from an API. */
  onChange?: (state: ListingState) => void
  /** Initial selection (row ids). Selection is never put in the URL. */
  defaultSelection?: string[]
  /** Initial column visibility (`{ email: false }` hides a column). */
  defaultColumnVisibility?: Record<string, boolean>
}

/** State plus the actions that keep §25.6's rules (reset page, clear selection, …). */
export interface ListingController extends ListingState {
  selection: string[]
  columnVisibility: Record<string, boolean>
  /** Number of applied filters (for the Filters button badge). */
  activeFilterCount: number
  /** True when a search or filter is applied. */
  isFiltered: boolean
  setSearch: (search: string) => void
  /** Sort by a column. The same column flips the direction; a new column starts ascending. */
  toggleSort: (id: string) => void
  setSort: (sort: ListingSort | null) => void
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  /** Replace all filters (the filters panel's Apply). */
  setFilters: (filters: FilterValues) => void
  setFilter: (key: string, value: FilterValue | undefined) => void
  removeFilter: (key: string) => void
  clearFilters: () => void
  clearSearch: () => void
  setView: (view: string) => void
  setSelection: (ids: string[]) => void
  toggleSelected: (id: string, selected?: boolean) => void
  clearSelection: () => void
  setColumnVisibility: (visibility: Record<string, boolean>) => void
  /** Back to the default state. */
  reset: () => void
  /** The state as URL search params, ready for an API request. */
  toSearchParams: () => URLSearchParams
}

/** True when a filter value counts as "applied". */
export function isFilterValueEmpty(value: FilterValue | undefined | null): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  return !value.from && !value.to
}

/** Drops empty values so `{}` means "no filters". */
export function cleanFilters(filters: FilterValues): FilterValues {
  const out: FilterValues = {}
  for (const [key, value] of Object.entries(filters)) {
    if (!isFilterValueEmpty(value)) out[key] = value
  }
  return out
}

function names(prefix = "", overrides?: Partial<ListingParamNames>): ListingParamNames {
  const merged = { ...DEFAULT_PARAM_NAMES, ...overrides }
  return Object.fromEntries(
    Object.entries(merged).map(([k, v]) => [k, `${prefix}${v}`]),
  ) as unknown as ListingParamNames
}

/** Writes listing state into URL params (`sort=-created_at`, `filter[status][]=active`, …). */
export function listingStateToSearchParams(
  state: Partial<ListingState>,
  options: { paramPrefix?: string; paramNames?: Partial<ListingParamNames>; defaults?: Partial<ListingState> } = {},
  params = new URLSearchParams(),
): URLSearchParams {
  const n = names(options.paramPrefix, options.paramNames)
  const defaults = options.defaults ?? {}
  if (state.search) params.set(n.search, state.search)
  if (state.sort) params.set(n.sort, `${state.sort.desc ? "-" : ""}${state.sort.id}`)
  if (state.page && state.page !== 1) params.set(n.page, String(state.page))
  if (state.perPage && state.perPage !== defaults.perPage) params.set(n.perPage, String(state.perPage))
  if (state.view && state.view !== defaults.view) params.set(n.view, state.view)
  for (const [key, value] of Object.entries(cleanFilters(state.filters ?? {}))) {
    const base = `${n.filter}[${key}]`
    if (typeof value === "string") params.set(base, value)
    else if (Array.isArray(value)) for (const v of value) params.append(`${base}[]`, v)
    else if (value) {
      for (const part of ["field", "from", "to"] as const) {
        if (value[part]) params.set(`${base}[${part}]`, value[part])
      }
    }
  }
  return params
}

/** Reads listing state from URL params. Missing values stay `undefined`. */
export function parseListingSearchParams(
  params: URLSearchParams,
  options: { paramPrefix?: string; paramNames?: Partial<ListingParamNames> } = {},
): Partial<ListingState> {
  const n = names(options.paramPrefix, options.paramNames)
  const out: Partial<ListingState> = {}
  const search = params.get(n.search)
  if (search !== null) out.search = search
  const sort = params.get(n.sort)
  if (sort) out.sort = sort.startsWith("-") ? { id: sort.slice(1), desc: true } : { id: sort, desc: false }
  const page = Number(params.get(n.page))
  if (Number.isInteger(page) && page > 0) out.page = page
  const perPage = Number(params.get(n.perPage))
  if (Number.isInteger(perPage) && perPage > 0) out.perPage = perPage
  const view = params.get(n.view)
  if (view) out.view = view

  const filters: FilterValues = {}
  const prefix = `${n.filter}[`
  for (const [rawKey, value] of params.entries()) {
    if (!rawKey.startsWith(prefix)) continue
    const match = /^\[([^\]]+)\](?:\[([^\]]*)\])?$/.exec(rawKey.slice(n.filter.length))
    if (!match) continue
    const key = match[1] as string
    const sub = match[2]
    if (sub === undefined) filters[key] = value
    else if (sub === "") {
      const list = filters[key]
      filters[key] = Array.isArray(list) ? [...list, value] : [value]
    } else if (sub === "field" || sub === "from" || sub === "to") {
      const range = (
        filters[key] && typeof filters[key] === "object" && !Array.isArray(filters[key]) ? filters[key] : {}
      ) as DateRangeValue
      filters[key] = { ...range, [sub]: value }
    }
  }
  if (Object.keys(filters).length) out.filters = filters
  return out
}

const BASE_STATE: ListingState = { search: "", sort: null, page: 1, perPage: 25, filters: {} }

function readUrl(enabled: boolean, opts: { paramPrefix?: string; paramNames?: Partial<ListingParamNames> }) {
  if (!enabled || typeof window === "undefined") return {}
  return parseListingSearchParams(new URLSearchParams(window.location.search), opts)
}

function writeUrl(
  state: ListingState,
  defaults: ListingState,
  opts: { paramPrefix?: string; paramNames?: Partial<ListingParamNames> },
) {
  const url = new URL(window.location.href)
  const n = names(opts.paramPrefix, opts.paramNames)
  const ours = Object.values(n)
  for (const key of [...url.searchParams.keys()]) {
    if (ours.includes(key) || key.startsWith(`${n.filter}[`)) url.searchParams.delete(key)
  }
  listingStateToSearchParams(state, { ...opts, defaults }, url.searchParams)
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  // replaceState, not pushState: Back leaves the page instead of undoing each change (§25.6).
  if (next !== current) window.history.replaceState(window.history.state, "", next)
}

function sameFilters(a: FilterValues, b: FilterValues) {
  return JSON.stringify(cleanFilters(a)) === JSON.stringify(cleanFilters(b))
}

/**
 * Search, sort, page, rows-per-page, filters, view and selection for an index
 * page, with the rules from REQUIREMENTS §25.6 built in:
 * searching, filtering, sorting and changing rows-per-page go back to page 1;
 * paging, searching, filtering and sorting clear the selection;
 * the state is mirrored to the URL with `history.replaceState`.
 */
export function useListingState(options: UseListingStateOptions = {}): ListingController {
  const { url = true, paramPrefix, paramNames, onChange, defaultSelection, defaultColumnVisibility } = options
  const urlOptions = React.useMemo(() => ({ paramPrefix, paramNames }), [paramPrefix, paramNames])

  const defaults = React.useMemo<ListingState>(
    () => ({ ...BASE_STATE, ...options.defaultState, filters: cleanFilters(options.defaultState?.filters ?? {}) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaults are read once
    [],
  )

  const [full, setFull] = React.useState<ListingState & { selection: string[] }>(() => {
    const fromUrl = readUrl(url, urlOptions)
    return {
      ...defaults,
      ...fromUrl,
      filters: cleanFilters(fromUrl.filters ?? defaults.filters),
      selection: defaultSelection ?? [],
    }
  })
  const { selection, ...state } = full
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(defaultColumnVisibility ?? {})

  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })
  const first = React.useRef(true)
  const { search, sort, page, perPage, filters, view } = full
  const stateForEffects = React.useMemo<ListingState>(
    () => ({ search, sort, page, perPage, filters, view }),
    [search, sort, page, perPage, filters, view],
  )

  React.useEffect(() => {
    if (url) writeUrl(stateForEffects, defaults, urlOptions)
    if (first.current) {
      first.current = false
      return
    }
    onChangeRef.current?.(stateForEffects)
  }, [stateForEffects, url, defaults, urlOptions])

  /**
   * Applies a change. Returning the previous object means "nothing changed".
   * A real change clears the selection; `resetPage` also goes back to page 1.
   */
  const change = React.useCallback((fn: (prev: ListingState) => Partial<ListingState> | null, resetPage: boolean) => {
    setFull((prev) => {
      const patch = fn(prev)
      if (!patch) return prev
      return { ...prev, ...patch, page: resetPage ? 1 : (patch.page ?? prev.page), selection: [] }
    })
  }, [])

  const setSearch = React.useCallback(
    (value: string) => change((prev) => (prev.search === value ? null : { search: value }), true),
    [change],
  )
  const setSort = React.useCallback((value: ListingSort | null) => change(() => ({ sort: value }), true), [change])
  const toggleSort = React.useCallback(
    (id: string) =>
      change((prev) => ({ sort: prev.sort?.id === id ? { id, desc: !prev.sort.desc } : { id, desc: false } }), true),
    [change],
  )
  const setPage = React.useCallback(
    (value: number) => change(() => ({ page: Math.max(1, Math.floor(value)) }), false),
    [change],
  )
  const setPerPage = React.useCallback((value: number) => change(() => ({ perPage: value }), true), [change])
  const setFilters = React.useCallback(
    (value: FilterValues) =>
      change((prev) => {
        const next = cleanFilters(value)
        return sameFilters(prev.filters, next) ? null : { filters: next }
      }, true),
    [change],
  )
  const setFilter = React.useCallback(
    (key: string, value: FilterValue | undefined) =>
      change((prev) => {
        const next = cleanFilters({ ...prev.filters, [key]: value })
        return sameFilters(prev.filters, next) ? null : { filters: next }
      }, true),
    [change],
  )

  const removeFilter = React.useCallback((key: string) => setFilter(key, undefined), [setFilter])
  const clearFilters = React.useCallback(() => setFilters({}), [setFilters])
  const clearSearch = React.useCallback(() => setSearch(""), [setSearch])
  const setView = React.useCallback((value: string) => setFull((prev) => ({ ...prev, view: value })), [])

  const setSelection = React.useCallback((ids: string[]) => setFull((prev) => ({ ...prev, selection: ids })), [])
  const toggleSelected = React.useCallback((id: string, selected?: boolean) => {
    setFull((prev) => {
      const on = selected ?? !prev.selection.includes(id)
      if (on === prev.selection.includes(id)) return prev
      return { ...prev, selection: on ? [...prev.selection, id] : prev.selection.filter((x) => x !== id) }
    })
  }, [])
  const clearSelection = React.useCallback(() => setFull((prev) => ({ ...prev, selection: [] })), [])

  const reset = React.useCallback(() => setFull({ ...defaults, selection: [] }), [defaults])

  const activeFilterCount = Object.keys(state.filters).length

  const toSearchParams = React.useCallback(
    () => listingStateToSearchParams(stateForEffects, { ...urlOptions, defaults: { perPage: -1 } }),
    [stateForEffects, urlOptions],
  )

  return {
    ...state,
    selection,
    columnVisibility,
    activeFilterCount,
    isFiltered: activeFilterCount > 0 || state.search !== "",
    setSearch,
    toggleSort,
    setSort,
    setPage,
    setPerPage,
    setFilters,
    setFilter,
    removeFilter,
    clearFilters,
    clearSearch,
    setView,
    setSelection,
    toggleSelected,
    clearSelection,
    setColumnVisibility,
    reset,
    toSearchParams,
  }
}

export interface ApplyListingOptions<T> {
  /** Values searched by the search box. Defaults to every string/number property. */
  searchFields?: (row: T) => unknown[]
  /** How each filter matches a row. Filters without a function are ignored. */
  filterFns?: Record<string, (row: T, value: FilterValue) => boolean>
  /** Sort value for a column id. Defaults to `row[id]`. */
  sortValue?: (row: T, id: string) => unknown
  /** Locale for comparing text (Thaana aware, R12.8). */
  locale?: string
}

/**
 * Applies search, filters, sort and paging to an in-memory array, for
 * listings without a server. Text compares with `Intl.Collator` (R12.8).
 */
export function applyListingState<T>(rows: readonly T[], state: ListingState, options: ApplyListingOptions<T> = {}) {
  const collator = new Intl.Collator(options.locale, { numeric: true, sensitivity: "base" })
  const query = state.search.trim().toLocaleLowerCase(options.locale)
  const fields =
    options.searchFields ??
    ((row: T) =>
      Object.values(row as Record<string, unknown>).filter((v) => typeof v === "string" || typeof v === "number"))

  let out = rows.filter((row) => {
    if (
      query &&
      !fields(row).some((v) =>
        String(v ?? "")
          .toLocaleLowerCase(options.locale)
          .includes(query),
      )
    )
      return false
    for (const [key, value] of Object.entries(state.filters)) {
      const fn = options.filterFns?.[key]
      if (fn && value !== undefined && !fn(row, value)) return false
    }
    return true
  })

  if (state.sort) {
    const { id, desc } = state.sort
    const get = options.sortValue ?? ((row: T, key: string) => (row as Record<string, unknown>)[key])
    out = [...out].sort((a, b) => {
      const va = get(a, id)
      const vb = get(b, id)
      let cmp: number
      if (va == null || vb == null) cmp = va == null ? (vb == null ? 0 : 1) : -1
      else if (typeof va === "number" && typeof vb === "number") cmp = va - vb
      else if (va instanceof Date && vb instanceof Date) cmp = va.getTime() - vb.getTime()
      else cmp = collator.compare(String(va), String(vb))
      return desc ? -cmp : cmp
    })
  }

  const total = out.length
  const start = (state.page - 1) * state.perPage
  return { rows: out.slice(start, start + state.perPage), total }
}

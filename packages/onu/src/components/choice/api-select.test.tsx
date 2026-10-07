import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import {
  buildUrl,
  detectHasMore,
  getOnuQueryClient,
  invalidateApiOptions,
  parseApiItem,
  parseApiResponse,
  valueUrlFor,
} from "./api-options"
import { ApiSelect } from "./api-select"

const newClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const islands = [
  { id: 1, name: "Malé", atoll: "Kaafu" },
  { id: 2, name: "Hulhumalé", atoll: "Kaafu" },
  { id: 3, name: "Addu City", atoll: "Seenu" },
  { id: 4, name: "Fuvahmulah", atoll: "Gnaviyani" },
]

/** A Laravel paginator response for page `page` (2 per page). */
function paginator(items: typeof islands, page: number, perPage = 2) {
  const last = Math.max(1, Math.ceil(items.length / perPage))
  return {
    data: items.slice((page - 1) * perPage, page * perPage),
    links: { next: page < last ? `/api/islands?page=${page + 1}` : null },
    meta: { current_page: page, last_page: last, per_page: perPage, total: items.length },
  }
}

function mockFetch(handler: (url: URL, init: RequestInit) => unknown, status = 200) {
  const fn = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input), "http://localhost")
    const body = handler(url, init)
    return new Response(JSON.stringify(body), { status, statusText: status === 200 ? "OK" : "Server Error" })
  })
  vi.stubGlobal("fetch", fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function open(name = "Island") {
  await userEvent.click(screen.getByRole("combobox", { name }))
}

describe("ApiSelect", () => {
  it("loads a Laravel paginator from a URL on open, with no config", async () => {
    const fetchMock = mockFetch((url) => paginator(islands, Number(url.searchParams.get("page"))))
    renderWithOnu(<ApiSelect aria-label="Island" url="/api/islands" queryClient={newClient()} debounce={0} />)
    expect(fetchMock).not.toHaveBeenCalled()
    await open()
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
    const [input, init] = fetchMock.mock.calls[0]!
    expect(String(input)).toBe("/api/islands?page=1")
    expect(new Headers(init?.headers).get("Accept")).toBe("application/json")
    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("pages in more options as the list scrolls (infinite scroll)", async () => {
    const fetchMock = mockFetch((url) => paginator(islands, Number(url.searchParams.get("page"))))
    renderWithOnu(
      <ApiSelect aria-label="Island" url="/api/islands" perPage={2} queryClient={newClient()} debounce={0} />,
    )
    await open()
    await screen.findByRole("option", { name: "Malé" })
    const list = screen.getByRole("listbox")
    Object.defineProperties(list, {
      scrollHeight: { value: 200, configurable: true },
      clientHeight: { value: 100, configurable: true },
      scrollTop: { value: 100, configurable: true },
    })
    fireEvent.scroll(list)
    expect(await screen.findByRole("option", { name: "Addu City" })).toBeInTheDocument()
    expect(String(fetchMock.mock.calls[1]![0])).toBe("/api/islands?page=2&per_page=2")
    expect(screen.getAllByRole("option")).toHaveLength(4)
    fireEvent.scroll(list)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("debounces searches and sends the search param", async () => {
    const fetchMock = mockFetch((url) => ({
      data: islands.filter((i) => i.name.toLowerCase().includes((url.searchParams.get("search") ?? "").toLowerCase())),
    }))
    renderWithOnu(<ApiSelect aria-label="Island" url="/api/islands" queryClient={newClient()} />)
    await open()
    await screen.findByRole("option", { name: "Malé" })
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "add")
    expect(await screen.findByRole("option", { name: "Addu City" })).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
    const searches = fetchMock.mock.calls.map((c) => new URL(String(c[0]), "http://x").searchParams.get("search"))
    expect(searches).toEqual([null, "add"])
    expect(await screen.findByText("1 result")).toBeInTheDocument()
  })

  it("cancels stale requests so an old response never overwrites a newer one", async () => {
    const signals: Record<string, AbortSignal> = {}
    let resolveSlow: (v: unknown) => void = () => {}
    const fetcher = vi.fn((query: string, { signal }: { signal: AbortSignal }) => {
      signals[query] = signal
      if (query === "a") return new Promise((resolve) => (resolveSlow = resolve))
      return Promise.resolve([{ id: query, name: `Result ${query || "all"}` }])
    })
    renderWithOnu(<ApiSelect aria-label="Island" fetcher={fetcher} queryClient={newClient()} debounce={0} />)
    await open()
    await screen.findByRole("option", { name: "Result all" })
    const search = screen.getByRole("combobox", { name: "Search…" })
    await userEvent.type(search, "a")
    await waitFor(() => expect(signals.a).toBeDefined())
    await userEvent.type(search, "b")
    expect(await screen.findByRole("option", { name: "Result ab" })).toBeInTheDocument()
    await waitFor(() => expect(signals.a!.aborted).toBe(true))
    resolveSlow([{ id: "old", name: "Old result" }])
    await new Promise((r) => setTimeout(r, 20))
    expect(screen.queryByRole("option", { name: "Old result" })).not.toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Result ab" })).toBeInTheDocument()
  })

  it("maps any response shape: itemsPath + keys, POST, headers, params and param names", async () => {
    const fetchMock = mockFetch(() => ({ results: { items: [{ code: "K", title: { en: "Kaafu" } }] } }))
    renderWithOnu(
      <ApiSelect
        aria-label="Atoll"
        url="https://api.example.mv/atolls"
        method="POST"
        headers={{ "X-Token": "abc" }}
        credentials="include"
        params={(q) => ({ country: "MV", q_length: q.length })}
        searchParam="q"
        pageParam="p"
        perPageParam="limit"
        perPage={20}
        itemsPath="results.items"
        valueKey="code"
        labelKey="title.en"
        queryClient={newClient()}
        debounce={0}
      />,
    )
    await open("Atoll")
    expect(await screen.findByRole("option", { name: "Kaafu" })).toBeInTheDocument()
    const [input, init] = fetchMock.mock.calls[0]!
    expect(String(input)).toBe("https://api.example.mv/atolls")
    expect(init?.method).toBe("POST")
    expect(init?.credentials).toBe("include")
    expect(new Headers(init?.headers).get("X-Token")).toBe("abc")
    expect(JSON.parse(String(init?.body))).toEqual({ country: "MV", q_length: 0, p: 1, limit: 20 })
  })

  it("maps with mapOption", async () => {
    mockFetch(() => [{ uuid: "u1", first: "Aishath", last: "Shifa" }])
    renderWithOnu(
      <ApiSelect<{ uuid: string; first: string; last: string }>
        aria-label="Person"
        url="/api/people"
        mapOption={(p) => ({ value: p.uuid, label: `${p.first} ${p.last}` })}
        queryClient={newClient()}
        debounce={0}
      />,
    )
    await open("Person")
    expect(await screen.findByRole("option", { name: "Aishath Shifa" })).toBeInTheDocument()
  })

  it("waits for minChars and shows a hint", async () => {
    const fetchMock = mockFetch(() => ({ data: islands }))
    renderWithOnu(
      <ApiSelect aria-label="Island" url="/api/islands" minChars={2} queryClient={newClient()} debounce={0} />,
    )
    await open()
    expect(screen.getAllByText("Type at least 2 characters to search").length).toBeGreaterThan(0)
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "m")
    expect(fetchMock).not.toHaveBeenCalled()
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "a")
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
  })

  it("shows and announces errors with a Retry button", async () => {
    let fail = true
    const fetchMock = vi.fn(async () =>
      fail ? new Response("{}", { status: 500 }) : new Response(JSON.stringify({ data: islands })),
    )
    vi.stubGlobal("fetch", fetchMock)
    renderWithOnu(<ApiSelect aria-label="Island" url="/api/fails" queryClient={newClient()} debounce={0} />)
    await open()
    const retry = await screen.findByRole("button", { name: "Retry" })
    expect(screen.getByRole("status")).toHaveTextContent("Couldn’t load the options")
    fail = false
    await userEvent.click(retry)
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
  })

  it("shows loading and empty states", async () => {
    let resolve: (v: unknown) => void = () => {}
    const fetcher = vi.fn(() => new Promise((r) => (resolve = r)))
    renderWithOnu(<ApiSelect aria-label="Island" fetcher={fetcher} queryClient={newClient()} debounce={0} />)
    await open()
    expect(screen.getByRole("status")).toHaveTextContent("Loading…")
    resolve({ data: [] })
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("No options"))
  })

  it("labels an existing value from initialOptions without fetching", () => {
    const fetchMock = mockFetch(() => ({ data: [] }))
    renderWithOnu(
      <ApiSelect
        aria-label="Island"
        url="/api/islands"
        defaultValue="7"
        initialOptions={[{ value: "7", label: "Thinadhoo" }]}
        queryClient={newClient()}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Thinadhoo")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("labels an existing value from valueUrl", async () => {
    const fetchMock = mockFetch((url) => ({ data: { id: 3, name: `Island ${url.pathname.split("/").pop()}` } }))
    renderWithOnu(
      <ApiSelect
        aria-label="Island"
        url="/api/islands"
        valueUrl="/api/islands/{value}"
        defaultValue="3"
        queryClient={newClient()}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Loading…")
    expect(await screen.findByText("Island 3")).toBeInTheDocument()
    expect(String(fetchMock.mock.calls[0]![0])).toBe("/api/islands/3")
  })

  it("labels several values with fetchById (multi)", async () => {
    const fetchById = vi.fn(async (v: string) => ({ value: v, label: `Atoll ${v}` }))
    renderWithOnu(
      <ApiSelect
        aria-label="Atolls"
        url="/api/atolls"
        multiple
        defaultValue={["A", "B"]}
        fetchById={fetchById}
        queryClient={newClient()}
      />,
    )
    expect(await screen.findByText("Atoll A")).toBeInTheDocument()
    expect(screen.getByText("Atoll B")).toBeInTheDocument()
  })

  it("supports multiple values and selecting from results", async () => {
    mockFetch(() => ({ data: islands }))
    const onValueChange = vi.fn()
    renderWithOnu(
      <ApiSelect
        aria-label="Islands"
        url="/api/islands-multi"
        multiple
        onValueChange={onValueChange}
        queryClient={newClient()}
        debounce={0}
        selectAll
      />,
    )
    await open("Islands")
    await userEvent.click(await screen.findByRole("option", { name: "Malé" }))
    await userEvent.click(screen.getByRole("option", { name: "Addu City" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["1", "3"], expect.any(Array))
    await userEvent.click(screen.getByRole("option", { name: "Select all" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["1", "2", "3", "4"], expect.any(Array))
  })

  it("clears and refetches when a dependent param changes", async () => {
    const fetchMock = mockFetch((url) => ({
      data: islands.filter((i) => i.atoll === url.searchParams.get("atoll")),
    }))
    const onValueChange = vi.fn()
    function Dependent() {
      const [atoll, setAtoll] = React.useState("Kaafu")
      return (
        <>
          <button type="button" onClick={() => setAtoll("Seenu")}>
            Change atoll
          </button>
          <ApiSelect
            aria-label="Island"
            url="/api/islands-by-atoll"
            params={{ atoll }}
            dependsOn={atoll}
            defaultValue="1"
            initialOptions={[{ value: "1", label: "Malé" }]}
            onValueChange={onValueChange}
            queryClient={newClient()}
            debounce={0}
          />
        </>
      )
    }
    renderWithOnu(<Dependent />)
    expect(screen.getByRole("combobox")).toHaveTextContent("Malé")
    await userEvent.click(screen.getByRole("button", { name: "Change atoll" }))
    expect(onValueChange).toHaveBeenCalledWith(null, null)
    expect(screen.getByRole("combobox")).toHaveTextContent("Select an option")
    await open()
    expect(await screen.findByRole("option", { name: "Addu City" })).toBeInTheDocument()
    expect(new URL(String(fetchMock.mock.lastCall![0]), "http://x").searchParams.get("atoll")).toBe("Seenu")
  })

  it("preloads without opening and caches between instances", async () => {
    const fetchMock = mockFetch(() => ({ data: islands }))
    const client = newClient()
    const { rerender } = renderWithOnu(
      <ApiSelect aria-label="Island" url="/api/preload" preload queryClient={client} />,
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    rerender(<ApiSelect aria-label="Island" url="/api/preload" queryClient={client} />)
    await open()
    expect(screen.getByRole("option", { name: "Malé" })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("works without a QueryClientProvider (fallback client) and with one", async () => {
    mockFetch(() => ({ data: islands }))
    const { unmount } = renderWithOnu(<ApiSelect aria-label="Island" url="/api/fallback" debounce={0} />)
    await open()
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
    expect(getOnuQueryClient().getQueryCache().getAll().length).toBeGreaterThan(0)
    await invalidateApiOptions("/api/fallback")
    unmount()

    const appClient = newClient()
    renderWithOnu(
      <QueryClientProvider client={appClient}>
        <ApiSelect aria-label="Island" url="/api/provider" debounce={0} />
      </QueryClientProvider>,
    )
    await open()
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
    expect(appClient.getQueryCache().getAll().length).toBe(1)
  })

  it("quick-creates and invalidates the cache", async () => {
    const fetchMock = mockFetch(() => ({ data: islands }))
    const onCreated = vi.fn()
    renderWithOnu(
      <ApiSelect
        aria-label="Island"
        url="/api/create"
        queryClient={newClient()}
        debounce={0}
        onCreate={(label) => ({ value: "99", label })}
        onCreated={onCreated}
      />,
    )
    await open()
    await userEvent.type(screen.getByRole("combobox", { name: "Search…" }), "Kudahuvadhoo")
    await userEvent.click(await screen.findByRole("option", { name: "Create “Kudahuvadhoo”" }))
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Island" })).toHaveTextContent("Kudahuvadhoo"))
    expect(onCreated).toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalled()
  })

  it("is wired to a FormField and submits its name", async () => {
    mockFetch(() => ({ data: islands }))
    renderWithOnu(
      <FormField label="Island" name="island_id" required>
        <ApiSelect url="/api/form" defaultValue="2" initialOptions={[{ value: "2", label: "Hulhumalé" }]} />
      </FormField>,
    )
    expect(screen.getByRole("combobox", { name: /Island/ })).toHaveAttribute("aria-required", "true")
    expect(document.querySelector("input[name=island_id]")).toHaveValue("2")
  })

  it.each(directions)("passes axe in %s with Dhivehi strings", async (dir) => {
    mockFetch(() => ({ data: [{ id: 1, name: "މާލެ" }] }))
    renderWithOnu(<ApiSelect aria-label="ރަށް" url={`/api/dv-${dir}`} queryClient={newClient()} debounce={0} />, {
      locale: "dv",
      dir,
    })
    await open("ރަށް")
    expect(await screen.findByRole("option", { name: "މާލެ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("api-options helpers", () => {
  it("detects Laravel pagination shapes", () => {
    expect(detectHasMore({ data: [], meta: { current_page: 1, last_page: 3 } })).toBe(true)
    expect(detectHasMore({ data: [], meta: { current_page: 3, last_page: 3 } })).toBe(false)
    expect(detectHasMore({ data: [], current_page: 1, last_page: 2 })).toBe(true)
    expect(detectHasMore({ data: [], next_page_url: "/x?page=2" })).toBe(true)
    expect(detectHasMore({ data: [], next_page_url: null })).toBe(false)
    expect(detectHasMore({ data: [], next_cursor: "abc" })).toBe(true)
    expect(detectHasMore({ data: [], links: { next: "/x" } })).toBe(true)
    expect(detectHasMore({ data: { data: [], current_page: 1, last_page: 1 } })).toBe(false)
    expect(detectHasMore([])).toBe(false)
  })

  it("finds items in common shapes", () => {
    expect(parseApiResponse(["a", "b"]).options).toEqual([
      { value: "a", label: "a" },
      { value: "b", label: "b" },
    ])
    expect(parseApiResponse({ items: [{ value: "x", label: "X" }] }).options[0]).toMatchObject({
      value: "x",
      label: "X",
    })
    expect(parseApiResponse({ results: [{ key: 1, title: "T" }] }).options[0]).toMatchObject({ value: "1", label: "T" })
    expect(parseApiResponse({ data: { data: [{ id: 1, name: "N" }] } }).options[0]).toMatchObject({ value: "1" })
    expect(parseApiResponse({ nothing: true }).options).toEqual([])
    expect(parseApiResponse("oops").options).toEqual([])
    expect(parseApiResponse({ x: 1 }, { itemsPath: "missing" }).options).toEqual([])
    expect(
      parseApiResponse({ data: [{ id: 1, name: "N", atoll: "K" }] }, { descriptionKey: "atoll" }).options[0],
    ).toMatchObject({ description: "K" })
  })

  it("builds URLs and value URLs", () => {
    expect(buildUrl("/x?a=1#top", { b: 2, c: ["p", "q"], d: null, e: "" })).toBe("/x?a=1&b=2&c%5B%5D=p&c%5B%5D=q#top")
    expect(buildUrl("/x", {})).toBe("/x")
    expect(valueUrlFor("/api/islands/{value}", "a b")).toBe("/api/islands/a%20b")
    expect(valueUrlFor("/api/islands/", "5")).toBe("/api/islands/5")
    expect(valueUrlFor((v) => `/v/${v}`, "5")).toBe("/v/5")
  })

  it("parses single items", () => {
    expect(parseApiItem({ data: { id: 5, name: "Five" } })).toMatchObject({ value: "5", label: "Five" })
    expect(parseApiItem({ value: "5", label: "Five" })).toEqual({ value: "5", label: "Five" })
    expect(parseApiItem(null)).toBeUndefined()
  })

  it("needs a url or fetcher", async () => {
    const { fetchApiOptions } = await import("./api-options")
    await expect(fetchApiOptions({}, "", 1, new AbortController().signal)).rejects.toThrow(/url/)
  })
})

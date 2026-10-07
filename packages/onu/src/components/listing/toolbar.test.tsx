import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Deferred } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ColumnVisibility } from "./column-visibility"
import { ExportMenu } from "./export-menu"
import { FilterSubmit } from "./filter-submit"
import { FilterTabs } from "./filter-tabs"
import { LoadMore } from "./load-more"
import { Highlight, SearchResults } from "./search-results"
import { ViewSwitcher } from "./view-switcher"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

describe("ViewSwitcher", () => {
  it("switches views with buttons and arrow keys", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<ViewSwitcher onValueChange={onValueChange} />)
    const group = screen.getByRole("radiogroup", { name: "View" })
    const table = within(group).getByRole("radio", { name: "Table" })
    expect(table).toBeChecked()
    await userEvent.click(within(group).getByRole("radio", { name: "Grid" }))
    expect(onValueChange).toHaveBeenCalledWith("grid")
    expect(within(group).getByRole("radio", { name: "Grid" })).toBeChecked()
    // Clicking the active view keeps it on.
    await userEvent.click(within(group).getByRole("radio", { name: "Grid" }))
    expect(within(group).getByRole("radio", { name: "Grid" })).toBeChecked()
    await userEvent.keyboard("{ArrowRight}")
    expect(within(group).getByRole("radio", { name: "Board" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("supports custom views, labels and controlled value", () => {
    renderWithOnu(
      <ViewSwitcher
        value="map"
        showLabels
        views={["list", { value: "map", label: "Map", icon: "map-pin" }, "custom"]}
      />,
    )
    expect(screen.getByRole("radio", { name: "Map" })).toBeChecked()
    expect(screen.getByText("List")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "custom" })).toBeInTheDocument()
  })

  it.each(directions)("follows visual order in %s", async (dir) => {
    renderWithOnu(<ViewSwitcher />, { dir, locale: "dv" })
    const first = screen.getByRole("radio", { name: "ޓޭބަލް" })
    first.focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "ލިސްޓު" })).toHaveFocus()
  })
})

describe("ColumnVisibility", () => {
  it("toggles hideable columns and keeps the menu open", async () => {
    function Harness() {
      const [value, setValue] = React.useState<Record<string, boolean>>({ email: false })
      return (
        <>
          <ColumnVisibility
            columns={[
              { id: "name", header: "Name", primary: true },
              { id: "email", header: "Email" },
              { id: "island", header: "Island" },
              { id: "id", header: "ID", hideable: false },
            ]}
            value={value}
            onValueChange={setValue}
          />
          <output>{JSON.stringify(value)}</output>
        </>
      )
    }
    renderWithOnu(<Harness />)
    await userEvent.click(screen.getByRole("button", { name: /Columns/ }))
    const items = await screen.findAllByRole("menuitemcheckbox")
    expect(items.map((i) => i.textContent)).toEqual(["Email", "Island"])
    expect(items[0]).not.toBeChecked()
    await userEvent.click(items[1] as HTMLElement)
    expect(screen.getByText('{"email":false,"island":false}')).toBeInTheDocument()
    expect(screen.getByRole("menu")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("can be icon-only", () => {
    renderWithOnu(<ColumnVisibility columns={[]} value={{}} onValueChange={vi.fn()} showLabel={false} />)
    expect(screen.getByRole("button", { name: "Show or hide columns" })).toBeInTheDocument()
  })
})

describe("FilterTabs", () => {
  it("shows status tabs with counts and reports the chosen one", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <FilterTabs
        controls="users"
        onValueChange={onValueChange}
        tabs={[
          { value: "all", label: "All", count: 1312 },
          { value: "active", label: "Active", count: 1280 },
          { value: "banned", label: "Banned", count: 32 },
          { value: "pending", label: "Pending", disabled: true },
        ]}
      />,
    )
    const list = screen.getByRole("tablist", { name: "Filter by status" })
    const all = within(list).getByRole("tab", { name: "All (1,312)" })
    expect(all).toHaveAttribute("aria-selected", "true")
    expect(all).toHaveAttribute("aria-controls", "users")
    await userEvent.click(within(list).getByRole("tab", { name: "Banned (32)" }))
    expect(onValueChange).toHaveBeenCalledWith("banned")
    expect(within(list).getByRole("tab", { name: "Pending" })).toBeDisabled()
  })

  it.each(directions)("has no axe violations in %s", async (dir) => {
    renderWithOnu(
      <div id="list">
        <FilterTabs controls="list" tabs={[{ value: "a", label: "ހުރިހާ", count: 3 }]} />
      </div>,
      { dir, locale: "dv" },
    )
    expect(screen.getByRole("tablist", { name: "ހާލަތުން ފިލްޓަރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("ExportMenu", () => {
  it("offers CSV, Excel and PDF and shows a spinner while exporting", async () => {
    const deferred = Deferred()
    const onExport = vi.fn(() => deferred.promise)
    renderWithOnu(<ExportMenu onExport={onExport} scopeLabel="312 users, current filters" />)
    await userEvent.click(screen.getByRole("button", { name: "Export" }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByText("312 users, current filters")).toBeInTheDocument()
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["CSV", "Excel", "PDF"])
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Excel" }))
    expect(onExport).toHaveBeenCalledWith("excel")
    const button = screen.getByRole("button", { name: "Exporting…" })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    await act(async () => deferred.resolve())
    expect(screen.getByRole("button", { name: "Export" })).toBeEnabled()
    expect(screen.getByText("Export ready")).toBeInTheDocument()
  })

  it("accepts custom options and reports failures", async () => {
    const onExport = vi.fn(() => Promise.reject(new Error("x")))
    renderWithOnu(
      <ExportMenu
        onExport={onExport}
        options={[
          { format: "json", label: "JSON", description: "For developers", icon: "code" },
          { format: "xml", disabled: true },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Export" }))
    expect(await screen.findByText("For developers")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "xml" })).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(screen.getByRole("menuitem", { name: /JSON/ }))
    await waitFor(() => expect(screen.getByText("That didn't work. Please try again.")).toBeInTheDocument())
    await expectNoA11yViolations()
  })
})

describe("LoadMore", () => {
  it("loads more, shows progress and announces what arrived", async () => {
    function Harness() {
      const [loaded, setLoaded] = React.useState(20)
      const [loading, setLoading] = React.useState(false)
      return (
        <LoadMore
          loaded={loaded}
          total={45}
          loading={loading}
          noun={{ one: "user", other: "users" }}
          onLoadMore={() => {
            setLoading(true)
            setTimeout(() => {
              setLoaded((n) => Math.min(n + 20, 45))
              setLoading(false)
            }, 300)
          }}
        />
      )
    }
    renderWithOnu(<Harness />)
    expect(screen.getByText("Showing 1–20 of 45 users")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Load more" }))
    expect(screen.getByRole("button", { name: "Loading more…" })).toBeDisabled()
    expect(await screen.findByText("Loaded 20 more users")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Load more" }))
    expect(await screen.findByText("All 45 users shown")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("tracks a returned promise, works without a total and loads automatically", async () => {
    const deferred = Deferred()
    const observe = vi.fn()
    let callback: IntersectionObserverCallback = () => {}
    const original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb
      }
      observe = observe
      disconnect() {}
    } as unknown as typeof IntersectionObserver
    const onLoadMore = vi.fn(() => deferred.promise)
    renderWithOnu(<LoadMore loaded={10} hasMore auto onLoadMore={onLoadMore} />)
    expect(screen.getByText("Showing 10 records")).toBeInTheDocument()
    expect(observe).toHaveBeenCalled()
    act(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Loading more…" })).toBeDisabled()
    await act(async () => deferred.resolve())
    expect(screen.getByRole("button", { name: "Load more" })).toBeEnabled()
    globalThis.IntersectionObserver = original
  })
})

describe("FilterSubmit", () => {
  it("submits and resets a filter form", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const onReset = vi.fn()
    const { rerender } = renderWithOnu(
      <form onSubmit={onSubmit} aria-label="Filters">
        <FilterSubmit onReset={onReset} />
      </form>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Filter" }))
    expect(onSubmit).toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Reset" }))
    expect(onReset).toHaveBeenCalled()
    rerender(
      <form onSubmit={onSubmit} aria-label="Filters">
        <FilterSubmit loading onReset={onReset} submitLabel="Search" resetLabel="Clear" />
      </form>,
    )
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled()
    await expectNoA11yViolations()
  })

  it("speaks Dhivehi", () => {
    renderWithOnu(<FilterSubmit />, { locale: "dv" })
    expect(screen.getByRole("button", { name: "ފިލްޓަރު ކުރޭ" })).toHaveAttribute("type", "submit")
  })
})

describe("SearchResults", () => {
  const groups = [
    {
      id: "services",
      label: "Services",
      total: 12,
      moreHref: "/search?type=services",
      items: [
        { id: "1", title: "Passport renewal", description: "Renew your passport online", href: "/s/1", icon: "file" },
        { id: "2", title: "Business registration", meta: "Updated 2 days ago" },
      ],
    },
    { id: "news", label: "News", items: [] },
  ]

  it("groups results, counts them and highlights the search words", async () => {
    const onSelect = vi.fn()
    renderWithOnu(<SearchResults query="passport renew" groups={groups} onSelect={onSelect} />)
    expect(screen.getByRole("heading", { name: "12 results for “passport renew”" })).toBeInTheDocument()
    const group = screen.getByRole("region", { name: /Services/ })
    expect(within(group).getByText("12 results")).toBeInTheDocument()
    const marks = Array.from(group.querySelectorAll("mark")).map((m) => m.textContent)
    expect(marks).toEqual(["Passport", "renew", "Renew", "passport"])
    expect(within(group).getByRole("link", { name: /Passport renewal/ })).toHaveAttribute("href", "/s/1")
    await userEvent.click(within(group).getByRole("button", { name: /Business registration/ }))
    expect(onSelect).toHaveBeenCalledWith(groups[0]?.items[1], groups[0])
    expect(within(group).getByRole("link", { name: "Services (12)" })).toBeInTheDocument()
    expect(screen.queryByRole("region", { name: /News/ })).not.toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("shows loading and empty states", () => {
    const { rerender } = renderWithOnu(<SearchResults query="x" groups={[]} loading />)
    expect(screen.getByRole("heading", { name: "Loading…" })).toBeInTheDocument()
    rerender(<SearchResults query="zzz" groups={[]} />)
    expect(screen.getAllByText("No results for “zzz”")).toHaveLength(2)
    rerender(<SearchResults query="" groups={[]} hideSummary />)
    expect(screen.getByText("No results")).toBeInTheDocument()
  })

  it("highlights Thaana and escapes regex characters", () => {
    renderWithOnu(
      <>
        <Highlight text="މާލެ ސިޓީ" query="މާލެ" />
        <Highlight text="a+b (c)" query="(c)" />
        <Highlight text="plain" query="  " />
      </>,
    )
    expect(document.querySelectorAll("mark")).toHaveLength(2)
    expect(screen.getByText("plain").querySelector("mark")).toBeNull()
  })

  it("speaks Dhivehi", () => {
    renderWithOnu(
      <SearchResults
        query="ޕާސްޕޯޓް"
        groups={[{ id: "a", label: "ޚިދުމަތްތައް", items: [{ id: "1", title: "ޕާސްޕޯޓް" }] }]}
      />,
      {
        locale: "dv",
      },
    )
    expect(screen.getByRole("heading", { name: "“ޕާސްޕޯޓް” އަށް 1 ނަތީޖާ" })).toBeInTheDocument()
  })
})

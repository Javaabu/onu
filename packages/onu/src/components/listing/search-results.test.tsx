import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SearchResults, type SearchResultGroup, type SearchResultItem } from "./search-results"

const service = (n: number): SearchResultItem => ({ id: `s${n}`, title: `Service ${n}`, href: `/services/${n}` })
const news = (n: number): SearchResultItem => ({ id: `n${n}`, title: `News ${n}` })

function deferred() {
  let resolve: () => void = () => undefined
  let reject: (e: unknown) => void = () => undefined
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** Groups with more results than shown; `onShowMore` appends the next three. */
function Harness({
  onShowMore,
  loadingMore,
  initial = 2,
}: {
  onShowMore?: (id: string, g: SearchResultGroup) => void | Promise<unknown>
  loadingMore?: boolean
  initial?: number
}) {
  const [count, setCount] = React.useState(initial)
  const groups: SearchResultGroup[] = [
    {
      id: "services",
      label: "Services",
      total: 6,
      moreHref: "/search?type=services",
      loadingMore,
      items: Array.from({ length: count }, (_, i) => service(i + 1)),
    },
    { id: "news", label: "News", items: [news(1)] },
  ]
  return (
    <SearchResults
      query="service"
      groups={groups}
      onShowMore={async (id, group) => {
        const result = onShowMore?.(id, group)
        await result
        setCount((c) => Math.min(6, c + 3))
      }}
    />
  )
}

describe("SearchResults: show more", () => {
  it("keeps the link when there is no onShowMore", () => {
    renderWithOnu(
      <SearchResults
        query="x"
        groups={[
          { id: "s", label: "Services", total: 9, moreHref: "/all", moreLabel: "All services", items: [service(1)] },
        ]}
        classNames={{ more: "more-class" }}
      />,
    )
    const link = screen.getByRole("link", { name: "All services" })
    expect(link).toHaveAttribute("href", "/all")
    expect(link).toHaveClass("more-class")
    expect(screen.queryByRole("button", { name: /Show more/ })).not.toBeInTheDocument()
  })

  it("expands a group in place, moves focus to the first new result and announces it", async () => {
    const onShowMore = vi.fn()
    renderWithOnu(<Harness onShowMore={onShowMore} />)
    const group = screen.getByRole("region", { name: /Services/ })
    expect(within(group).queryByRole("link", { name: /Services \(6\)/ })).not.toBeInTheDocument()
    // Groups with everything shown get no button.
    expect(within(screen.getByRole("region", { name: /News/ })).queryByRole("button", { name: /Show more/ })).toBeNull()

    await userEvent.click(within(group).getByRole("button", { name: "Show more Services" }))
    expect(onShowMore).toHaveBeenCalledWith("services", expect.objectContaining({ id: "services" }))
    await waitFor(() => expect(within(group).getAllByRole("link")).toHaveLength(5))
    expect(within(group).getByRole("link", { name: "Service 3" })).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent("3 more Services results shown")

    // The last batch: the button goes away once everything is shown.
    await userEvent.click(within(group).getByRole("button", { name: "Show more Services" }))
    await waitFor(() => expect(within(group).getByRole("link", { name: "Service 6" })).toHaveFocus())
    expect(screen.getByRole("status")).toHaveTextContent("1 more Services result shown")
    expect(within(group).queryByRole("button", { name: /Show more/ })).not.toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("shows a loading state while the promise is pending", async () => {
    const wait = deferred()
    renderWithOnu(<Harness onShowMore={() => wait.promise} />)
    await userEvent.click(screen.getByRole("button", { name: "Show more Services" }))
    const button = screen.getByRole("button", { name: "Loading more Services…" })
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toHaveFocus()
    // Clicking again while loading does nothing.
    await userEvent.click(button)
    expect(screen.getByRole("status")).toHaveTextContent("Loading more Services…")
    await act(async () => wait.resolve())
    await waitFor(() => expect(screen.getByRole("link", { name: "Service 3" })).toHaveFocus())
    expect(screen.getByRole("button", { name: "Show more Services" })).not.toHaveAttribute("aria-disabled")
  })

  it("supports a controlled loadingMore flag and a custom label", async () => {
    const onShowMore = vi.fn()
    const items = [service(1)]
    const { rerender } = renderWithOnu(
      <SearchResults
        query=""
        onShowMore={onShowMore}
        groups={[{ id: "s", label: "Services", hasMore: true, loadingMore: true, items }]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Loading more Services…" }))
    expect(onShowMore).not.toHaveBeenCalled()
    rerender(
      <SearchResults
        query=""
        onShowMore={onShowMore}
        groups={[{ id: "s", label: "Services", hasMore: true, moreLabel: "More services", items }]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "More services" }))
    expect(onShowMore).toHaveBeenCalledTimes(1)
    // Synchronous callbacks: items arrive on a later render.
    rerender(
      <SearchResults
        query=""
        onShowMore={onShowMore}
        groups={[{ id: "s", label: "Services", hasMore: false, items: [...items, news(2)] }]}
      />,
    )
    expect(screen.getByRole("button", { name: "News 2" })).toHaveFocus()
    expect(screen.queryByRole("button", { name: "More services" })).not.toBeInTheDocument()
  })

  it("announces a failure and does not move focus", async () => {
    renderWithOnu(<Harness onShowMore={() => Promise.reject(new Error("offline"))} />)
    const button = screen.getByRole("button", { name: "Show more Services" })
    await userEvent.click(button)
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Couldn't load more results. Please try again."),
    )
    expect(screen.getByRole("button", { name: "Show more Services" })).toHaveFocus()
    expect(screen.getAllByRole("link")).toHaveLength(2)
  })

  it("forgets a pending reveal when the search changes", async () => {
    const onShowMore = vi.fn()
    const groups = (query: string, n: number): SearchResultGroup[] => [
      { id: "s", label: "Services", total: 9, items: Array.from({ length: n }, (_, i) => service(i + 1)) },
    ]
    const { rerender } = renderWithOnu(<SearchResults query="a" groups={groups("a", 1)} onShowMore={onShowMore} />)
    await userEvent.click(screen.getByRole("button", { name: "Show more Services" }))
    rerender(<SearchResults query="b" groups={groups("b", 1)} onShowMore={onShowMore} />)
    rerender(<SearchResults query="b" groups={groups("b", 3)} onShowMore={onShowMore} />)
    expect(screen.getByRole("link", { name: "Service 2" })).not.toHaveFocus()
    expect(screen.getByRole("button", { name: "Show more Services" })).toHaveFocus()
    // A group that disappears also clears it.
    await userEvent.click(screen.getByRole("button", { name: "Show more Services" }))
    rerender(<SearchResults query="b" groups={[]} onShowMore={onShowMore} />)
    expect(screen.getAllByText("No results for “b”").length).toBeGreaterThan(0)
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    const onShowMore = vi.fn()
    renderWithOnu(
      <SearchResults
        query="ޚިދުމަތް"
        onShowMore={onShowMore}
        groups={[{ id: "s", label: "ޚިދުމަތްތައް", total: 4, items: [{ id: "1", title: "ޕާސްޕޯޓް ޚިދުމަތް" }] }]}
      />,
      { locale: "dv", dir },
    )
    await userEvent.click(screen.getByRole("button", { name: "އިތުރު ޚިދުމަތްތައް ދައްކާ" }))
    expect(onShowMore).toHaveBeenCalledWith("s", expect.anything())
    await expectNoA11yViolations()
  })
})

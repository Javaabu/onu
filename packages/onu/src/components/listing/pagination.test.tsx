import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { getPageItems, normalizePagination, Pagination } from "./pagination"
import { PerPage } from "./per-page"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const noun = { one: "user", other: "users" }

describe("Pagination", () => {
  it("shows 'Showing 26–50 of 312 users', rows per page and Previous / Next (§25.6)", async () => {
    const onPageChange = vi.fn()
    const onPerPageChange = vi.fn()
    renderWithOnu(
      <Pagination
        page={2}
        perPage={25}
        total={312}
        noun={noun}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />,
    )
    expect(screen.getByText("Showing 26–50 of 312 users")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Go to previous page" }))
    expect(onPageChange).toHaveBeenCalledWith(1)
    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    await userEvent.click(screen.getByRole("combobox", { name: "Rows per page" }))
    const options = await screen.findAllByRole("option")
    expect(options.map((o) => o.textContent)).toEqual(["10", "25", "50", "100"])
    await userEvent.click(screen.getByRole("option", { name: "100" }))
    expect(onPerPageChange).toHaveBeenCalledWith(100)
    await expectNoA11yViolations()
  })

  it("disables Previous on the first page and Next on the last (§25.6)", () => {
    const { rerender } = renderWithOnu(<Pagination page={1} perPage={25} total={60} />)
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled()
    rerender(<Pagination page={3} perPage={25} total={60} />)
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled()
    expect(screen.getByText("Showing 51–60 of 60 records")).toBeInTheDocument()
  })

  it("shows numbered pages with gaps and marks the current page", async () => {
    const onPageChange = vi.fn()
    renderWithOnu(<Pagination page={5} perPage={10} total={200} numbered onPageChange={onPageChange} />)
    const current = screen.getByRole("button", { name: "Page 5, current page" })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to page 20" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Go to page 2" })).not.toBeInTheDocument()
    // Phones see "Page 5 of 20" instead of the numbers.
    expect(screen.getByText("Page 5 of 20")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Go to page 6" }))
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it("renders links through the provider's link component", async () => {
    const onPageChange = vi.fn()
    renderWithOnu(
      <Pagination
        page={2}
        perPage={10}
        total={30}
        getPageHref={(p) => `/users?page=${p}`}
        onPageChange={onPageChange}
      />,
    )
    const next = screen.getByRole("link", { name: "Go to next page" })
    expect(next).toHaveAttribute("href", "/users?page=3")
    await userEvent.click(next)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it("accepts a Laravel API resource collection (R16.4)", () => {
    renderWithOnu(
      <Pagination
        noun={noun}
        paginator={{
          data: [],
          links: {
            first: "/api/users?page=1",
            last: "/api/users?page=13",
            prev: "/api/users?page=1",
            next: "/api/users?page=3",
          },
          meta: { current_page: 2, from: 26, last_page: 13, path: "/api/users", per_page: 25, to: 50, total: 312 },
        }}
      />,
    )
    expect(screen.getByText("Showing 26–50 of 312 users")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Go to next page" })).toHaveAttribute("href", "/api/users?page=3")
    expect(screen.getByRole("link", { name: "Go to previous page" })).toHaveAttribute("href", "/api/users?page=1")
  })

  it("accepts a Laravel paginator and a simple paginator (R16.4)", () => {
    const { rerender } = renderWithOnu(
      <Pagination
        paginator={{
          current_page: 1,
          per_page: "15",
          total: 40,
          from: 1,
          to: 15,
          last_page: 3,
          next_page_url: "https://x.mv/users?page=2",
          prev_page_url: null,
          links: [{ url: null, label: "&laquo; Previous", active: false }],
        }}
      />,
    )
    expect(screen.getByRole("link", { name: "Go to next page" })).toHaveAttribute("href", "https://x.mv/users?page=2")
    rerender(
      <Pagination paginator={{ current_page: 4, per_page: 15, next_page_url: null, prev_page_url: "/u?page=3" }} />,
    )
    expect(screen.getByText("Page 4")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled()
  })

  it("uses hasNextPage when the total is unknown", () => {
    renderWithOnu(<Pagination page={1} hasNextPage />)
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeEnabled()
  })

  it("shows an empty summary and can hide it", () => {
    const { rerender } = renderWithOnu(<Pagination total={0} />)
    expect(screen.getByText("No records to show")).toBeInTheDocument()
    rerender(<Pagination total={0} showSummary={false} classNames={{ pages: "pages-x" }} />)
    expect(screen.queryByText("No records to show")).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot=pagination-pages]")).toHaveClass("pages-x")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Pagination page={2} perPage={25} total={312} noun={{ one: "މީހާ", other: "މީހުން" }} />, {
      locale: "dv",
      dir,
    })
    const nav = screen.getByRole("navigation", { name: "ސަފްހާތައް" })
    expect(within(nav).getByText("312 މީހުން އިން 26–50 ދައްކަނީ")).toBeInTheDocument()
    expect(within(nav).getByRole("button", { name: "ކުރީގެ ސަފްހާއަށް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("pagination helpers", () => {
  it("collapses page numbers with gaps", () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getPageItems(5, 20)).toEqual([1, null, 4, 5, 6, null, 20])
    expect(getPageItems(3, 20)).toEqual([1, 2, 3, 4, 5, null, 20])
    expect(getPageItems(18, 20)).toEqual([1, null, 16, 17, 18, 19, 20])
    expect(getPageItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("normalizes paginators and builds page URLs", () => {
    const info = normalizePagination({
      current_page: 1,
      per_page: 10,
      total: 25,
      path: "https://x.mv/api/users?search=a",
    })
    expect(info).toMatchObject({ page: 1, perPage: 10, total: 25, lastPage: 3 })
    expect(info.pageUrl?.(2)).toBe("https://x.mv/api/users?search=a&page=2")
    expect(normalizePagination({ current_page: 1, per_page: 10, path: "/api/users" }).pageUrl?.(3)).toBe(
      "/api/users?page=3",
    )
  })
})

describe("PerPage", () => {
  it("offers 10/25/50/100 plus the current value, with a hidden label", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<PerPage value={30} onValueChange={onValueChange} label={null} classNames={{ trigger: "t-x" }} />)
    const trigger = screen.getByRole("combobox", { name: "Rows per page" })
    expect(trigger).toHaveClass("t-x")
    expect(screen.getByText("Rows per page")).toHaveClass("sr-only")
    await userEvent.click(trigger)
    expect((await screen.findAllByRole("option")).map((o) => o.textContent)).toEqual(["10", "25", "30", "50", "100"])
  })
})

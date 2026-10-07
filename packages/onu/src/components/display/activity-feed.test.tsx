import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ActivityFeed, groupActivityByDay, type ActivityItem } from "./activity-feed"
import { LastEditedBy } from "./last-edited-by"

const NOW = new Date(2026, 2, 12, 15, 0)
const at = (daysAgo: number, hour: number) => new Date(2026, 2, 12 - daysAgo, hour, 0)

const items: ActivityItem[] = [
  { id: 1, actor: { name: "Aishath Shiuna" }, action: "approved the application", timestamp: at(0, 14) },
  { id: 2, actor: { name: "Ahmed Ali" }, action: "uploaded ID card", timestamp: at(0, 9), detail: "id-card.pdf" },
  { id: 3, icon: "settings", action: "Status changed to Pending", timestamp: at(1, 11) },
  { id: 4, actor: { name: "Mohamed Naseem" }, action: "created the record", timestamp: at(5, 8) },
  { id: 5, action: "invalid", timestamp: "nope" },
]

describe("groupActivityByDay", () => {
  it("groups by calendar day, newest first, skipping invalid dates", () => {
    const groups = groupActivityByDay(items)
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([[1, 2], [3], [4]])
  })
})

describe("ActivityFeed", () => {
  it("shows day headings (Today, Yesterday, date), actors, actions and timestamps", () => {
    renderWithOnu(<ActivityFeed items={items} now={NOW} dayFormat="d MMM yyyy" />)
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(["Today", "Yesterday", "7 Mar 2026"])
    const first = screen.getAllByRole("listitem")[0]!
    expect(within(first).getByText(/Aishath Shiuna/)).toBeInTheDocument()
    expect(within(first).getByText("approved the application")).toBeInTheDocument()
    expect(within(first).getByText("1 hour ago")).toBeInTheDocument()
    expect(screen.getByText("id-card.pdf")).toBeInTheDocument()
    expect(document.querySelector("[data-icon-name=settings]")).toBeInTheDocument()
  })

  it("loads more and shows a spinner while loading", async () => {
    let resolve!: () => void
    const onLoadMore = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    renderWithOnu(<ActivityFeed items={items} hasMore onLoadMore={onLoadMore} now={NOW} />)
    const button = screen.getByRole("button", { name: "Load more" })
    await userEvent.click(button)
    expect(onLoadMore).toHaveBeenCalled()
    expect(button).toBeDisabled()
    expect(screen.getByRole("region")).toHaveAttribute("aria-busy", "true")
    resolve()
    await vi.waitFor(() => expect(button).toBeEnabled())
  })

  it("renders an empty state, ungrouped lists and a hidden title", () => {
    const { rerender } = renderWithOnu(<ActivityFeed items={[]} />)
    expect(screen.getByText("No activity yet")).toBeInTheDocument()
    rerender(<ActivityFeed items={items.slice(0, 2)} groupByDay={false} title={null} now={NOW} loadingMore hasMore />)
    expect(screen.queryByRole("heading")).toBeNull()
    expect(screen.getByRole("region", { name: "Activity" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Load more" })).toBeDisabled()
  })

  it("uses Dhivehi day names and relative times", () => {
    renderWithOnu(<ActivityFeed items={items.slice(0, 3)} now={NOW} />, { locale: "dv" })
    expect(screen.getByRole("heading", { name: "މިއަދު" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "އިއްޔެ" })).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<ActivityFeed items={items} now={NOW} hasMore />, { dir })
    await expectNoA11yViolations(container)
  })
})

describe("LastEditedBy", () => {
  it("shows the avatar, the name and a relative time", () => {
    const { container } = renderWithOnu(
      <LastEditedBy user={{ name: "Aishath Shiuna", href: "/users/2" }} at={at(0, 14)} dateProps={{ now: NOW }} />,
    )
    expect(container).toHaveTextContent("Last edited by Aishath Shiuna")
    expect(screen.getByRole("link", { name: "Aishath Shiuna" })).toHaveAttribute("href", "/users/2")
    expect(screen.getByText("1 hour ago")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=user-avatar]")).toBeInTheDocument()
  })

  it("works in Dhivehi, without avatar or user", () => {
    const { container, rerender } = renderWithOnu(
      <LastEditedBy user={{ name: "އަޙްމަދު" }} hideAvatar at={at(0, 14)} dateProps={{ now: NOW }} />,
      { locale: "dv" },
    )
    expect(container).toHaveTextContent("އެންމެ ފަހުން އެޑިޓްކުރީ އަޙްމަދު")
    expect(container.querySelector("[data-slot=user-avatar]")).toBeNull()
    rerender(<LastEditedBy at={null} />)
    expect(container).toHaveTextContent("—")
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<LastEditedBy user={{ name: "Ahmed Ali" }} at={at(1, 9)} />, { dir })
    await expectNoA11yViolations(container)
  })
})

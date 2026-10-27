import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { groupTimelineByDay, Timeline, timelineMarkerVariants, type TimelineItem } from "./timeline"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: TimelineItem[] = [
  { title: "Application submitted", time: new Date(2026, 9, 1, 9, 30), status: "success", description: "Online" },
  { title: "Documents verified", time: "2026-10-03T10:00:00", status: "current", content: <a href="/docs">Files</a> },
  { title: "Payment", status: "error" },
  { title: "Review", status: "warning", icon: "eye" },
  { title: "Note", status: "info" },
  { title: "Approval", status: "pending" },
  { title: "Archived" },
]

describe("Timeline", () => {
  it("lists entries with status markers, screen-reader status and localised times", async () => {
    const { container } = renderWithOnu(<Timeline items={items} className="extra" classNames={{ title: "ttl" }} />)
    const list = screen.getByRole("list", { name: "Timeline" })
    expect(list).toHaveClass("extra")
    const entries = within(list).getAllByRole("listitem")
    expect(entries).toHaveLength(7)
    expect(entries[0]).toHaveTextContent("Application submitted (Completed)")
    expect(entries[1]).toHaveAttribute("aria-current", "step")
    expect(entries[2]).toHaveTextContent("(Failed)")
    expect(screen.getByText("Application submitted")).toHaveClass("ttl")
    expect(within(entries[0]!).getByText("Oct 1, 2026, 9:30 AM")).toHaveAttribute("datetime")
    const markers = container.querySelectorAll("[data-slot=timeline-marker]")
    expect(markers[0]).toHaveClass("bg-success")
    expect(markers[2]).toHaveClass("bg-destructive")
    expect(markers[5]).toHaveClass("border-dashed")
    expect(screen.getByRole("link", { name: "Files" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("shows relative times and custom patterns", () => {
    const now = new Date(2026, 9, 7, 12, 0)
    const { rerender } = renderWithOnu(
      <Timeline items={[{ title: "A", time: new Date(2026, 9, 4, 12, 0) }]} timeFormat="relative" now={now} />,
    )
    expect(screen.getByText("3 days ago")).toBeInTheDocument()
    rerender(
      <Timeline items={[{ title: "A", time: new Date(2026, 9, 4, 12, 0) }]} datePattern="yyyy-MM-dd" size="sm" />,
    )
    expect(screen.getByText("2026-10-04")).toBeInTheDocument()
    expect(timelineMarkerVariants({ size: "sm" })).toContain("size-5")
  })

  it.each(directions)("uses Dhivehi dates and keeps the line on the inline start in %s", async (dir) => {
    const { container } = renderWithOnu(
      <Timeline items={[{ title: "ހުށަހެޅީ", time: new Date(2026, 9, 1), status: "success" }, { title: "ބަލަނީ" }]} />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("list", { name: "ޓައިމްލައިން" })).toBeInTheDocument()
    expect(screen.getByText(/ނިމިފައި/)).toBeInTheDocument()
    expect(container.querySelector("li > span[aria-hidden]")).toHaveClass("start-3.5")
    await expectNoA11yViolations()
  })
})

const NOW = new Date(2026, 2, 12, 15, 0)
const at = (daysAgo: number, hour: number) => new Date(2026, 2, 12 - daysAgo, hour, 0)

const activity: TimelineItem[] = [
  { id: 1, actor: { name: "Aishath Shiuna" }, title: "approved the application", time: at(0, 14) },
  { id: 2, actor: { name: "Ahmed Ali" }, title: "uploaded ID card", time: at(0, 9), description: "id-card.pdf" },
  { id: 3, icon: "settings", title: "Status changed to Pending", time: at(1, 11) },
  { id: 4, actor: { name: "Mohamed Naseem" }, title: "created the record", time: at(5, 8) },
  { id: 5, title: "invalid", time: "nope" },
]

describe("groupTimelineByDay", () => {
  it("groups by calendar day in order, skipping invalid dates", () => {
    expect(groupTimelineByDay(activity).map((g) => g.items.map((i) => i.id))).toEqual([[1, 2], [3], [4]])
    expect(groupTimelineByDay([...activity].reverse()).map((g) => g.items.map((i) => i.id))).toEqual([[4], [3], [2, 1]])
  })
})

describe("Timeline as an activity feed", () => {
  it("groups under day headings (Today, Yesterday, date) with actors and relative times", () => {
    const { container } = renderWithOnu(
      <Timeline items={activity} groupByDay timeFormat="relative" now={NOW} dayFormat="d MMM yyyy" title="Activity" />,
    )
    const region = screen.getByRole("region", { name: "Activity" })
    expect(within(region).getByRole("heading", { level: 2, name: "Activity" })).toBeInTheDocument()
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(["Today", "Yesterday", "7 Mar 2026"])
    expect(screen.getByRole("list", { name: "Today" })).toBeInTheDocument()
    const first = screen.getAllByRole("listitem")[0]!
    expect(first).toHaveTextContent("Aishath Shiuna approved the application")
    expect(within(first).getByText("1 hour ago")).toHaveAttribute("datetime")
    expect(first.querySelector("[data-slot=user-avatar]")).toBeInTheDocument()
    expect(screen.getByText("id-card.pdf")).toBeInTheDocument()
    expect(container.querySelector("[data-icon-name=settings]")).toBeInTheDocument()
    // The entry without a valid time is left out of the day groups.
    expect(screen.getAllByRole("listitem")).toHaveLength(4)
  })

  it("loads more and shows a spinner while loading", async () => {
    let resolve!: () => void
    const onLoadMore = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    renderWithOnu(<Timeline items={activity} groupByDay hasMore onLoadMore={onLoadMore} now={NOW} />)
    const button = screen.getByRole("button", { name: "Load more" })
    await userEvent.click(button)
    expect(onLoadMore).toHaveBeenCalled()
    expect(button).toBeDisabled()
    expect(screen.getByRole("region", { name: "Timeline" })).toHaveAttribute("aria-busy", "true")
    resolve()
    await vi.waitFor(() => expect(button).toBeEnabled())
  })

  it("renders an empty state, ungrouped lists and a forced loading state", () => {
    const { rerender } = renderWithOnu(<Timeline items={[]} />)
    expect(screen.getByText("No activity yet")).toBeInTheDocument()
    rerender(<Timeline items={[]} emptyText="Nothing matches" aria-label="Activity" />)
    expect(screen.getByRole("region", { name: "Activity" })).toHaveTextContent("Nothing matches")
    rerender(<Timeline items={activity.slice(0, 2)} now={NOW} loadingMore hasMore />)
    expect(screen.queryByRole("heading")).toBeNull()
    expect(screen.getByRole("region", { name: "Timeline" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Load more" })).toBeDisabled()
    // Without feed features it stays a plain named list.
    rerender(<Timeline items={activity.slice(0, 2)} now={NOW} />)
    expect(screen.queryByRole("region")).toBeNull()
    expect(screen.getByRole("list", { name: "Timeline" })).toBeInTheDocument()
  })

  it("uses Dhivehi day names", () => {
    renderWithOnu(<Timeline items={activity.slice(0, 3)} groupByDay now={NOW} />, { locale: "dv" })
    expect(screen.getByRole("heading", { name: "މިއަދު" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "އިއްޔެ" })).toBeInTheDocument()
  })

  it.each(directions)("is accessible as a feed in %s", async (dir) => {
    const { container } = renderWithOnu(
      <Timeline items={activity} groupByDay timeFormat="relative" now={NOW} hasMore title="Activity" />,
      { dir },
    )
    await expectNoA11yViolations(container)
  })
})

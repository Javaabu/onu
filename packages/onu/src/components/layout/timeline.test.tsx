import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Timeline, timelineMarkerVariants, type TimelineItem } from "./timeline"

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

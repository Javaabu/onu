import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { OnuProvider } from "../../providers/onu-provider"
import { SidebarMenuSkeleton } from "../../ui/sidebar"
import { Timeline } from "../layout/timeline"
import { Countdown } from "./countdown"
import { PublishBox } from "./publish-box"
import { RelativeDate } from "./relative-date"

/** The server's markup at two different times; a hydration mismatch shows up as a difference. */
function serverRenderTwice(ui: React.ReactElement) {
  const render = () => renderToString(<OnuProvider>{ui}</OnuProvider>)
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
  const first = render()
  vi.setSystemTime(new Date("2026-06-15T12:34:56Z"))
  return [first, render()]
}

describe("first render doesn't depend on the clock", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it.each([
    ["Countdown", <Countdown key="c" to="2030-01-01T00:00:00Z" />],
    ["RelativeDate", <RelativeDate key="r" value="2025-12-31T00:00:00Z" />],
    ["PublishBox", <PublishBox key="p" status="draft" publishAt="2026-03-01T00:00:00Z" />],
    ["Timeline", <Timeline key="t" groupByDay items={[{ id: "1", title: "Opened", time: "2026-01-01T00:00:00Z" }]} />],
  ])("%s", (_name, ui) => {
    const [first, second] = serverRenderTwice(ui)
    expect(first).toBe(second)
  })

  it("SidebarMenuSkeleton has a width from a fixed cycle", () => {
    const widths = [0, 1, 2, 3, 4].map((index) => renderToString(<SidebarMenuSkeleton index={index} />))
    expect(widths[0]).toContain("--skeleton-width:60%")
    expect(widths[1]).toContain("--skeleton-width:75%")
    expect(widths[4]).toBe(widths[0])
    expect(renderToString(<SidebarMenuSkeleton index={2} />)).toBe(widths[2])
  })
})

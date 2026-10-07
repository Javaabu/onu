import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import type { TrackFeature, TrackPoint } from "./geo"
import { MapReplay } from "./map-replay"

const start = Date.UTC(2026, 2, 12, 4, 30)
const track: TrackPoint[] = Array.from({ length: 11 }, (_, i) => ({
  lat: 4.17 - i * 0.02,
  lng: 73.51,
  time: start + i * 60_000,
}))

afterEach(() => vi.unstubAllGlobals())

function slider() {
  return screen.getByRole("slider", { name: "Playback position" })
}

describe("MapReplay", () => {
  it("renders the track, controls and a text summary", async () => {
    renderWithOnu(<MapReplay track={track} title="Ferry Raajje" />)
    expect(screen.getByRole("region", { name: "Replay of Ferry Raajje" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Playback controls" })).toBeInTheDocument()
    expect(screen.getByText(/11 points · .* km · 10 min/)).toBeInTheDocument()
    expect(slider()).toHaveAttribute("aria-valuemin", String(start))
    expect(slider()).toHaveAttribute("aria-valuetext", expect.stringContaining("(1 min / 10 min)"))
    expect(screen.getByRole("img", { name: "Ferry Raajje" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("scrubs with the keyboard", async () => {
    const onTimeChange = vi.fn()
    renderWithOnu(<MapReplay track={track} onTimeChange={onTimeChange} />)
    slider().focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(onTimeChange).toHaveBeenLastCalledWith(start + 1000)
    await userEvent.keyboard("{End}")
    expect(onTimeChange).toHaveBeenLastCalledWith(start + 600_000)
    expect(screen.getByRole("button", { name: "Play" }).querySelector("[data-icon-name=refresh]")).not.toBeNull()
    await userEvent.keyboard("{Home}")
    expect(onTimeChange).toHaveBeenLastCalledWith(start)
  })

  it("plays and pauses with requestAnimationFrame at the chosen speed", async () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
    vi.spyOn(performance, "now").mockReturnValue(0)
    const onTimeChange = vi.fn()
    const onPlayingChange = vi.fn()
    renderWithOnu(
      <MapReplay track={track} onTimeChange={onTimeChange} onPlayingChange={onPlayingChange} speeds={[60, 600]} />,
    )
    fireEvent.change(screen.getByRole("combobox", { name: "Speed" }), { target: { value: "600" } })
    await userEvent.click(screen.getByRole("button", { name: "Play" }))
    expect(onPlayingChange).toHaveBeenLastCalledWith(true)
    act(() => frames.shift()!(100))
    // 100 ms × 600 = one minute.
    expect(onTimeChange).toHaveBeenLastCalledWith(start + 60_000)
    act(() => frames.shift()!(10_000))
    expect(onTimeChange).toHaveBeenLastCalledWith(start + 600_000)
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
    // At the end, Play restarts from the beginning.
    await userEvent.click(screen.getByRole("button", { name: "Play" }))
    expect(onTimeChange).toHaveBeenLastCalledWith(start)
    await userEvent.click(screen.getByRole("button", { name: "Pause" }))
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
  })

  it("accepts a timestamped GeoJSON LineString and controlled time", () => {
    const feature: TrackFeature = {
      type: "Feature",
      properties: { timestamps: track.map((p) => new Date(p.time).toISOString()) },
      geometry: { type: "LineString", coordinates: track.map((p) => [p.lng, p.lat]) },
    }
    function Controlled() {
      const [time, setTime] = React.useState(start + 300_000)
      return <MapReplay track={feature} time={time} onTimeChange={setTime} defaultSpeed={7} />
    }
    renderWithOnu(<Controlled />)
    expect(slider()).toHaveAttribute("aria-valuenow", String(start + 300_000))
    expect(screen.getByRole("combobox", { name: "Speed" })).toHaveValue("1")
  })

  it("shows an empty state for short tracks", () => {
    renderWithOnu(<MapReplay track={[track[0]!]} />)
    expect(screen.getByText("No track to play.")).toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapReplay track={track} />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ޕްލޭކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "ޓްރެކްކުރާ އުޅަނދު ގެ ރީޕްލޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

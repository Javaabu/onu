import * as React from "react"

import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { MediaPlayer } from "./media-player"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

// Media Chrome's web components need a real browser; stand-ins record the props they get.
const i18n = vi.hoisted(() => ({ addTranslation: vi.fn(), setLanguage: vi.fn() }))
vi.mock("media-chrome/dist/utils/i18n.js", () => i18n)
vi.mock("media-chrome/react", () => {
  const make = (name: string) =>
    function Stub({
      children,
      className,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode; className?: string }) {
      const attrs = Object.fromEntries(
        Object.entries(props).map(([k, v]) => [
          k.startsWith("aria-") || k === "dir" ? k : `data-${k.toLowerCase()}`,
          String(v),
        ]),
      )
      return (
        <div data-element={name} className={className} {...attrs}>
          {children}
        </div>
      )
    }
  return {
    MediaController: make("controller"),
    MediaControlBar: make("control-bar"),
    MediaPlayButton: make("play"),
    MediaSeekBackwardButton: make("seek-backward"),
    MediaSeekForwardButton: make("seek-forward"),
    MediaTimeRange: make("time-range"),
    MediaTimeDisplay: make("time-display"),
    MediaMuteButton: make("mute"),
    MediaVolumeRange: make("volume"),
    MediaCaptionsButton: make("captions"),
    MediaPlaybackRateButton: make("rate"),
    MediaFullscreenButton: make("fullscreen"),
  }
})

const el = (name: string) => document.querySelector(`[data-element=${name}]`)

describe("MediaPlayer", () => {
  it("renders a video with captions, controls and translated labels", async () => {
    const { container } = renderWithOnu(
      <MediaPlayer
        src={[
          { src: "/v/reef.webm", type: "video/webm" },
          { src: "/v/reef.mp4", type: "video/mp4" },
        ]}
        title="Coral reef restoration"
        poster="/v/reef.jpg"
        tracks={[
          { src: "/v/reef.dv.vtt", srcLang: "dv", label: "ދިވެހި", default: true },
          { src: "/v/reef.en.vtt", srcLang: "en", label: "English", kind: "subtitles" },
        ]}
        seekOffset={15}
        className="player-x"
        classNames={{ controlBar: "bar-x", media: "media-x" }}
      />,
    )
    const controller = el("controller")!
    expect(controller).toHaveAttribute("aria-label", "Coral reef restoration")
    expect(controller).toHaveClass("player-x", "aspect-video")
    const video = container.querySelector("video")!
    expect(video).toHaveAttribute("slot", "media")
    expect(video).toHaveAttribute("poster", "/v/reef.jpg")
    expect(video).toHaveClass("media-x")
    expect(video.querySelectorAll("source")).toHaveLength(2)
    const tracks = video.querySelectorAll("track")
    expect(tracks[0]).toHaveAttribute("kind", "captions")
    expect(tracks[0]).toHaveAttribute("srclang", "dv")
    expect(tracks[1]).toHaveAttribute("kind", "subtitles")
    expect(el("control-bar")).toHaveAttribute("dir", "ltr")
    expect(el("control-bar")).toHaveClass("bar-x")
    expect(el("captions")).toBeInTheDocument()
    expect(el("fullscreen")).toBeInTheDocument()
    expect(el("seek-backward")).toHaveAttribute("data-seekoffset", "15")
    expect(i18n.setLanguage).toHaveBeenCalledWith("en")
    expect(i18n.addTranslation).toHaveBeenCalledWith("en", expect.objectContaining({ Play: "Play", Mute: "Mute" }))
    await expectNoA11yViolations()
  })

  it("renders audio without fullscreen or captions buttons", () => {
    const { container } = renderWithOnu(
      <MediaPlayer kind="audio" src="/a/bodu-beru.mp3" title="Bodu beru" muted loop />,
    )
    expect(container.querySelector("audio")).not.toHaveAttribute("src")
    expect(container.querySelector("audio source")).toHaveAttribute("src", "/a/bodu-beru.mp3")
    expect(el("controller")).toHaveAttribute("data-audio", "true")
    expect(el("fullscreen")).toBeNull()
    expect(el("captions")).toBeNull()
  })

  it.each(directions)("registers Dhivehi labels and keeps the controls LTR in %s", (dir) => {
    renderWithOnu(<MediaPlayer src="/v.mp4" title="ވީޑިއޯ" />, { locale: "dv", dir })
    expect(i18n.setLanguage).toHaveBeenLastCalledWith("dv")
    expect(i18n.addTranslation).toHaveBeenLastCalledWith(
      "dv",
      expect.objectContaining({ Play: "ކުޅުވާ", "{time} remaining": "{time} ބާކީ" }),
    )
    expect(el("control-bar")).toHaveAttribute("dir", "ltr")
  })
})

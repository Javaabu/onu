"use client"

import * as React from "react"
import {
  MediaCaptionsButton,
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaPlaybackRateButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react"
import { addTranslation, setLanguage } from "media-chrome/dist/utils/i18n.js"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { Translate } from "../i18n/types"

export interface MediaTrack {
  src: string
  /** Language of the track, e.g. `dv` or `en`. */
  srcLang: string
  label: string
  kind?: "captions" | "subtitles" | "descriptions" | "chapters"
  default?: boolean
}

export interface MediaSource {
  src: string
  type?: string
}

export interface MediaPlayerProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Media URL, or several sources in different formats. */
  src: string | MediaSource[]
  /** `video` (default) or `audio`. */
  kind?: "video" | "audio"
  /** What is playing; names the player for screen readers. */
  title: string
  poster?: string
  /** Captions and subtitles (R14.10). */
  tracks?: MediaTrack[]
  /** Playback speeds offered. */
  playbackRates?: number[]
  /** Seconds skipped by the seek buttons. Default 10. */
  seekOffset?: number
  loop?: boolean
  muted?: boolean
  preload?: "none" | "metadata" | "auto"
  crossOrigin?: "anonymous" | "use-credentials"
  classNames?: { media?: string; controlBar?: string }
}

/** media-chrome's strings, mapped to Onu's `file.player*` messages. */
function mediaChromeDictionary(t: Translate): Record<string, string> {
  return {
    Play: t("file.playerPlay"),
    play: t("file.playerPlay"),
    Pause: t("file.playerPause"),
    pause: t("file.playerPause"),
    Mute: t("file.playerMute"),
    mute: t("file.playerMute"),
    Unmute: t("file.playerUnmute"),
    unmute: t("file.playerUnmute"),
    volume: t("file.playerVolume"),
    seek: t("file.playerSeek"),
    Captions: t("file.playerCaptions"),
    "closed captions": t("file.playerCaptions"),
    "Enable captions": t("file.playerCaptionsOn"),
    "Disable captions": t("file.playerCaptionsOff"),
    "Enter fullscreen mode": t("file.playerFullscreenEnter"),
    "enter fullscreen mode": t("file.playerFullscreenEnter"),
    "Exit fullscreen mode": t("file.playerFullscreenExit"),
    "exit fullscreen mode": t("file.playerFullscreenExit"),
    "Playback rate": t("file.playerPlaybackRate"),
    "current playback rate": t("file.playerPlaybackRate"),
    "Playback rate {playbackRate}": t("file.playerPlaybackRateValue"),
    "Seek backward": t("file.playerSeekBackward"),
    "Seek forward": t("file.playerSeekForward"),
    "seek back {seekOffset} seconds": t("file.playerSeekBackSeconds"),
    "seek forward {seekOffset} seconds": t("file.playerSeekForwardSeconds"),
    "playback time": t("file.playerTime"),
    "media loading": t("file.playerLoading"),
    "video player": t("file.playerVideo"),
    "audio player": t("file.playerAudio"),
    "{time} remaining": t("file.playerRemaining"),
    "{currentTime} of {totalTime}": t("file.playerCurrentOfTotal"),
    "video not loaded, unknown time.": t("file.playerUnknownTime"),
    hour: t("file.playerHour"),
    hours: t("file.playerHours"),
    minute: t("file.playerMinute"),
    minutes: t("file.playerMinutes"),
    second: t("file.playerSecond"),
    seconds: t("file.playerSeconds"),
  }
}

const THEME =
  "[--media-primary-color:var(--foreground)] [--media-secondary-color:transparent] [--media-control-background:color-mix(in_oklch,var(--background)_88%,transparent)] [--media-control-hover-background:var(--muted)] [--media-range-bar-color:var(--primary)] [--media-range-track-background:var(--border)] [--media-range-thumb-background:var(--primary)] [--media-font-family:var(--onu-font-sans)] [--media-focus-box-shadow:inset_0_0_0_3px_var(--ring)]"

/**
 * Accessible audio/video player built on Media Chrome: keyboard shortcuts, captions,
 * playback speed, translated labels, and themed with Onu tokens. The control bar stays
 * left-to-right in RTL so the timeline and seek keys match the media's direction.
 */
export function MediaPlayer({
  src,
  kind = "video",
  title,
  poster,
  tracks = [],
  playbackRates = [0.5, 1, 1.25, 1.5, 2],
  seekOffset = 10,
  loop,
  muted,
  preload = "metadata",
  crossOrigin,
  className,
  classNames,
  ...props
}: MediaPlayerProps) {
  const { t, locale } = useTranslation()
  const audio = kind === "audio"

  // media-chrome translates through a global dictionary; register ours before its elements render.
  React.useMemo(() => {
    addTranslation(locale.code, mediaChromeDictionary(t) as Parameters<typeof addTranslation>[1])
    setLanguage(locale.code)
  }, [locale.code, t])

  const sources = typeof src === "string" ? [{ src }] : src
  const mediaProps = {
    slot: "media",
    title,
    loop,
    muted,
    preload,
    crossOrigin,
    playsInline: true,
    className: cn(audio ? "w-full" : "size-full object-contain", classNames?.media),
  }
  const children = (
    <>
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
      {tracks.map((track) => (
        <track
          key={track.src}
          src={track.src}
          srcLang={track.srcLang}
          label={track.label}
          kind={track.kind ?? "captions"}
          default={track.default}
        />
      ))}
    </>
  )

  return (
    <MediaController
      key={locale.code}
      audio={audio || undefined}
      data-slot="media-player"
      data-kind={kind}
      aria-label={title}
      className={cn(
        THEME,
        "@container block w-full overflow-hidden rounded-xl border border-border bg-card",
        !audio && "aspect-video bg-foreground",
        className,
      )}
      {...(props as object)}
    >
      {/* Caption tracks come from the `tracks` prop, rendered in `children` (R14.10). */}
      {audio ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio {...mediaProps}>{children}</audio>
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video {...mediaProps} poster={poster}>
          {children}
        </video>
      )}
      <MediaControlBar dir="ltr" className={cn("w-full", classNames?.controlBar)}>
        <MediaPlayButton className="touch:min-w-11 touch:min-h-11" />
        <MediaSeekBackwardButton seekOffset={seekOffset} className="touch:min-w-11" />
        <MediaSeekForwardButton seekOffset={seekOffset} className="touch:min-w-11" />
        <MediaTimeRange className="min-w-0 flex-1" />
        <MediaTimeDisplay showDuration className="tabular-nums" />
        <MediaMuteButton className="touch:min-w-11" />
        <MediaVolumeRange className="@max-sm:hidden" />
        {tracks.length ? <MediaCaptionsButton className="touch:min-w-11" /> : null}
        <MediaPlaybackRateButton rates={playbackRates} className="touch:min-w-11" />
        {!audio ? <MediaFullscreenButton className="touch:min-w-11" /> : null}
      </MediaControlBar>
    </MediaController>
  )
}

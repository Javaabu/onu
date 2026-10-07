"use client"

import * as React from "react"
import { format } from "date-fns"
import { Slider as SliderPrimitive } from "radix-ui"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu, useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { NativeSelect, NativeSelectOption } from "../ui/native-select"
import { useMapEngine } from "./_context"
import { useControllableState, useLatest } from "./_hooks"
import {
  boundsOf,
  formatDistance,
  formatDuration,
  formatLatLng,
  normalizeTrack,
  pathLength,
  trackStateAt,
  travelledPath,
  type TrackFeature,
  type TrackPoint,
} from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MapMarker, MapPolylineShape, MapView } from "./map-view"
import type { MapHandle, MapTone } from "./types"

export interface MapReplayProps {
  /** Points with times (`{ lat, lng, time }`), or a LineString feature with `properties.timestamps`. */
  track: TrackPoint[] | TrackFeature
  /** Playback time (epoch ms). */
  time?: number
  defaultTime?: number
  onTimeChange?: (time: number) => void
  playing?: boolean
  defaultPlaying?: boolean
  onPlayingChange?: (playing: boolean) => void
  /** Speed multipliers offered. Default `[1, 10, 60, 300]`. */
  speeds?: number[]
  /** Starting speed. Default 60× (one minute per second). */
  defaultSpeed?: number
  /** Keep the moving marker in view. Default `true`. */
  follow?: boolean
  /** Name of the tracked object, for the marker and announcements. */
  title?: string
  tone?: MapTone
  label?: string
  className?: string
  classNames?: { root?: string; map?: string; controls?: string; scrubber?: string; details?: string }
  ref?: React.Ref<HTMLDivElement>
}

const SECOND = 1000

function MapReplayInner({
  track: trackInput,
  time: timeProp,
  defaultTime,
  onTimeChange,
  playing: playingProp,
  defaultPlaying = false,
  onPlayingChange,
  speeds = [1, 10, 60, 300],
  defaultSpeed = 60,
  follow = true,
  title,
  tone = "primary",
  label,
  className,
  classNames,
  ref,
}: MapReplayProps) {
  const { t, locale } = useTranslation()
  const { dir } = useOnu()
  const { adapter } = useMapEngine()
  const Trail = adapter.Trail
  const track = React.useMemo(() => normalizeTrack(trackInput), [trackInput])
  const start = track[0]?.time ?? 0
  const end = track[track.length - 1]?.time ?? 0
  const [time, setTime] = useControllableState(timeProp, defaultTime ?? start, onTimeChange)
  const [playing, setPlaying] = useControllableState(playingProp, defaultPlaying, onPlayingChange)
  const [speed, setSpeed] = React.useState(speeds.includes(defaultSpeed) ? defaultSpeed : (speeds[0] ?? 1))
  const mapRef = React.useRef<MapHandle>(null)
  // Fit the track once, also when it loads after the first render.
  const initialBounds = boundsOf(track)
  const clamped = Math.min(end, Math.max(start, time))
  const state = trackStateAt(track, clamped)
  const travelled = React.useMemo(() => travelledPath(track, clamped), [track, clamped])
  const atEnd = clamped >= end

  // Playback loop.
  const timeRef = useLatest(clamped)
  const setTimeRef = useLatest(setTime)
  const setPlayingRef = useLatest(setPlaying)
  React.useEffect(() => {
    if (!playing || typeof requestAnimationFrame === "undefined") return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const next = Math.min(end, timeRef.current + (now - last) * speed)
      last = now
      setTimeRef.current(next)
      if (next >= end) setPlayingRef.current(false)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, end, timeRef, setTimeRef, setPlayingRef])

  const position = state.position
  React.useEffect(() => {
    if (follow && playing) mapRef.current?.panTo(position)
  }, [follow, playing, position])

  const togglePlay = () => {
    if (!playing && atEnd) setTime(start)
    setPlaying(!playing)
  }

  const clock = (ms: number) =>
    format(ms, locale.hourCycle === 24 ? "HH:mm:ss" : "h:mm:ss a", { locale: locale.dateFns })
  const fullDate = (ms: number) => format(ms, "PPpp", { locale: locale.dateFns })
  const name = title ?? t("map.trackedObject")
  const elapsed = clamped - start
  const total = end - start
  const distance = pathLength(track)
  const timeText = `${clock(clamped)} (${formatDuration(elapsed / SECOND, t)} / ${formatDuration(total / SECOND, t)})`

  if (track.length < 2) {
    return (
      <p
        ref={ref}
        data-slot="map-replay"
        className={cn("text-sm p-4 rounded-md border border-dashed text-muted-foreground", className)}
      >
        {t("map.noTrack")}
      </p>
    )
  }

  return (
    <div
      ref={ref}
      data-slot="map-replay"
      className={cn("gap-3 min-w-0 @container/replay grid", classNames?.root, className)}
    >
      <MapView
        label={label ?? t("map.replayLabel", { name })}
        bounds={initialBounds}
        mapRef={mapRef}
        className={classNames?.map}
      >
        <MapPolylineShape path={track} tone="muted" dashed width={3} />
        <Trail path={travelled} tone={tone} width={5} />
        <MapMarker position={position} title={name} heading={state.heading} tone={tone} zIndex={10} />
      </MapView>
      <div
        role="group"
        aria-label={t("map.playbackControls")}
        className={cn("gap-3 p-3 grid rounded-lg border", classNames?.controls)}
      >
        <div className="gap-3 flex items-center">
          <Button type="button" size="icon" aria-label={playing ? t("map.pause") : t("map.play")} onClick={togglePlay}>
            <Icon name={playing ? "pause" : atEnd ? "refresh" : "play"} />
          </Button>
          <SliderPrimitive.Root
            dir={dir}
            min={start}
            max={end}
            step={SECOND}
            value={[clamped]}
            onValueChange={([v]) => v !== undefined && setTime(v)}
            className={cn("h-6 min-w-0 relative flex flex-1 touch-none items-center select-none", classNames?.scrubber)}
            data-slot="map-replay-scrubber"
          >
            <SliderPrimitive.Track className="h-1.5 relative grow overflow-hidden rounded-full bg-muted">
              <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              aria-label={t("map.playbackPosition")}
              aria-valuetext={timeText}
              className="size-4 shadow-sm touch:size-6 block rounded-full border-2 border-primary bg-background ring-ring/50 transition-[box-shadow] outline-none hover:ring-3 focus-visible:ring-3"
            />
          </SliderPrimitive.Root>
          <div className="gap-1.5 text-sm flex shrink-0 items-center">
            <span aria-hidden className="@md/replay:inline hidden text-muted-foreground">
              {t("map.speed")}
            </span>
            <NativeSelect
              size="sm"
              value={String(speed)}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label={t("map.speed")}
            >
              {speeds.map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {t("map.speedValue", { value: s })}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div
          className={cn(
            "gap-x-4 gap-y-1 text-xs flex flex-wrap justify-between text-muted-foreground tabular-nums",
            classNames?.details,
          )}
        >
          <span>
            <time
              dateTime={new Date(clamped).toISOString()}
              title={fullDate(clamped)}
              className="font-medium text-foreground"
            >
              {clock(clamped)}
            </time>{" "}
            · {formatLatLng(position, t, locale.numberLocale, 4)}
          </span>
          <span>
            {t("map.trackSummary", {
              points: track.length,
              distance: formatDistance(distance, t, locale.numberLocale),
              duration: formatDuration(total / SECOND, t),
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Plays back a timestamped track: play/pause, speed, and a keyboard-operable
 * scrubber. The travelled trail is drawn with deck.gl on Google Maps.
 */
export function MapReplay(props: MapReplayProps) {
  return (
    <EnsureMapProvider>
      <MapReplayInner {...props} />
    </EnsureMapProvider>
  )
}

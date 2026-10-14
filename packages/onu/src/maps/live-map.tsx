"use client"

import * as React from "react"
import { format } from "date-fns"

import { useAnnouncer } from "../a11y/use-announcer"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { useAnimatedLatLng, useControllableState, useLatest } from "./_hooks"
import { boundsOf, compassDirection, compassLabel, formatLatLng } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MALE, MapMarker, MapView } from "./map-view"
import type { LatLng, MapHandle, MapTone } from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

export interface LiveMapMarker {
  id: string
  position: LatLng
  /** Name shown in the list and used as the marker's accessible name. */
  title: string
  /** Degrees clockwise from north. Shows a heading arrow. */
  heading?: number
  tone?: MapTone
  /** Short status text for the list, e.g. "Under way · 12 kn". */
  status?: React.ReactNode
  /** When the position was reported. */
  updatedAt?: Date | number
}

/** Call `push` with a marker update (new or changed position). Return an unsubscribe function. */
export type LiveMapSubscribe = (push: (marker: LiveMapMarker) => void) => () => void

export interface LiveMapProps {
  /** Current markers (e.g. from polling or a parent's state). */
  markers?: LiveMapMarker[]
  /** Or subscribe to a stream (WebSocket, SSE, Echo). Updates merge into `markers` by id. */
  subscribe?: LiveMapSubscribe
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (id: string | null) => void
  /** Id of the marker the camera follows. */
  followId?: string | null
  defaultFollowId?: string | null
  onFollowChange?: (id: string | null) => void
  /** Glide time between positions in ms (0 = jump). Ignored under reduced motion. */
  animationDuration?: number
  /** Show the list of markers (the text alternative, R14.9). Default `true`. */
  list?: boolean
  label?: string
  center?: LatLng
  zoom?: number
  /** Over the map, e.g. a `MapInfoPanel` for the selected marker. */
  overlay?: React.ReactNode
  className?: string
  classNames?: { root?: string; map?: string; list?: string; item?: string }
  ref?: React.Ref<HTMLDivElement>
}

function AnimatedMarker({
  marker,
  duration,
  selected,
  onSelect,
}: {
  marker: LiveMapMarker
  duration: number
  selected: boolean
  onSelect: () => void
}) {
  const position = useAnimatedLatLng(marker.position, duration)
  return (
    <MapMarker
      position={position}
      title={marker.title}
      heading={marker.heading}
      tone={marker.tone}
      selected={selected}
      onClick={onSelect}
    />
  )
}

function LiveMapInner({
  markers: markersProp = [],
  subscribe,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelect,
  followId: followProp,
  defaultFollowId = null,
  onFollowChange,
  animationDuration = 1000,
  list = true,
  label,
  center,
  zoom,
  overlay,
  className,
  classNames,
  ref,
}: LiveMapProps) {
  const { t, locale } = useTranslation()
  const [streamed, setStreamed] = React.useState<Record<string, LiveMapMarker>>({})
  const [selectedId, setSelectedId] = useControllableState(selectedProp, defaultSelectedId, onSelect)
  const [followId, setFollowId] = useControllableState(followProp, defaultFollowId, onFollowChange)
  const mapRef = React.useRef<MapHandle>(null)
  const { announce, region } = useAnnouncer()

  React.useEffect(() => {
    if (!subscribe) return
    return subscribe((marker) => setStreamed((prev) => ({ ...prev, [marker.id]: marker })))
  }, [subscribe])

  const markers = React.useMemo(() => {
    const byId = new Map(markersProp.map((m) => [m.id, m]))
    for (const m of Object.values(streamed)) byId.set(m.id, { ...byId.get(m.id), ...m })
    return [...byId.values()]
  }, [markersProp, streamed])

  // Without an explicit centre or zoom, fit the markers (once, also when they arrive later).
  const initialBounds = center || zoom !== undefined ? null : boundsOf(markers.map((m) => m.position))

  // Follow mode: keep the followed marker in view as it moves.
  const followed = markers.find((m) => m.id === followId)
  const followedPosition = followed?.position
  React.useEffect(() => {
    if (followedPosition) mapRef.current?.panTo(followedPosition)
  }, [followedPosition])

  const markersRef = useLatest(markers)
  // Centre on the selected marker whenever the selection changes (the list, a parent's
  // `selectedId`, e.g. an external vessel list) — except for a tap on the marker itself,
  // which is already in view. Selecting never turns on follow mode.
  const skipPanFor = React.useRef<string | null | undefined>(undefined)
  const previousSelected = React.useRef(selectedId)
  React.useEffect(() => {
    if (previousSelected.current === selectedId) return
    previousSelected.current = selectedId
    const skip = skipPanFor.current === selectedId
    skipPanFor.current = undefined
    const m = markersRef.current.find((x) => x.id === selectedId)
    if (m && !skip) mapRef.current?.panTo(m.position)
  }, [selectedId, markersRef])

  const select = (id: string | null, fromMap = false) => {
    if (fromMap) skipPanFor.current = id
    setSelectedId(id)
  }

  const toggleFollow = (id: string) => {
    const m = markers.find((x) => x.id === id)
    const next = followId === id ? null : id
    setFollowId(next)
    announce(next && m ? t("map.following", { name: m.title }) : t("map.stoppedFollowing"))
  }

  const time = (value: Date | number | undefined) =>
    value === undefined
      ? null
      : format(value, locale.hourCycle === 24 ? "HH:mm:ss" : "h:mm:ss a", { locale: locale.dateFns })

  return (
    <div
      ref={ref}
      data-slot="live-map"
      className={cn("gap-3 min-w-0 @container/live-map grid", classNames?.root, className)}
    >
      <div className="relative">
        <MapView
          label={label ?? t("map.liveMap")}
          center={followed?.position ?? center ?? MALE}
          zoom={zoom ?? 12}
          bounds={initialBounds}
          mapRef={mapRef}
          className={classNames?.map}
          overlay={
            <>
              {followed ? (
                <div className="top-2 start-2 gap-1 py-1 ps-2.5 pe-1 text-xs shadow-sm absolute z-30 flex items-center rounded-full border bg-background/90">
                  <Icon name="navigation" size="xs" className="text-primary" />
                  <span>{t("map.following", { name: followed.title })}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("map.stopFollowing")}
                    onClick={() => toggleFollow(followed.id)}
                  >
                    <Icon name="close" />
                  </Button>
                </div>
              ) : null}
              {overlay}
            </>
          }
        >
          {markers.map((m) => (
            <AnimatedMarker
              key={m.id}
              marker={m}
              duration={animationDuration}
              selected={m.id === selectedId}
              onSelect={() => select(m.id === selectedId ? null : m.id, true)}
            />
          ))}
        </MapView>
      </div>
      {list ? (
        <section aria-label={t("map.markerList")} className={classNames?.list}>
          {markers.length ? (
            <ul className="divide-y rounded-md border">
              {markers.map((m) => (
                <li
                  key={m.id}
                  className={cn("gap-2 p-2 flex items-center", m.id === selectedId && "bg-muted/50", classNames?.item)}
                >
                  <button
                    type="button"
                    aria-pressed={m.id === selectedId}
                    className="min-w-0 flex-1 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => select(m.id === selectedId ? null : m.id)}
                  >
                    <span className="font-medium text-sm block truncate">{m.title}</span>
                    <span className="text-xs block text-muted-foreground tabular-nums">
                      {formatLatLng(m.position, t, locale.numberLocale, 4)}
                      {m.heading !== undefined ? ` · ${compassLabel(compassDirection(m.heading), t)}` : null}
                      {m.updatedAt !== undefined ? ` · ${time(m.updatedAt)}` : null}
                    </span>
                    {m.status ? <span className="text-xs block">{m.status}</span> : null}
                  </button>
                  <Button
                    type="button"
                    variant={followId === m.id ? "default" : "outline"}
                    size="sm"
                    aria-pressed={followId === m.id}
                    aria-label={t("map.followName", { name: m.title })}
                    onClick={() => toggleFollow(m.id)}
                  >
                    <Icon name="navigation" />
                    <span className="@md/live-map:inline hidden">{t("map.follow")}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm p-3 rounded-md border border-dashed text-muted-foreground">{t("map.noMarkers")}</p>
          )}
        </section>
      ) : null}
      {region}
    </div>
  )
}

/**
 * Markers that move as new positions arrive (props or a stream), gliding
 * smoothly between updates, with a follow mode and a list as text alternative.
 */
export function LiveMap(props: LiveMapProps) {
  return (
    <EnsureMapProvider>
      <LiveMapInner {...props} />
    </EnsureMapProvider>
  )
}

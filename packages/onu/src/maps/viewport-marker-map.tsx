"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { useMapEngine } from "./_context"
import { useControllableState, useLatest } from "./_hooks"
import { boundsEqual } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MapMarker, MapView } from "./map-view"
import type { ClusterMarker, LatLng, LatLngBounds, MapHandle, MapViewState } from "./types"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"
import { map as en_map } from "../locales/en/map"

registerEnglish({ common: en_common, map: en_map })

export interface ViewportMarker extends ClusterMarker {
  /** Secondary text for the list. */
  description?: React.ReactNode
}

/** Loads the markers inside `bounds`. Pass `signal` to `fetch` so stale requests are cancelled. */
export type ViewportFetcher<M extends ViewportMarker = ViewportMarker> = (
  bounds: LatLngBounds,
  context: { zoom: number; signal: AbortSignal },
) => Promise<M[]>

export interface ViewportMarkerMapProps<M extends ViewportMarker = ViewportMarker> {
  fetcher: ViewportFetcher<M>
  /** Wait this long after the map stops moving before loading. Default 300 ms. */
  debounce?: number
  /** Group nearby markers into clusters (`@googlemaps/markerclusterer`). Default `true`. */
  cluster?: boolean
  /** Below this zoom nothing is loaded and the user is asked to zoom in. */
  minZoom?: number
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (id: string | null, marker: M | null) => void
  /** Called after each successful load. */
  onLoad?: (markers: M[], bounds: LatLngBounds) => void
  /** Show the list of loaded markers (text alternative, R14.9). Default `true`. */
  list?: boolean
  label?: string
  center?: LatLng
  zoom?: number
  bounds?: LatLngBounds | null
  /** Over the map, e.g. a `MapInfoPanel` for the selected marker. */
  overlay?: React.ReactNode
  className?: string
  classNames?: { root?: string; map?: string; status?: string; list?: string; item?: string }
  ref?: React.Ref<HTMLDivElement>
}

type Status = "idle" | "loading" | "done" | "error" | "zoom"

function ViewportMarkerMapInner<M extends ViewportMarker>({
  fetcher,
  debounce = 300,
  cluster = true,
  minZoom,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelect,
  onLoad,
  list = true,
  label,
  center,
  zoom = 12,
  bounds,
  overlay,
  className,
  classNames,
  ref,
}: ViewportMarkerMapProps<M>) {
  const { t } = useTranslation()
  const { adapter } = useMapEngine()
  const Clusters = adapter.Clusters
  const [markers, setMarkers] = React.useState<M[]>([])
  const [status, setStatus] = React.useState<Status>("idle")
  const [selectedId, setSelectedIdState] = useControllableState<string | null>(selectedProp, defaultSelectedId)
  const mapRef = React.useRef<MapHandle>(null)
  const fetcherRef = useLatest(fetcher)
  const onLoadRef = useLatest(onLoad)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const controller = React.useRef<AbortController | null>(null)
  const lastView = React.useRef<MapViewState | null>(null)
  const [failedView, setFailedView] = React.useState<MapViewState | null>(null)

  const load = React.useCallback(
    (view: MapViewState) => {
      controller.current?.abort()
      if (minZoom !== undefined && view.zoom < minZoom) {
        controller.current = null
        setMarkers([])
        setStatus("zoom")
        return
      }
      const ac = new AbortController()
      controller.current = ac
      setStatus("loading")
      fetcherRef.current(view.bounds, { zoom: view.zoom, signal: ac.signal }).then(
        (result) => {
          if (ac.signal.aborted) return
          setMarkers(result)
          setStatus("done")
          onLoadRef.current?.(result, view.bounds)
        },
        () => {
          if (ac.signal.aborted) return
          setFailedView(view)
          setStatus("error")
        },
      )
    },
    [fetcherRef, onLoadRef, minZoom],
  )

  const onViewChange = (view: MapViewState) => {
    if (lastView.current && boundsEqual(lastView.current.bounds, view.bounds) && lastView.current.zoom === view.zoom)
      return
    lastView.current = view
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => load(view), debounce)
  }

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
      controller.current?.abort()
    },
    [],
  )

  const select = (id: string | null, pan = false) => {
    const marker = markers.find((m) => m.id === id) ?? null
    setSelectedIdState(id)
    onSelect?.(id, marker)
    if (marker && pan) mapRef.current?.panTo(marker.position)
  }

  const statusText =
    status === "loading"
      ? t("map.loadingMarkers")
      : status === "error"
        ? t("map.markersError")
        : status === "zoom"
          ? t("map.zoomInToSee")
          : status === "done"
            ? t("map.markersInView", { count: markers.length })
            : ""

  return (
    <div
      ref={ref}
      data-slot="viewport-marker-map"
      className={cn("gap-3 min-w-0 @container/vmm grid", classNames?.root, className)}
    >
      <MapView
        label={label ?? t("map.markerMap")}
        center={center}
        zoom={zoom}
        bounds={bounds}
        mapRef={mapRef}
        onViewChange={onViewChange}
        className={classNames?.map}
        overlay={
          <>
            {status === "loading" ? (
              <div className="top-2 end-2 gap-1.5 px-2.5 py-1 text-xs shadow-sm absolute z-30 flex items-center rounded-full border bg-background/90">
                <Spinner className="size-3" />
                {t("map.loadingMarkers")}
              </div>
            ) : null}
            {overlay}
          </>
        }
      >
        {cluster ? (
          <Clusters
            markers={markers}
            selectedId={selectedId}
            onMarkerClick={(id) => select(id === selectedId ? null : id)}
          />
        ) : (
          markers.map((m) => (
            <MapMarker
              key={m.id}
              position={m.position}
              title={m.title}
              tone={m.tone}
              selected={m.id === selectedId}
              onClick={() => select(m.id === selectedId ? null : m.id)}
            />
          ))
        )}
      </MapView>
      <div className={cn("gap-2 text-sm flex items-center", classNames?.status)}>
        <p aria-live="polite" className={cn("text-muted-foreground", status === "error" && "text-destructive")}>
          {statusText}
        </p>
        {status === "error" && failedView ? (
          <Button type="button" variant="outline" size="sm" onClick={() => load(failedView)}>
            <Icon name="refresh" />
            {t("common.retry")}
          </Button>
        ) : null}
      </div>
      {list && markers.length ? (
        <ul
          aria-label={t("map.markerList")}
          className={cn("max-h-72 divide-y overflow-auto rounded-md border", classNames?.list)}
        >
          {markers.map((m) => (
            <li key={m.id} className={classNames?.item}>
              <button
                type="button"
                aria-pressed={m.id === selectedId}
                className={cn(
                  "gap-0.5 px-3 py-2 text-sm flex w-full flex-col text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  m.id === selectedId && "bg-muted",
                )}
                onClick={() => select(m.id === selectedId ? null : m.id, true)}
              >
                <span className="font-medium">{m.title}</span>
                {m.description ? <span className="text-xs text-muted-foreground">{m.description}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/**
 * Loads markers for the visible area through your `fetcher` (debounced, with
 * stale requests aborted) and clusters them. Lists what is in view as a text
 * alternative.
 */
export function ViewportMarkerMap<M extends ViewportMarker = ViewportMarker>(props: ViewportMarkerMapProps<M>) {
  return (
    <EnsureMapProvider>
      <ViewportMarkerMapInner {...props} />
    </EnsureMapProvider>
  )
}

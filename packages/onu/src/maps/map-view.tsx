"use client"

import * as React from "react"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { useMapEngine } from "./_context"
import { EnsureMapProvider } from "./map-provider"
import type {
  AdapterCircleProps,
  AdapterMarkerProps,
  AdapterPolygonProps,
  AdapterPolylineProps,
  LatLng,
  LatLngBounds,
  MapHandle,
  MapViewState,
} from "./types"

/** Malé, the default centre. */
export const MALE: LatLng = { lat: 4.1755, lng: 73.5093 }

export interface MapViewProps {
  /** Accessible name of the map region. Defaults to "Map". */
  label?: string
  /** Initial centre. Defaults to Malé. */
  center?: LatLng
  /** Initial zoom. */
  zoom?: number
  /** Fit these bounds initially (wins over `center` / `zoom`). */
  bounds?: LatLngBounds | null
  /** Called with the clicked point. */
  onMapClick?: (position: LatLng) => void
  /** Called when the camera stops moving. */
  onViewChange?: (view: MapViewState) => void
  /** Imperative camera control: `panTo`, `fitBounds`, `getView`. */
  mapRef?: React.Ref<MapHandle>
  /** Show the engine's zoom / map-type controls. */
  controls?: boolean
  /** `cooperative` (default) needs two fingers or Ctrl+scroll, so the page still scrolls. */
  gestureHandling?: "cooperative" | "greedy" | "none" | "auto"
  className?: string
  classNames?: { root?: string; map?: string }
  /** Markers, shapes and layers. */
  children?: React.ReactNode
  /** Content laid over the map frame (not part of the engine), e.g. a `MapInfoPanel` or legend. */
  overlay?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function MapViewInner({
  label,
  center = MALE,
  zoom = 12,
  bounds,
  onMapClick,
  onViewChange,
  mapRef,
  controls,
  gestureHandling,
  className,
  classNames,
  children,
  overlay,
  ref,
}: MapViewProps) {
  const { t } = useTranslation()
  const { adapter, colorScheme, mapId, language } = useMapEngine()
  const Engine = adapter.Map
  return (
    <div
      ref={ref}
      data-slot="map-view"
      data-engine={adapter.name}
      className={cn(
        "h-72 sm:h-80 relative w-full overflow-hidden rounded-lg border bg-muted",
        classNames?.root,
        className,
      )}
    >
      <Engine
        label={label ?? t("map.map")}
        defaultCenter={center}
        defaultZoom={zoom}
        defaultBounds={bounds ?? undefined}
        colorScheme={colorScheme}
        mapId={mapId}
        language={language}
        onClick={onMapClick}
        onViewChange={onViewChange}
        controls={controls}
        gestureHandling={gestureHandling}
        handleRef={mapRef}
        className={classNames?.map}
      >
        {children}
      </Engine>
      {overlay}
    </div>
  )
}

/**
 * A map on the configured engine: Google Maps when an API key is set, otherwise
 * a labelled schematic preview. Put `MapMarker`, `MapPolygonShape`, … inside.
 */
export function MapView(props: MapViewProps) {
  return (
    <EnsureMapProvider>
      <MapViewInner {...props} />
    </EnsureMapProvider>
  )
}

export type MapMarkerProps = AdapterMarkerProps

/** A pin (or heading arrow) on a `MapView`. Focusable when it has `onClick` or is draggable. */
export function MapMarker(props: MapMarkerProps) {
  const { adapter } = useMapEngine()
  const Marker = adapter.Marker
  return <Marker {...props} />
}

export type MapCircleShapeProps = AdapterCircleProps

/** A circle (centre + radius in metres), optionally with drag handles. */
export function MapCircleShape(props: MapCircleShapeProps) {
  const { adapter } = useMapEngine()
  const Circle = adapter.Circle
  return <Circle {...props} />
}

export type MapPolygonShapeProps = AdapterPolygonProps

/** A filled polygon. */
export function MapPolygonShape(props: MapPolygonShapeProps) {
  const { adapter } = useMapEngine()
  const Polygon = adapter.Polygon
  return <Polygon {...props} />
}

export type MapPolylineShapeProps = AdapterPolylineProps

/** A line through points. */
export function MapPolylineShape(props: MapPolylineShapeProps) {
  const { adapter } = useMapEngine()
  const Polyline = adapter.Polyline
  return <Polyline {...props} />
}

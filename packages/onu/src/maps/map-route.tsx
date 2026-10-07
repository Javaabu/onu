"use client"

import type * as React from "react"

import { useFormField, useFormFieldControl } from "../components/form/form-field"
import { useTranslation } from "../providers/onu-provider"
import { useControllableState } from "./_hooks"
import { ShapeEditor, useShapesValue, type ShapeEditorClassNames } from "./_shape-editor"
import {
  formatDistance,
  lineStringToPath,
  pathLength,
  pathToLineString,
  type GeoJsonFeature,
  type GeoJsonLineString,
} from "./geo"
import { EnsureMapProvider } from "./map-provider"
import type { DrawShape, LatLng, MapTone } from "./types"

export type RouteFeature = GeoJsonFeature<GeoJsonLineString>

export interface MapRouteProps {
  /** GeoJSON LineString feature. `null` when no route is drawn. */
  value?: RouteFeature | null
  defaultValue?: RouteFeature | null
  onChange?: (value: RouteFeature | null) => void
  /** Called with the route length in metres whenever it changes. */
  onDistanceChange?: (meters: number) => void
  /** Submits the GeoJSON as a JSON string. */
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  tone?: MapTone
  label?: string
  center?: LatLng
  zoom?: number
  className?: string
  classNames?: ShapeEditorClassNames
  ref?: React.Ref<HTMLDivElement>
}

const ROUTE_ID = "route"

function toShapes(value: RouteFeature | null): DrawShape[] {
  const path = lineStringToPath(value)
  return path.length ? [{ id: value?.id !== undefined ? String(value.id) : ROUTE_ID, path }] : []
}

function MapRouteInner(props: MapRouteProps) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    onDistanceChange,
    tone,
    label,
    center,
    zoom,
    className,
    classNames,
    ref,
  } = props
  const { t, locale } = useTranslation()
  const field = useFormField()
  const control = useFormFieldControl({ name: props.name, disabled: props.disabled, required: props.required })
  const [value, setValue] = useControllableState<RouteFeature | null>(valueProp, defaultValue, (v) => {
    onChange?.(v)
    onDistanceChange?.(pathLength(lineStringToPath(v)))
  })
  const fromShapes = (shapes: DrawShape[], previous: RouteFeature | null): RouteFeature | null => {
    const shape = shapes[0]
    const feature = shape ? pathToLineString(shape.path) : null
    if (!feature) return null
    return { ...feature, id: shape!.id, properties: previous?.properties ?? {} }
  }
  const [shapes, setShapes] = useShapesValue(value, setValue, toShapes, fromShapes)

  return (
    <>
      <ShapeEditor
        ref={ref}
        kind="linestring"
        shapes={shapes}
        onShapesChange={setShapes}
        multiple={false}
        disabled={!!control.disabled}
        tone={tone}
        label={label ?? t("map.routeLabel")}
        groupLabelledBy={field?.labelId}
        center={center}
        zoom={zoom}
        minPoints={2}
        measure={(s) => t("map.distance", { distance: formatDistance(pathLength(s.path), t, locale.numberLocale) })}
        itemLabel={() => t("map.route")}
        className={className}
        classNames={classNames}
      />
      {control.name ? (
        <input type="hidden" id={props.id} name={control.name} value={value ? JSON.stringify(value) : ""} />
      ) : null}
    </>
  )
}

/** Draw a route as a line (patrol path, ferry line, delivery route). Its length is measured with turf. */
export function MapRoute(props: MapRouteProps) {
  return (
    <EnsureMapProvider>
      <MapRouteInner {...props} />
    </EnsureMapProvider>
  )
}

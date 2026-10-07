"use client"

import type * as React from "react"

import { useFormField, useFormFieldControl } from "../components/form/form-field"
import { useTranslation } from "../providers/onu-provider"
import { useControllableState } from "./_hooks"
import { ShapeEditor, useShapesValue, type ShapeEditorClassNames } from "./_shape-editor"
import { formatArea, polygonArea, polygonsToShapes, shapesToPolygons, type PolygonCollection } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import type { DrawShape, LatLng, MapTone } from "./types"

export interface MapPolygonProps {
  /** GeoJSON FeatureCollection of Polygons. `null` when empty. */
  value?: PolygonCollection | null
  defaultValue?: PolygonCollection | null
  onChange?: (value: PolygonCollection | null) => void
  /** Submits the GeoJSON as a JSON string. */
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  /** Allow several polygons. Default `true`. */
  multiple?: boolean
  tone?: MapTone
  /** Accessible name of the map. */
  label?: string
  center?: LatLng
  zoom?: number
  className?: string
  classNames?: ShapeEditorClassNames
  ref?: React.Ref<HTMLDivElement>
}

function toPolygons(shapes: DrawShape[], previous: PolygonCollection | null) {
  const collection = shapesToPolygons(shapes, previous)
  return collection.features.length ? collection : null
}

function MapPolygonInner(props: MapPolygonProps) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    multiple = true,
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
  const [value, setValue] = useControllableState<PolygonCollection | null>(valueProp, defaultValue, onChange)
  const [shapes, setShapes] = useShapesValue(value, setValue, polygonsToShapes, toPolygons)
  const totalArea = shapes.reduce((sum, s) => sum + polygonArea(s.path), 0)

  return (
    <>
      <ShapeEditor
        ref={ref}
        kind="polygon"
        shapes={shapes}
        onShapesChange={setShapes}
        multiple={multiple}
        disabled={!!control.disabled}
        tone={tone}
        label={label ?? t("map.polygonLabel")}
        groupLabelledBy={field?.labelId}
        center={center}
        zoom={zoom}
        minPoints={3}
        measure={(s) => formatArea(polygonArea(s.path), t, locale.numberLocale)}
        total={t("map.totalArea", { area: formatArea(totalArea, t, locale.numberLocale) })}
        itemLabel={(i) => t("map.polygonName", { index: i + 1 })}
        className={className}
        classNames={classNames}
      />
      {control.name ? (
        <input type="hidden" id={props.id} name={control.name} value={value ? JSON.stringify(value) : ""} />
      ) : null}
    </>
  )
}

/**
 * Draw and edit polygons (zones, plots, service areas). The value is a GeoJSON
 * FeatureCollection; areas are measured with turf. Every point can also be
 * added, removed and reviewed with the keyboard.
 */
export function MapPolygon(props: MapPolygonProps) {
  return (
    <EnsureMapProvider>
      <MapPolygonInner {...props} />
    </EnsureMapProvider>
  )
}

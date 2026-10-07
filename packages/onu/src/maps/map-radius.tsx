"use client"

import * as React from "react"

import { useFormField, useFormFieldControl } from "../components/form/form-field"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Label } from "../ui/label"
import { CoordinateFields } from "./_coordinate-fields"
import { useAnnouncer, useControllableState } from "./_hooks"
import { formatArea, formatDistance, formatLatLng, roundLatLng } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MALE, MapCircleShape, MapView } from "./map-view"
import type { LatLng, MapHandle, MapTone } from "./types"

export interface MapRadiusValue {
  center: LatLng
  /** Metres. */
  radius: number
}

export interface MapRadiusProps {
  value?: MapRadiusValue | null
  defaultValue?: MapRadiusValue | null
  onChange?: (value: MapRadiusValue | null) => void
  /** Submits `name[lat]`, `name[lng]` and `name[radius]` (metres). */
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  /** Radius used when a centre is first placed. Default 500 m. */
  defaultRadius?: number
  /** Smallest radius in metres. Default 10. */
  min?: number
  /** Largest radius in metres. Default 50 000. */
  max?: number
  /** Step for the radius input. Default 10. */
  step?: number
  tone?: MapTone
  label?: string
  center?: LatLng
  zoom?: number
  className?: string
  classNames?: { root?: string; map?: string; fields?: string; summary?: string }
  ref?: React.Ref<HTMLDivElement>
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function MapRadiusInner(props: MapRadiusProps) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    defaultRadius = 500,
    min = 10,
    max = 50_000,
    step = 10,
    tone = "primary",
    label,
    center = MALE,
    zoom = 12,
    className,
    classNames,
    ref,
  } = props
  const { t, locale } = useTranslation()
  const field = useFormField()
  const control = useFormFieldControl({
    id: props.id,
    name: props.name,
    disabled: props.disabled,
    required: props.required,
  })
  const disabled = !!control.disabled
  const [value, setValue] = useControllableState<MapRadiusValue | null>(valueProp, defaultValue, onChange)
  const [radiusText, setRadiusText] = React.useState<string | null>(null)
  const mapRef = React.useRef<MapHandle>(null)
  const { message, announce } = useAnnouncer()
  const radiusId = React.useId()

  const commit = (next: MapRadiusValue | null) => {
    if (disabled) return
    const v = next ? { center: roundLatLng(next.center), radius: clamp(Math.round(next.radius), min, max) } : null
    setValue(v)
    announce(
      v
        ? t("map.radiusSet", {
            radius: formatDistance(v.radius, t, locale.numberLocale),
            location: formatLatLng(v.center, t, locale.numberLocale, 5),
          })
        : t("map.locationCleared"),
    )
  }

  const radius = value?.radius ?? defaultRadius
  const shownRadius = radiusText ?? String(radius)

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={field?.labelId}
      aria-label={field ? undefined : (label ?? t("map.radiusLabel"))}
      data-slot="map-radius"
      className={cn("gap-2 min-w-0 @container/map-radius grid", classNames?.root, className)}
    >
      <MapView
        label={label ?? t("map.radiusLabel")}
        center={value?.center ?? center}
        zoom={zoom}
        mapRef={mapRef}
        onMapClick={disabled ? undefined : (p) => commit({ center: p, radius })}
        className={classNames?.map}
      >
        {value ? (
          <MapCircleShape
            center={value.center}
            radius={value.radius}
            tone={tone}
            editable={!disabled}
            onChange={(next) => commit(next)}
          />
        ) : null}
      </MapView>
      {disabled ? null : <p className="text-xs text-muted-foreground">{t("map.radiusHint")}</p>}
      <div className={cn("gap-2 @lg/map-radius:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid", classNames?.fields)}>
        <CoordinateFields
          id={control.id as string | undefined}
          value={value?.center ?? null}
          onChange={(p) => {
            commit({ center: p, radius })
            mapRef.current?.panTo(p)
          }}
          disabled={disabled}
          required={!!control.required}
        />
        <div className="min-w-0 gap-1 grid content-start">
          <Label htmlFor={radiusId} className="text-xs text-muted-foreground">
            {t("map.radius")}
          </Label>
          <InputGroup data-disabled={disabled || undefined}>
            <InputGroupInput
              id={radiusId}
              type="number"
              inputMode="numeric"
              dir="ltr"
              min={min}
              max={max}
              step={step}
              value={shownRadius}
              disabled={disabled || !value}
              className="tabular-nums"
              onChange={(e) => {
                setRadiusText(e.target.value)
                const n = Number(e.target.value)
                if (e.target.value !== "" && Number.isFinite(n) && n >= min && n <= max && value)
                  commit({ center: value.center, radius: n })
              }}
              onBlur={() => setRadiusText(null)}
            />
            <InputGroupAddon align="inline-end">{t("map.metersUnit")}</InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      {value ? (
        <div className={cn("gap-x-4 gap-y-1 text-sm flex flex-wrap items-center justify-between", classNames?.summary)}>
          <p className="text-muted-foreground">
            {t("map.radiusSummary", {
              radius: formatDistance(value.radius, t, locale.numberLocale),
              area: formatArea(Math.PI * value.radius ** 2, t, locale.numberLocale),
            })}
          </p>
          {props.required || disabled ? null : (
            <Button type="button" variant="ghost" size="sm" onClick={() => commit(null)}>
              <Icon name="close" />
              {t("common.clear")}
            </Button>
          )}
        </div>
      ) : null}
      {control.name ? (
        <>
          <input type="hidden" name={`${control.name}[lat]`} value={value?.center.lat ?? ""} />
          <input type="hidden" name={`${control.name}[lng]`} value={value?.center.lng ?? ""} />
          <input type="hidden" name={`${control.name}[radius]`} value={value?.radius ?? ""} />
        </>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  )
}

/** A centre and a radius: click to place, drag the handles, or type the numbers. */
export function MapRadius(props: MapRadiusProps) {
  return (
    <EnsureMapProvider>
      <MapRadiusInner {...props} />
    </EnsureMapProvider>
  )
}

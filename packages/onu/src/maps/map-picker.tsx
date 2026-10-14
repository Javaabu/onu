"use client"

import * as React from "react"

import { useFormField, useFormFieldControl } from "../components/form/form-field"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { CoordinateFields } from "./_coordinate-fields"
import { useAnnouncer, useControllableState } from "./_hooks"
import { PlaceSearchBox } from "./_place-search"
import { useMapEngine } from "./_context"
import { formatLatLng, roundLatLng } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MALE, MapMarker, MapView } from "./map-view"
import type { LatLng, MapHandle, PlaceSearch } from "./types"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"
import { map as en_map } from "../locales/en/map"

registerEnglish({ common: en_common, map: en_map })

export interface MapPickerProps {
  /** Controlled value. `null` = nothing picked. */
  value?: LatLng | null
  defaultValue?: LatLng | null
  onChange?: (value: LatLng | null) => void
  /** Submits `name[lat]` and `name[lng]` hidden inputs. */
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  /** Accessible name of the map. */
  label?: string
  /** Where the map opens when nothing is picked. Defaults to Malé. */
  center?: LatLng
  /** Zoom when nothing is picked. */
  zoom?: number
  /**
   * Place search: `true` uses the map engine's geocoder (Google), a function
   * uses your own API, `false` hides the box.
   */
  search?: boolean | PlaceSearch
  /** Type Thaana in the search box. */
  thaana?: ThaanaProp
  /** Show the "Use my location" button (when the browser supports geolocation). */
  locate?: boolean
  /** Show the latitude / longitude fields. Default `true` (keyboard alternative, R14.9). */
  coordinates?: boolean
  /** Show a "Clear" button. Default: when not required. */
  clearable?: boolean
  className?: string
  classNames?: { root?: string; toolbar?: string; search?: string; map?: string; fields?: string }
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  ref?: React.Ref<HTMLDivElement>
}

type LocateState = "idle" | "locating" | "error"

function MapPickerInner(props: MapPickerProps) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    label,
    center = MALE,
    zoom = 11,
    search = true,
    thaana,
    locate = true,
    coordinates = true,
    clearable,
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
    "aria-describedby": props["aria-describedby"],
    "aria-invalid": props["aria-invalid"],
  })
  const disabled = !!control.disabled
  const required = !!control.required
  const { adapter } = useMapEngine()
  const engineSearch = adapter.usePlaceSearch()
  const searchFn = typeof search === "function" ? search : search ? engineSearch : null
  const [value, setValue] = useControllableState<LatLng | null>(valueProp, defaultValue, onChange)
  const mapRef = React.useRef<MapHandle>(null)
  const { message, announce } = useAnnouncer()
  const [locateState, setLocateState] = React.useState<LocateState>("idle")
  const canLocate = locate && typeof navigator !== "undefined" && !!navigator.geolocation

  const pick = (next: LatLng | null, pan = false) => {
    if (disabled) return
    const rounded = next ? roundLatLng(next) : null
    setValue(rounded)
    announce(
      rounded
        ? t("map.locationSet", { location: formatLatLng(rounded, t, locale.numberLocale, 5) })
        : t("map.locationCleared"),
    )
    if (rounded && pan) mapRef.current?.panTo(rounded, Math.max(15, mapRef.current.getView()?.zoom ?? 0))
  }

  const useMyLocation = () => {
    setLocateState("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocateState("idle")
        pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true)
      },
      () => {
        setLocateState("error")
        announce(t("map.locateError"))
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  // Follow a new `center` (e.g. the island chosen in an address) until a point is picked.
  const hasValue = value !== null
  React.useEffect(() => {
    if (!hasValue) mapRef.current?.panTo(center, zoom)
  }, [center.lat, center.lng, zoom, hasValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const showClear = !disabled && (clearable ?? !required) && value !== null

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={field?.labelId}
      aria-label={field ? undefined : (label ?? t("map.pickLocation"))}
      data-slot="map-picker"
      data-disabled={disabled || undefined}
      className={cn("gap-2 min-w-0 @container/map-picker grid", classNames?.root, className)}
    >
      {searchFn || canLocate ? (
        <div className={cn("gap-2 @md/map-picker:flex-row flex flex-col", classNames?.toolbar)}>
          {searchFn ? (
            <PlaceSearchBox
              search={searchFn}
              thaana={thaana}
              disabled={disabled}
              className={cn("min-w-0 flex-1", classNames?.search)}
              onSelect={(place) => pick(place.position, true)}
            />
          ) : null}
          {canLocate ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled || locateState === "locating"}
              onClick={useMyLocation}
              className="shrink-0"
            >
              {locateState === "locating" ? <Spinner /> : <Icon name="locate" />}
              {t("map.useMyLocation")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {locateState === "error" ? <p className="text-sm text-destructive">{t("map.locateError")}</p> : null}
      <MapView
        label={label ?? t("map.pickLocation")}
        center={value ?? center}
        zoom={value ? 15 : zoom}
        mapRef={mapRef}
        onMapClick={disabled ? undefined : (p) => pick(p)}
        className={classNames?.map}
      >
        {value ? (
          <MapMarker
            position={value}
            title={t("map.selectedLocation")}
            draggable={!disabled}
            onDragEnd={(p) => pick(p)}
          />
        ) : null}
      </MapView>
      {disabled ? null : <p className="text-xs text-muted-foreground">{t("map.pickHint")}</p>}
      {coordinates ? (
        <div className={cn("gap-2 flex flex-wrap items-end", classNames?.fields)}>
          <CoordinateFields
            id={control.id as string | undefined}
            value={value}
            onChange={(p) => pick(p, true)}
            disabled={disabled}
            required={required}
            aria-describedby={control["aria-describedby"] as string | undefined}
            aria-invalid={control["aria-invalid"] as boolean | undefined}
            className="min-w-0 flex-1"
          />
          {showClear ? (
            <Button type="button" variant="ghost" disabled={disabled} onClick={() => pick(null)}>
              <Icon name="close" />
              {t("common.clear")}
            </Button>
          ) : null}
        </div>
      ) : showClear ? (
        <Button type="button" variant="ghost" className="justify-self-start" onClick={() => pick(null)}>
          <Icon name="close" />
          {t("common.clear")}
        </Button>
      ) : null}
      {!coordinates && value ? (
        <p className="text-sm tabular-nums">{formatLatLng(value, t, locale.numberLocale, 5)}</p>
      ) : null}
      {control.name ? (
        <>
          <input type="hidden" name={`${control.name}[lat]`} value={value?.lat ?? ""} />
          <input type="hidden" name={`${control.name}[lng]`} value={value?.lng ?? ""} />
        </>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  )
}

/**
 * Pick a point: click the map, drag the marker, search a place, use the
 * device location, or type the coordinates. Submits `name[lat]` / `name[lng]`.
 */
export function MapPicker(props: MapPickerProps) {
  return (
    <EnsureMapProvider>
      <MapPickerInner {...props} />
    </EnsureMapProvider>
  )
}

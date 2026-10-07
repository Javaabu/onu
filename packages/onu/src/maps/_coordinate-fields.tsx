"use client"

import * as React from "react"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { latLngEquals } from "./geo"
import type { LatLng } from "./types"

export interface CoordinateFieldsProps {
  value: LatLng | null
  onChange: (value: LatLng) => void
  disabled?: boolean
  required?: boolean
  /** Id of the latitude input (the field's id inside a FormField). */
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  className?: string
  /** Visually hide the labels (they stay for screen readers). */
  compact?: boolean
}

type Axis = "lat" | "lng"

function format(value: number | undefined) {
  return value === undefined ? "" : String(Number(value.toFixed(6)))
}

function parse(text: string, axis: Axis): number | null {
  const normalized = text.trim().replace(",", ".")
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null
  const n = Number(normalized)
  return Math.abs(n) <= (axis === "lat" ? 90 : 180) ? n : null
}

/**
 * Latitude / longitude inputs: the keyboard and screen-reader alternative to
 * clicking the map (R14.9). Commits as soon as both numbers are valid.
 */
export function CoordinateFields({
  value,
  onChange,
  disabled,
  required,
  id,
  className,
  compact,
  ...aria
}: CoordinateFieldsProps) {
  const { t } = useTranslation()
  const generated = React.useId()
  const baseId = id ?? `coords-${generated}`
  const [draft, setDraft] = React.useState<Record<Axis, string> | null>(null)
  const [shownFor, setShownFor] = React.useState<LatLng | null>(value)
  // A new value from outside (map click, search) replaces whatever is typed.
  if (!latLngEquals(shownFor, value)) {
    setShownFor(value)
    setDraft(null)
  }
  const text = draft ?? { lat: format(value?.lat), lng: format(value?.lng) }

  const update = (axis: Axis, next: string) => {
    const d = { ...text, [axis]: next }
    setDraft(d)
    const lat = parse(d.lat, "lat")
    const lng = parse(d.lng, "lng")
    if (lat !== null && lng !== null) {
      const p = { lat, lng }
      setShownFor(p)
      onChange(p)
    }
  }

  const field = (axis: Axis) => {
    const inputId = axis === "lat" ? baseId : `${baseId}-lng`
    const errorId = `${inputId}-error`
    const invalid = text[axis] !== "" && parse(text[axis], axis) === null
    const describedBy = [aria["aria-describedby"], invalid ? errorId : undefined].filter(Boolean).join(" ") || undefined
    return (
      <div className="min-w-0 gap-1 grid">
        <Label htmlFor={inputId} className={cn("text-xs text-muted-foreground", compact && "sr-only")}>
          {axis === "lat" ? t("map.latitude") : t("map.longitude")}
        </Label>
        <Input
          id={inputId}
          data-slot="input"
          inputMode="decimal"
          autoComplete="off"
          dir="ltr"
          className="font-mono tabular-nums"
          value={text[axis]}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || aria["aria-invalid"] || undefined}
          aria-describedby={describedBy}
          onChange={(e) => update(axis, e.target.value)}
        />
        {invalid ? (
          <p id={errorId} className="text-xs text-destructive">
            {axis === "lat" ? t("map.invalidLatitude") : t("map.invalidLongitude")}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div data-slot="coordinate-fields" className={cn("@container/coords", className)}>
      <div className="gap-2 grid @[16rem]/coords:grid-cols-2">
        {field("lat")}
        {field("lng")}
      </div>
    </div>
  )
}

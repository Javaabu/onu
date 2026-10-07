"use client"

import * as React from "react"
import { move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import { useFormField } from "../components/form/form-field"
import { useFormDisabled } from "../components/form/form-context"
import { TextInput } from "../components/inputs/text-input"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import type { ThaanaProp } from "../thaana/use-thaana-field"
import { Button } from "../ui/button"
import { CoordinateFields } from "./_coordinate-fields"
import { useAnnouncer, useControllableState } from "./_hooks"
import { boundsOf, formatDistance, formatLatLng, pathLength, roundLatLng } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MapMarker, MapPolylineShape, MapView } from "./map-view"
import type { LatLng, MapHandle, MapTone } from "./types"

export interface RouteStop {
  id: string
  label: string
  /** `null` until placed. */
  position: LatLng | null
}

export interface RouteStopEditorProps {
  value?: RouteStop[]
  defaultValue?: RouteStop[]
  onChange?: (stops: RouteStop[]) => void
  /** Submits `name[0][label]`, `name[0][lat]`, `name[0][lng]`, … in order. */
  name?: string
  /** Maximum number of stops. */
  max?: number
  disabled?: boolean
  /** Clicking the map adds a stop there. Default `true`. */
  addOnMapClick?: boolean
  /** Connect the stops with a line. Default `true`. */
  showPath?: boolean
  /** Type Thaana in stop names. */
  thaana?: ThaanaProp
  tone?: MapTone
  label?: string
  center?: LatLng
  zoom?: number
  className?: string
  classNames?: { root?: string; map?: string; list?: string; item?: string; footer?: string }
  ref?: React.Ref<HTMLDivElement>
}

let stopCounter = 0
function newStopId() {
  stopCounter += 1
  return `stop-${Date.now().toString(36)}-${stopCounter}`
}

interface StopRowProps {
  stop: RouteStop
  index: number
  count: number
  disabled: boolean
  expanded: boolean
  thaana?: ThaanaProp
  onToggle: () => void
  onRename: (label: string) => void
  onMove: (to: number) => void
  onRemove: () => void
  onPosition: (p: LatLng) => void
  className?: string
}

function StopRow({
  stop,
  index,
  count,
  disabled,
  expanded,
  thaana,
  onToggle,
  onRename,
  onMove,
  onRemove,
  onPosition,
  className,
}: StopRowProps) {
  const { t, locale } = useTranslation()
  const { ref, handleRef, isDragging } = useSortable({ id: stop.id, index, disabled })
  const number = index + 1
  const name = stop.label || t("map.stopNumber", { index: number })
  const panelId = React.useId()
  return (
    // The sortable ref sits on an inner element: dnd-kit gives it a role, and the <li> must stay a list item.
    <li data-slot="route-stop" data-dragging={isDragging || undefined} className={className}>
      <div ref={ref} className={cn("gap-2 p-2 grid rounded-md border bg-card", isDragging && "shadow-md opacity-60")}>
        <div className="gap-2 flex items-center">
          {disabled ? null : (
            <button
              ref={handleRef}
              type="button"
              aria-label={t("map.reorderStop", { name })}
              className="size-7 touch:size-11 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            >
              <Icon name="grip-vertical" />
            </button>
          )}
          <span
            aria-hidden
            className="size-6 text-xs font-semibold flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground tabular-nums"
          >
            {number}
          </span>
          <TextInput
            aria-label={t("map.stopNameLabel", { index: number })}
            value={stop.label}
            placeholder={t("map.stopNumber", { index: number })}
            onChange={(e) => onRename(e.target.value)}
            disabled={disabled}
            thaana={thaana}
            dir={thaana ? undefined : "auto"}
            className="min-w-0 flex-1"
          />
          {disabled ? null : (
            <div className="gap-0.5 flex shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                aria-label={t("map.moveStopUp", { name })}
                onClick={() => onMove(index - 1)}
              >
                <Icon name="arrow-up" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === count - 1}
                aria-label={t("map.moveStopDown", { name })}
                onClick={() => onMove(index + 1)}
              >
                <Icon name="arrow-down" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("map.removeStop", { name })}
                onClick={onRemove}
              >
                <Icon name="trash" />
              </Button>
            </div>
          )}
        </div>
        <div className="gap-2 ps-9 text-xs flex items-center text-muted-foreground">
          <span className="min-w-0 flex-1 truncate tabular-nums">
            {stop.position ? formatLatLng(stop.position, t, locale.numberLocale, 5) : t("map.notPlaced")}
          </span>
          {disabled ? null : (
            <Button
              type="button"
              variant="link"
              size="xs"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={onToggle}
            >
              {t("map.editCoordinates")}
            </Button>
          )}
        </div>
        {expanded && !disabled ? (
          <div id={panelId} className="ps-9">
            <CoordinateFields value={stop.position} onChange={onPosition} />
          </div>
        ) : null}
      </div>
    </li>
  )
}

function RouteStopEditorInner({
  value: valueProp,
  defaultValue = [],
  onChange,
  name,
  max,
  disabled: disabledProp,
  addOnMapClick = true,
  showPath = true,
  thaana,
  tone = "primary",
  label,
  center,
  zoom,
  className,
  classNames,
  ref,
}: RouteStopEditorProps) {
  const { t, locale } = useTranslation()
  const field = useFormField()
  const formDisabled = useFormDisabled()
  const disabled = disabledProp ?? field?.disabled ?? formDisabled
  const [stops, setStops] = useControllableState<RouteStop[]>(valueProp, defaultValue, onChange)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const mapRef = React.useRef<MapHandle>(null)
  const { message, announce } = useAnnouncer()
  const full = max !== undefined && stops.length >= max
  const placed = stops.flatMap((s) => (s.position ? [s.position] : []))
  // Without an explicit centre or zoom, fit the stops (once, also when they load later).
  const initialBounds = center || zoom !== undefined ? null : boundsOf(placed)
  const nameOf = (s: RouteStop, i: number) => s.label || t("map.stopNumber", { index: i + 1 })

  const update = (id: string, patch: Partial<RouteStop>) =>
    setStops(stops.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const addStop = (position: LatLng | null) => {
    if (full || disabled) return
    const stop: RouteStop = { id: newStopId(), label: "", position: position ? roundLatLng(position) : null }
    setStops([...stops, stop])
    if (!position) setExpandedId(stop.id)
    announce(t("map.stopAdded", { name: t("map.stopNumber", { index: stops.length + 1 }) }))
  }

  const moveStop = (from: number, to: number) => {
    if (to < 0 || to >= stops.length || from === to) return
    const next = [...stops]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item!)
    setStops(next)
    announce(t("map.stopMoved", { name: nameOf(item!, from), position: to + 1, total: stops.length }))
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={field?.labelId}
      aria-label={field ? undefined : (label ?? t("map.stopsLabel"))}
      data-slot="route-stop-editor"
      className={cn("gap-3 min-w-0 @container/stops grid", classNames?.root, className)}
    >
      <div className="gap-3 @3xl/stops:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] grid">
        <MapView
          label={label ?? t("map.stopsLabel")}
          center={center}
          zoom={zoom ?? 12}
          bounds={initialBounds}
          mapRef={mapRef}
          onMapClick={addOnMapClick && !disabled && !full ? (p) => addStop(p) : undefined}
          className={cn("@3xl/stops:h-full @3xl/stops:min-h-96", classNames?.map)}
        >
          {showPath && placed.length > 1 ? <MapPolylineShape path={placed} tone={tone} /> : null}
          {stops.map((s, i) =>
            s.position ? (
              <MapMarker
                key={s.id}
                position={s.position}
                label={String(i + 1)}
                title={t("map.stopMarker", { index: i + 1, name: nameOf(s, i) })}
                tone={tone}
                draggable={!disabled}
                onDragEnd={(p) => update(s.id, { position: roundLatLng(p) })}
              />
            ) : null,
          )}
        </MapView>
        <div className="gap-2 grid content-start">
          {stops.length ? (
            <DragDropProvider
              onDragEnd={(event) => {
                if (event.canceled) return
                const next = move(stops, event)
                if (next !== stops) {
                  const from = stops.findIndex((s) => s.id === event.operation.source?.id)
                  const to = next.findIndex((s) => s.id === event.operation.source?.id)
                  setStops(next)
                  if (from >= 0 && to >= 0 && from !== to)
                    announce(t("map.stopMoved", { name: nameOf(next[to]!, to), position: to + 1, total: next.length }))
                }
              }}
            >
              <ol aria-label={t("map.stopsLabel")} className={cn("gap-2 grid", classNames?.list)}>
                {stops.map((s, i) => (
                  <StopRow
                    key={s.id}
                    stop={s}
                    index={i}
                    count={stops.length}
                    disabled={disabled}
                    thaana={thaana}
                    expanded={expandedId === s.id}
                    onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    onRename={(labelText) => update(s.id, { label: labelText })}
                    onMove={(to) => moveStop(i, to)}
                    onRemove={() => {
                      setStops(stops.filter((x) => x.id !== s.id))
                      announce(t("map.stopRemoved", { name: nameOf(s, i) }))
                    }}
                    onPosition={(p) => {
                      update(s.id, { position: p })
                      mapRef.current?.panTo(p)
                    }}
                    className={classNames?.item}
                  />
                ))}
              </ol>
            </DragDropProvider>
          ) : (
            <p className="text-sm p-3 rounded-md border border-dashed text-muted-foreground">{t("map.noStops")}</p>
          )}
          <div className={cn("gap-2 flex flex-wrap items-center justify-between", classNames?.footer)}>
            {disabled ? null : (
              <Button type="button" variant="outline" size="sm" disabled={full} onClick={() => addStop(null)}>
                <Icon name="add" />
                {t("map.addStop")}
              </Button>
            )}
            {placed.length > 1 ? (
              <p className="text-sm text-muted-foreground tabular-nums">
                {t("map.distance", { distance: formatDistance(pathLength(placed), t, locale.numberLocale) })}
              </p>
            ) : null}
          </div>
          {addOnMapClick && !disabled ? (
            <p className="text-xs text-muted-foreground">
              {full ? t("map.maxStops", { count: max }) : t("map.stopsHint")}
            </p>
          ) : null}
        </div>
      </div>
      {name
        ? stops.map((s, i) => (
            <React.Fragment key={s.id}>
              <input type="hidden" name={`${name}[${i}][label]`} value={s.label} />
              <input type="hidden" name={`${name}[${i}][lat]`} value={s.position?.lat ?? ""} />
              <input type="hidden" name={`${name}[${i}][lng]`} value={s.position?.lng ?? ""} />
            </React.Fragment>
          ))
        : null}
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  )
}

/**
 * An ordered list of stops synced with numbered markers: add by clicking the
 * map or with coordinates, rename, drag (or use the arrow buttons) to reorder,
 * and remove.
 */
export function RouteStopEditor(props: RouteStopEditorProps) {
  return (
    <EnsureMapProvider>
      <RouteStopEditorInner {...props} />
    </EnsureMapProvider>
  )
}

"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { CoordinateFields } from "./_coordinate-fields"
import { useMapEngine } from "./_context"
import { useAnnouncer } from "./_hooks"
import { boundsOf, formatLatLng } from "./geo"
import { MALE, MapView } from "./map-view"
import type { DrawShape, LatLng, MapHandle, MapTone } from "./types"

export interface ShapeEditorClassNames {
  root?: string
  toolbar?: string
  map?: string
  list?: string
  summary?: string
}

export interface ShapeEditorProps {
  kind: "polygon" | "linestring"
  shapes: DrawShape[]
  onShapesChange: (shapes: DrawShape[]) => void
  /** Allow more than one shape. */
  multiple: boolean
  disabled?: boolean
  tone?: MapTone
  label: string
  center?: LatLng
  zoom?: number
  /** Measurement shown for each shape (area or length). */
  measure: (shape: DrawShape) => string
  /** Total measurement across shapes (shown when there is more than one). */
  total?: string
  /** Name of a shape in lists, e.g. "Zone 2". */
  itemLabel: (index: number) => string
  /** Points needed for a complete shape. */
  minPoints: number
  /** Optional name/label input or extra content shown per shape. */
  renderShapeExtra?: (shape: DrawShape, index: number) => React.ReactNode
  className?: string
  classNames?: ShapeEditorClassNames
  ref?: React.Ref<HTMLDivElement>
  groupLabelledBy?: string
}

/** Keeps editable shapes (including unfinished ones) in sync with a GeoJSON value. */
export function useShapesValue<V>(
  value: V | null,
  setValue: (value: V | null) => void,
  toShapes: (value: V | null) => DrawShape[],
  fromShapes: (shapes: DrawShape[], previous: V | null) => V | null,
) {
  const [shapes, setShapes] = React.useState<DrawShape[]>(() => toShapes(value))
  const [synced, setSynced] = React.useState<V | null>(value)
  if (value !== synced) {
    // A new value from outside: replace the shapes unless it is what they already produce.
    setSynced(value)
    if (JSON.stringify(fromShapes(shapes, value)) !== JSON.stringify(value)) setShapes(toShapes(value))
  }
  const update = (next: DrawShape[]) => {
    setShapes(next)
    const v = fromShapes(next, value)
    setSynced(v)
    setValue(v)
  }
  return [shapes, update] as const
}

type Mode = "view" | "draw" | "edit"

let shapeCounter = 0
function newShapeId() {
  shapeCounter += 1
  return `shape-${Date.now().toString(36)}-${shapeCounter}`
}

/**
 * Shared editor behind MapPolygon and MapRoute: draws with the engine's
 * drawing tool (terra-draw on Google) and offers a full keyboard alternative —
 * a list of shapes and their points, with coordinate entry (R14.9).
 */
export function ShapeEditor({
  kind,
  shapes,
  onShapesChange,
  multiple,
  disabled,
  tone = "primary",
  label,
  center = MALE,
  zoom = 13,
  measure,
  total,
  itemLabel,
  minPoints,
  renderShapeExtra,
  className,
  classNames,
  ref,
  groupLabelledBy,
}: ShapeEditorProps) {
  const { t, locale } = useTranslation()
  const { adapter } = useMapEngine()
  const Draw = adapter.Draw
  const [mode, setMode] = React.useState<Mode>("view")
  const [selectedId, setSelectedId] = React.useState<string | null>(shapes[0]?.id ?? null)
  const [newPoint, setNewPoint] = React.useState<LatLng | null>(null)
  const mapRef = React.useRef<MapHandle>(null)
  const { message, announce } = useAnnouncer()
  const [initialBounds] = React.useState(() => boundsOf(shapes.flatMap((s) => s.path)))

  const selected = shapes.find((s) => s.id === selectedId) ?? (multiple ? undefined : shapes[0])
  const canAddShape = multiple || shapes.length === 0
  const effectiveMode: Mode = disabled ? "view" : mode

  const change = (next: DrawShape[], announcement?: string) => {
    onShapesChange(next)
    if (announcement) announce(announcement)
  }

  const onDrawChange = (next: DrawShape[]) => {
    const added = next.find((s) => !shapes.some((p) => p.id === s.id))
    if (added) setSelectedId(added.id)
    change(next)
  }

  const toggleMode = (target: Mode) => {
    const next = mode === target ? "view" : target
    setMode(next)
    announce(
      next === "draw"
        ? t(kind === "polygon" ? "map.drawPolygonHint" : "map.drawRouteHint")
        : next === "edit"
          ? t("map.editHint")
          : t("map.drawingStopped"),
    )
  }

  const addShape = () => {
    const shape = { id: newShapeId(), path: [] }
    setSelectedId(shape.id)
    change([...shapes, shape], t("map.shapeAdded", { name: itemLabel(shapes.length) }))
  }

  const removeShape = (id: string) => {
    const index = shapes.findIndex((s) => s.id === id)
    const next = shapes.filter((s) => s.id !== id)
    if (selectedId === id) setSelectedId(next[0]?.id ?? null)
    change(next, t("map.shapeRemoved", { name: itemLabel(index) }))
  }

  const addPoint = () => {
    if (!newPoint) return
    let target = selected
    let next = shapes
    if (!target) {
      target = { id: newShapeId(), path: [] }
      next = [...shapes, target]
      setSelectedId(target.id)
    }
    const id = target.id
    change(
      next.map((s) => (s.id === id ? { ...s, path: [...s.path, newPoint] } : s)),
      t("map.pointAdded", { index: target.path.length + 1 }),
    )
    mapRef.current?.panTo(newPoint)
    setNewPoint(null)
  }

  const removePoint = (shapeId: string, index: number) =>
    change(
      shapes.map((s) => (s.id === shapeId ? { ...s, path: s.path.filter((_, i) => i !== index) } : s)),
      t("map.pointRemoved", { index: index + 1 }),
    )

  const movePoint = (shapeId: string, index: number, delta: -1 | 1) =>
    change(
      shapes.map((s) => {
        if (s.id !== shapeId) return s
        const path = [...s.path]
        const target = index + delta
        if (target < 0 || target >= path.length) return s
        ;[path[index], path[target]] = [path[target]!, path[index]!]
        return { ...s, path }
      }),
    )

  const fit = () => {
    const b = boundsOf(shapes.flatMap((s) => s.path))
    if (b) mapRef.current?.fitBounds(b)
  }

  const drawLabel = kind === "polygon" ? t("map.drawPolygon") : t("map.drawRoute")

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={groupLabelledBy}
      aria-label={groupLabelledBy ? undefined : label}
      data-slot={kind === "polygon" ? "map-polygon" : "map-route"}
      data-mode={effectiveMode}
      className={cn("gap-2 min-w-0 @container/shape-editor grid", classNames?.root, className)}
    >
      {disabled ? null : (
        <div
          role="toolbar"
          aria-label={t("map.drawingTools")}
          className={cn("gap-1.5 flex flex-wrap", classNames?.toolbar)}
        >
          <Button
            type="button"
            variant={mode === "draw" ? "default" : "outline"}
            aria-pressed={mode === "draw"}
            disabled={!canAddShape && mode !== "draw"}
            onClick={() => toggleMode("draw")}
          >
            <Icon name={kind === "polygon" ? "polygon" : "route"} />
            {mode === "draw" ? t("common.done") : drawLabel}
          </Button>
          <Button
            type="button"
            variant={mode === "edit" ? "default" : "outline"}
            aria-pressed={mode === "edit"}
            disabled={!shapes.length}
            onClick={() => toggleMode("edit")}
          >
            <Icon name="edit" />
            {mode === "edit" ? t("common.done") : t("map.editPoints")}
          </Button>
          <Button type="button" variant="ghost" disabled={!shapes.some((s) => s.path.length)} onClick={fit}>
            <Icon name="maximize" />
            {t("map.fitToShapes")}
          </Button>
        </div>
      )}
      <MapView
        label={label}
        center={center}
        zoom={zoom}
        bounds={initialBounds}
        mapRef={mapRef}
        className={classNames?.map}
      >
        <Draw
          kind={kind}
          shapes={shapes}
          onChange={onDrawChange}
          onFinish={() => {
            if (!multiple) setMode("view")
          }}
          mode={effectiveMode}
          selectedId={selected?.id ?? null}
          onSelect={(id) => id && setSelectedId(id)}
          tone={tone}
        />
      </MapView>
      {effectiveMode !== "view" ? (
        <p className="text-xs text-muted-foreground">
          {effectiveMode === "draw"
            ? t(kind === "polygon" ? "map.drawPolygonHint" : "map.drawRouteHint")
            : t("map.editHint")}
        </p>
      ) : null}
      <div className={cn("gap-3 @2xl/shape-editor:grid-cols-2 grid", classNames?.list)}>
        <section
          aria-label={kind === "polygon" ? t("map.shapes") : t("map.routeDetails")}
          className="gap-2 grid content-start"
        >
          {shapes.length ? (
            <ul className="divide-y rounded-md border">
              {shapes.map((s, i) => {
                const complete = s.path.length >= minPoints
                const isSelected = s.id === selected?.id
                return (
                  <li key={s.id} className={cn("gap-2 p-2 flex flex-wrap items-center", isSelected && "bg-muted/50")}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      className="min-w-0 flex-1 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      onClick={() => setSelectedId(s.id)}
                    >
                      <span className="font-medium text-sm block">{itemLabel(i)}</span>
                      <span className="text-xs block text-muted-foreground tabular-nums">
                        {t("map.pointCount", { count: s.path.length })} ·{" "}
                        {complete ? measure(s) : t("map.incomplete", { count: minPoints })}
                      </span>
                    </button>
                    {renderShapeExtra?.(s, i)}
                    {disabled ? null : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("map.removeShape", { name: itemLabel(i) })}
                        onClick={() => removeShape(s.id)}
                      >
                        <Icon name="trash" />
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm p-3 rounded-md border border-dashed text-muted-foreground">
              {kind === "polygon" ? t("map.noShapes") : t("map.noRoute")}
            </p>
          )}
          {multiple && shapes.length > 1 && total ? (
            <p className={cn("text-sm font-medium tabular-nums", classNames?.summary)}>{total}</p>
          ) : null}
          {!disabled && canAddShape && multiple ? (
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={addShape}>
              <Icon name="add" />
              {kind === "polygon" ? t("map.addShape") : t("map.addRoute")}
            </Button>
          ) : null}
        </section>
        {selected || !disabled ? (
          <section aria-label={t("map.points")} className="gap-2 grid content-start">
            {selected?.path.length ? (
              <ol className="max-h-56 text-sm overflow-auto rounded-md border">
                {selected.path.map((p, i) => (
                  <li key={i} className="gap-2 px-2 py-1 flex items-center border-b last:border-b-0">
                    <span className="w-6 text-xs shrink-0 text-muted-foreground tabular-nums">{i + 1}.</span>
                    <span className="min-w-0 text-xs flex-1 truncate font-mono tabular-nums">
                      {formatLatLng(p, t, locale.numberLocale, 5)}
                    </span>
                    {disabled ? null : (
                      <span className="gap-0.5 flex shrink-0">
                        {kind === "linestring" ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={i === 0}
                              aria-label={t("map.movePointUp", { index: i + 1 })}
                              onClick={() => movePoint(selected.id, i, -1)}
                            >
                              <Icon name="chevron-up" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              disabled={i === selected.path.length - 1}
                              aria-label={t("map.movePointDown", { index: i + 1 })}
                              onClick={() => movePoint(selected.id, i, 1)}
                            >
                              <Icon name="chevron-down" />
                            </Button>
                          </>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={t("map.removePoint", { index: i + 1 })}
                          onClick={() => removePoint(selected.id, i)}
                        >
                          <Icon name="close" />
                        </Button>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            ) : null}
            {disabled || (!selected && !canAddShape) ? null : (
              <div className="gap-2 flex flex-wrap items-end">
                <CoordinateFields value={newPoint} onChange={setNewPoint} className="min-w-0 flex-1" />
                <Button type="button" variant="secondary" disabled={!newPoint} onClick={addPoint}>
                  <Icon name="add" />
                  {t("map.addPoint")}
                </Button>
              </div>
            )}
          </section>
        ) : null}
      </div>
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  )
}

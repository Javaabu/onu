"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { toneVar } from "./_colors"
import { MarkerArrow, MarkerPin } from "./_marker-glyphs"
import {
  boundsCenter,
  boundsForView,
  formatLatLng,
  INITIAL_FIT_PADDING,
  isPointBounds,
  project,
  SINGLE_POINT_ZOOM,
  unproject,
  zoomForBounds,
} from "./geo"
import type {
  AdapterCircleProps,
  AdapterClusterProps,
  AdapterDrawProps,
  AdapterHeatmapProps,
  AdapterMapProps,
  AdapterMarkerProps,
  AdapterPolygonProps,
  AdapterPolylineProps,
  AdapterTrailProps,
  LatLng,
  LatLngBounds,
  MapAdapter,
  MapHandle,
} from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

/*
 * The keyless fallback engine: a schematic Web Mercator preview drawn with SVG
 * (no tiles, no network). It renders every shape so demos and forms keep
 * working without a Google Maps API key, and clearly says it is a preview.
 */

interface Camera {
  center: LatLng
  zoom: number
}

interface Viewport {
  width: number
  height: number
  camera: Camera
  /** Container pixel position of a point. */
  toPoint: (p: LatLng) => { x: number; y: number }
  /** Point under a client (screen) position. */
  toLatLng: (clientX: number, clientY: number) => LatLng
  /** Pixels per metre at a latitude. */
  pixelsPerMeter: (lat: number) => number
  /** Move the camera. */
  moveTo: (center: LatLng, zoom: number) => void
}

const ViewportContext = React.createContext<Viewport | null>(null)

function useViewport() {
  const ctx = React.useContext(ViewportContext)
  if (!ctx) throw new Error("Placeholder map shapes must be inside the placeholder Map.")
  return ctx
}

const DEFAULT_SIZE = { width: 640, height: 360 }
const MIN_ZOOM = 2
const MAX_ZOOM = 20
const PAN_STEP = 80

function clampZoom(z: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z))
}

function fit(bounds: LatLngBounds, width: number, height: number, padding = INITIAL_FIT_PADDING): Camera {
  if (isPointBounds(bounds)) return { center: boundsCenter(bounds), zoom: SINGLE_POINT_ZOOM }
  return { center: boundsCenter(bounds), zoom: clampZoom(zoomForBounds(bounds, width, height, padding, 17)) }
}

function PlaceholderMap({
  label,
  defaultCenter,
  defaultZoom,
  defaultBounds,
  onClick,
  onViewChange,
  controls = true,
  handleRef,
  className,
  children,
}: AdapterMapProps) {
  const { t, locale } = useTranslation()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState(DEFAULT_SIZE)
  const [camera, setCamera] = React.useState<Camera>(() =>
    defaultBounds
      ? fit(defaultBounds, DEFAULT_SIZE.width, DEFAULT_SIZE.height)
      : { center: defaultCenter, zoom: defaultZoom },
  )
  const pendingFit = React.useRef<LatLngBounds | undefined>(defaultBounds)
  // Bounds that arrive after the first render (points loaded later) are fitted once too.
  const fitted = React.useRef(!!defaultBounds)
  React.useEffect(() => {
    if (fitted.current || !defaultBounds) return
    fitted.current = true
    setCamera(fit(defaultBounds, size.width, size.height))
  }, [defaultBounds, size])

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize((prev) =>
          prev.width === rect.width && prev.height === rect.height ? prev : { width: rect.width, height: rect.height },
        )
        if (pendingFit.current) {
          setCamera(fit(pendingFit.current, rect.width, rect.height))
          pendingFit.current = undefined
        }
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const centerPx = React.useMemo(() => project(camera.center, camera.zoom), [camera])

  const viewport = React.useMemo<Viewport>(() => {
    const toPoint = (p: LatLng) => {
      const w = project(p, camera.zoom)
      return { x: w.x - centerPx.x + size.width / 2, y: w.y - centerPx.y + size.height / 2 }
    }
    const toLatLng = (clientX: number, clientY: number) => {
      const rect = rootRef.current?.getBoundingClientRect()
      const x = clientX - (rect?.left ?? 0)
      const y = clientY - (rect?.top ?? 0)
      return unproject({ x: centerPx.x + x - size.width / 2, y: centerPx.y + y - size.height / 2 }, camera.zoom)
    }
    const pixelsPerMeter = (lat: number) =>
      (256 * 2 ** camera.zoom) / (40_075_016.686 * Math.cos((lat * Math.PI) / 180))
    const moveTo = (center: LatLng, zoom: number) => setCamera({ center, zoom: clampZoom(zoom) })
    return { width: size.width, height: size.height, camera, toPoint, toLatLng, pixelsPerMeter, moveTo }
  }, [camera, centerPx, size])

  React.useImperativeHandle(
    handleRef,
    (): MapHandle => ({
      panTo: (position, zoom) => setCamera((c) => ({ center: position, zoom: zoom ?? c.zoom })),
      fitBounds: (bounds, padding) => setCamera(fit(bounds, size.width, size.height, padding)),
      getView: () => ({
        center: camera.center,
        zoom: camera.zoom,
        bounds: boundsForView(camera.center, camera.zoom, size.width, size.height),
      }),
    }),
    [camera, size],
  )

  const onViewChangeRef = React.useRef(onViewChange)
  React.useEffect(() => {
    onViewChangeRef.current = onViewChange
  })
  React.useEffect(() => {
    onViewChangeRef.current?.({
      center: camera.center,
      zoom: camera.zoom,
      bounds: boundsForView(camera.center, camera.zoom, size.width, size.height),
    })
  }, [camera, size])

  const panBy = (dx: number, dy: number) =>
    setCamera((c) => {
      const p = project(c.center, c.zoom)
      return { center: unproject({ x: p.x + dx, y: p.y + dy }, c.zoom), zoom: c.zoom }
    })
  const zoomBy = (dz: number) => setCamera((c) => ({ ...c, zoom: clampZoom(c.zoom + dz) }))

  // Drag to pan; a press without movement is a click.
  const drag = React.useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 4) return
    d.moved = true
    d.x = e.clientX
    d.y = e.clientY
    panBy(-dx, -dy)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) onClick?.(viewport.toLatLng(e.clientX, e.clientY))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-PAN_STEP, 0],
      ArrowRight: [PAN_STEP, 0],
      ArrowUp: [0, -PAN_STEP],
      ArrowDown: [0, PAN_STEP],
    }
    const move = moves[e.key]
    if (move) {
      e.preventDefault()
      panBy(move[0], move[1])
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault()
      zoomBy(1)
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault()
      zoomBy(-1)
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the map region pans with the keyboard
    <div
      ref={rootRef}
      role="region"
      aria-label={label}
      aria-roledescription={t("map.mapRole")}
      // Focusable like Google's map region: arrow keys pan and +/- zoom.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-slot="map-placeholder"
      dir="ltr"
      className={cn(
        "relative isolate size-full touch-none overflow-hidden bg-muted/60 outline-none select-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <svg aria-hidden className="inset-0 absolute size-full text-border">
        <defs>
          <pattern
            id="onu-map-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            x={-centerPx.x % 32}
            y={-centerPx.y % 32}
          >
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#onu-map-grid)" />
      </svg>
      <div
        aria-hidden
        data-slot="map-placeholder-surface"
        className={cn("inset-0 absolute", onClick ? "cursor-crosshair" : "cursor-grab")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      />
      <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
      <div
        data-slot="map-placeholder-notice"
        className="inset-x-2 top-2 gap-2 px-2.5 py-1.5 text-xs shadow-xs backdrop-blur-sm pointer-events-none absolute z-30 mx-auto flex w-fit max-w-[calc(100%-1rem)] items-center rounded-md border bg-background/90 text-muted-foreground"
        dir={locale.dir}
      >
        <Icon name="map-pin" size="sm" className="shrink-0" />
        <span>
          <span className="font-medium text-foreground">{t("map.previewTitle")}</span> {t("map.previewMessage")}
        </span>
      </div>
      {controls ? (
        <div className="end-2 bottom-2 gap-1 absolute z-30 flex flex-col" dir={locale.dir}>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="bg-background"
            aria-label={t("map.zoomIn")}
            onClick={() => zoomBy(1)}
          >
            <Icon name="plus" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="bg-background"
            aria-label={t("map.zoomOut")}
            onClick={() => zoomBy(-1)}
          >
            <Icon name="minus" />
          </Button>
        </div>
      ) : null}
      <div
        className="start-2 bottom-2 rounded px-1.5 py-0.5 pointer-events-none absolute z-30 bg-background/80 font-mono text-[0.65rem] text-muted-foreground tabular-nums"
        dir={locale.dir}
      >
        {formatLatLng(camera.center, t, locale.numberLocale, 4)}
      </div>
    </div>
  )
}

/** Moves a point with a pointer, reporting the final position. */
function usePointDrag(enabled: boolean, onEnd?: (p: LatLng) => void, onMove?: (p: LatLng) => void) {
  const { toLatLng } = useViewport()
  const [dragged, setDragged] = React.useState<LatLng | null>(null)
  const active = React.useRef(false)
  const last = React.useRef<LatLng | null>(null)
  const handlers = enabled
    ? {
        onPointerDown: (e: React.PointerEvent<Element>) => {
          if (e.button !== 0) return
          e.stopPropagation()
          active.current = true
          e.currentTarget.setPointerCapture?.(e.pointerId)
        },
        onPointerMove: (e: React.PointerEvent<Element>) => {
          if (!active.current) return
          const p = toLatLng(e.clientX, e.clientY)
          last.current = p
          setDragged(p)
          onMove?.(p)
        },
        onPointerUp: () => {
          if (!active.current) return
          active.current = false
          const p = last.current
          last.current = null
          setDragged(null)
          if (p) onEnd?.(p)
        },
      }
    : {}
  return { dragged, handlers }
}

function PlaceholderMarker({
  position,
  title,
  label,
  tone = "primary",
  selected,
  heading,
  draggable,
  onDragEnd,
  onClick,
  zIndex,
}: AdapterMarkerProps) {
  const { toPoint, width, height } = useViewport()
  const { dragged, handlers } = usePointDrag(!!draggable, onDragEnd)
  const pos = dragged ?? position
  const { x, y } = toPoint(pos)
  if (x < -40 || y < -40 || x > width + 40 || y > height + 40) return null
  const color = toneVar(tone)
  const arrow = heading !== undefined
  const content = arrow ? (
    <MarkerArrow tone={color} heading={heading} />
  ) : (
    <MarkerPin tone={color} label={label} selected={selected} />
  )
  const className = cn(
    "absolute z-20 -translate-x-1/2 rounded-full outline-none",
    arrow ? "-translate-y-1/2" : "-translate-y-full",
    selected && "z-25",
    (onClick || draggable) &&
      "min-h-6 min-w-6 grid cursor-pointer place-items-center focus-visible:ring-3 focus-visible:ring-ring/60",
    draggable && "cursor-grab touch-none active:cursor-grabbing",
  )
  const style = { left: x, top: y, zIndex }
  if (onClick || draggable) {
    return (
      <button
        type="button"
        data-slot="map-marker"
        aria-label={title}
        aria-pressed={onClick && selected !== undefined ? !!selected : undefined}
        title={title}
        className={className}
        style={style}
        onClick={onClick}
        {...handlers}
      >
        {content}
      </button>
    )
  }
  return (
    <div data-slot="map-marker" role="img" aria-label={title} title={title} className={className} style={style}>
      {content}
    </div>
  )
}

function svgPath(points: { x: number; y: number }[], close = false) {
  if (!points.length) return ""
  return `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}${close ? " Z" : ""}`
}

function Layer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden className={cn("inset-0 pointer-events-none absolute size-full overflow-visible", className)}>
      {children}
    </svg>
  )
}

function PlaceholderPolygon({ path, tone = "primary", selected, onClick }: AdapterPolygonProps) {
  const { toPoint } = useViewport()
  const color = toneVar(tone)
  return (
    <Layer className="z-10">
      <path
        d={svgPath(path.map(toPoint), true)}
        style={{ fill: color, stroke: color }}
        fillOpacity={selected ? 0.35 : 0.2}
        strokeWidth={selected ? 3 : 2}
        strokeLinejoin="round"
        className={cn(onClick && "pointer-events-auto cursor-pointer")}
        onClick={onClick}
      />
    </Layer>
  )
}

function PlaceholderPolyline({ path, tone = "primary", dashed, width = 4 }: AdapterPolylineProps) {
  const { toPoint } = useViewport()
  const color = toneVar(tone)
  return (
    <Layer className="z-10">
      <path
        d={svgPath(path.map(toPoint))}
        fill="none"
        className="stroke-background"
        strokeWidth={width + 3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={svgPath(path.map(toPoint))}
        fill="none"
        style={{ stroke: color }}
        strokeWidth={width}
        strokeDasharray={dashed ? `${width * 2} ${width * 2}` : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Layer>
  )
}

function Handle({
  point,
  label,
  onEnd,
  onMove,
}: {
  point: LatLng
  label: string
  onEnd: (p: LatLng) => void
  onMove?: (p: LatLng) => void
}) {
  const { toPoint } = useViewport()
  const { dragged, handlers } = usePointDrag(true, onEnd, onMove)
  const { x, y } = toPoint(dragged ?? point)
  return (
    <div
      aria-hidden
      title={label}
      data-slot="map-handle"
      className="size-3.5 shadow-sm touch:size-5 absolute z-20 -translate-1/2 cursor-grab touch-none rounded-full border-2 border-primary bg-background"
      style={{ left: x, top: y }}
      {...handlers}
    />
  )
}

function PlaceholderCircle({ center, radius, tone = "primary", editable, onChange }: AdapterCircleProps) {
  const { t } = useTranslation()
  const { toPoint, pixelsPerMeter } = useViewport()
  const [live, setLive] = React.useState<{ center: LatLng; radius: number } | null>(null)
  const c = live?.center ?? center
  const r = live?.radius ?? radius
  const p = toPoint(c)
  const px = r * pixelsPerMeter(c.lat)
  const color = toneVar(tone)
  const metersPerDegLng = 111_320 * Math.cos((c.lat * Math.PI) / 180)
  // The radius handle sits on the circle due east of the centre.
  const handlePoint = { lat: c.lat, lng: c.lng + r / metersPerDegLng }
  const radiusFrom = (q: LatLng) => {
    const dx = (q.lng - c.lng) * metersPerDegLng
    const dy = (q.lat - c.lat) * 110_574
    return Math.max(1, Math.round(Math.hypot(dx, dy)))
  }
  return (
    <>
      <Layer className="z-10">
        <circle cx={p.x} cy={p.y} r={px} style={{ fill: color, stroke: color }} fillOpacity={0.15} strokeWidth={2} />
      </Layer>
      {editable ? (
        <>
          <Handle
            point={c}
            label={t("map.dragCentre")}
            onMove={(q) => setLive({ center: q, radius: r })}
            onEnd={(q) => {
              setLive(null)
              onChange?.({ center: q, radius: r })
            }}
          />
          <Handle
            point={handlePoint}
            label={t("map.dragRadius")}
            onMove={(q) => setLive({ center: c, radius: radiusFrom(q) })}
            onEnd={(q) => {
              setLive(null)
              onChange?.({ center: c, radius: radiusFrom(q) })
            }}
          />
        </>
      ) : null}
    </>
  )
}

function PlaceholderDraw({ shapes, onChange, mode, selectedId, onSelect, kind, tone = "primary" }: AdapterDrawProps) {
  const { t } = useTranslation()
  const { toLatLng, toPoint } = useViewport()
  const draftId = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (mode !== "draw") draftId.current = null
  }, [mode])

  const addPoint = (p: LatLng) => {
    const id = draftId.current
    const existing = id ? shapes.find((s) => s.id === id) : undefined
    if (existing) {
      onChange(shapes.map((s) => (s.id === id ? { ...s, path: [...s.path, p] } : s)))
    } else {
      const newId = `shape-${Date.now().toString(36)}`
      draftId.current = newId
      onChange([...shapes, { id: newId, path: [p] }])
      onSelect?.(newId)
    }
  }

  const movePoint = (shapeId: string, index: number, p: LatLng) =>
    onChange(shapes.map((s) => (s.id === shapeId ? { ...s, path: s.path.map((q, i) => (i === index ? p : q)) } : s)))

  return (
    <>
      {shapes.map((s) =>
        kind === "polygon" ? (
          <PlaceholderPolygon
            key={s.id}
            path={s.path}
            tone={tone}
            selected={s.id === selectedId}
            onClick={onSelect ? () => onSelect(s.id) : undefined}
          />
        ) : (
          <PlaceholderPolyline key={s.id} path={s.path} tone={tone} />
        ),
      )}
      {mode === "draw" ? (
        <div
          aria-hidden
          data-slot="map-draw-surface"
          className="inset-0 absolute z-15 cursor-crosshair"
          onClick={(e) => addPoint(toLatLng(e.clientX, e.clientY))}
        />
      ) : null}
      {mode !== "view"
        ? shapes
            .filter((s) => mode === "draw" || !selectedId || s.id === selectedId)
            .flatMap((s) =>
              s.path.map((point, i) =>
                mode === "edit" ? (
                  <Handle
                    key={`${s.id}-${i}`}
                    point={point}
                    label={t("map.vertex", { index: i + 1 })}
                    onEnd={(p) => movePoint(s.id, i, p)}
                  />
                ) : (
                  <div
                    key={`${s.id}-${i}`}
                    aria-hidden
                    className="size-2.5 pointer-events-none absolute z-20 -translate-1/2 rounded-full border-2 border-primary bg-background"
                    style={{ left: toPoint(point).x, top: toPoint(point).y }}
                  />
                ),
              ),
            )
        : null}
    </>
  )
}

function PlaceholderHeatmap({ points, radius, colors, opacity }: AdapterHeatmapProps) {
  const { toPoint } = useViewport()
  const id = React.useId().replace(/:/g, "")
  const max = Math.max(1, ...points.map((p) => p.weight ?? 1))
  const ramp = colors.length ? colors : ["#000000"]
  return (
    <Layer className="z-5">
      <defs>
        {ramp.map((c, i) => (
          <radialGradient key={i} id={`${id}-${i}`}>
            <stop offset="0%" stopColor={c} stopOpacity={0.9} />
            <stop offset="100%" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <g opacity={opacity}>
        {points.map((p, i) => {
          const { x, y } = toPoint(p.position)
          const level = Math.min(ramp.length - 1, Math.floor(((p.weight ?? 1) / max) * (ramp.length - 1)))
          return <circle key={i} cx={x} cy={y} r={radius} fill={`url(#${id}-${level})`} />
        })}
      </g>
    </Layer>
  )
}

function PlaceholderTrail({ path, tone = "primary", width = 4 }: AdapterTrailProps) {
  return <PlaceholderPolyline path={path} tone={tone} width={width} />
}

const CLUSTER_CELL = 56
/** Cluster buttons are 36px; keep their centres at least this far apart. */
const CLUSTER_MIN_GAP = 44

function PlaceholderClusters({ markers, selectedId, onMarkerClick }: AdapterClusterProps) {
  const { t } = useTranslation()
  const { toPoint, camera, moveTo } = useViewport()
  // Simple grid clustering in screen space, like markerclusterer's default.
  const grid = new Map<string, typeof markers>()
  for (const m of markers) {
    const p = toPoint(m.position)
    const key = `${Math.floor(p.x / CLUSTER_CELL)}:${Math.floor(p.y / CLUSTER_CELL)}`
    grid.set(key, [...(grid.get(key) ?? []), m])
  }
  // Grid cells can put two cluster centres closer than a cluster's size, so the buttons
  // overlap (and fail WCAG 2.5.8 target spacing). Merge groups whose centres are too close.
  const groups = [...grid.entries()].map(([key, group]) => ({ key, group }))
  const centre = (group: typeof markers) => {
    const pts = group.map((m) => toPoint(m.position))
    return { x: pts.reduce((n, q) => n + q.x, 0) / pts.length, y: pts.reduce((n, q) => n + q.y, 0) / pts.length }
  }
  for (let merged = true; merged;) {
    merged = false
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = centre(groups[i]!.group)
        const b = centre(groups[j]!.group)
        if (Math.hypot(a.x - b.x, a.y - b.y) < CLUSTER_MIN_GAP) {
          groups[i]!.group = [...groups[i]!.group, ...groups[j]!.group]
          groups.splice(j, 1)
          merged = true
          break outer
        }
      }
    }
  }
  const cells = new Map(groups.map(({ key, group }) => [key, group]))
  return (
    <>
      {[...cells.entries()].map(([key, group]) => {
        if (group.length === 1 || camera.zoom >= MAX_ZOOM || group.some((m) => m.id === selectedId)) {
          return group.map((m) => (
            <PlaceholderMarker
              key={m.id}
              position={m.position}
              title={m.title}
              tone={m.tone}
              selected={m.id === selectedId}
              onClick={onMarkerClick ? () => onMarkerClick(m.id) : undefined}
            />
          ))
        }
        const center = {
          lat: group.reduce((n, m) => n + m.position.lat, 0) / group.length,
          lng: group.reduce((n, m) => n + m.position.lng, 0) / group.length,
        }
        const { x, y } = toPoint(center)
        return (
          <button
            key={key}
            type="button"
            data-slot="map-cluster"
            aria-label={t("map.clusterLabel", { count: group.length })}
            className="size-9 text-xs font-semibold shadow-md absolute z-20 flex -translate-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
            style={{ left: x, top: y }}
            onClick={() => moveTo(center, camera.zoom + 2)}
          >
            {group.length}
          </button>
        )
      })}
    </>
  )
}

/** Keyless schematic engine. Used automatically when no Google Maps API key is configured. */
export const placeholderAdapter: MapAdapter = {
  name: "placeholder",
  available: false,
  Map: PlaceholderMap,
  Marker: PlaceholderMarker,
  Circle: PlaceholderCircle,
  Polygon: PlaceholderPolygon,
  Polyline: PlaceholderPolyline,
  Draw: PlaceholderDraw,
  Heatmap: PlaceholderHeatmap,
  Trail: PlaceholderTrail,
  Clusters: PlaceholderClusters,
  usePlaceSearch: () => null,
  useRouteService: () => null,
}

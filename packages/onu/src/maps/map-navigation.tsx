"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { useMapEngine } from "./_context"
import { useAnnouncer, useControllableState } from "./_hooks"
import { boundsOf, compassLabel, formatDistance, formatDuration, googleDirectionsUrl, straightRoute } from "./geo"
import { EnsureMapProvider } from "./map-provider"
import { MapMarker, MapPolylineShape, MapView } from "./map-view"
import type { LatLng, MapHandle, MapTone, RouteResult, RouteService, RouteStep } from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

export interface NavigationStop {
  id?: string
  position: LatLng
  label: string
}

export interface MapNavigationProps {
  /** Two or more stops, in order. */
  stops: NavigationStop[]
  /**
   * Routing: omitted uses the map engine's service (Google Directions) when
   * available, a function uses your own, `false` always draws straight segments.
   */
  routeService?: RouteService | false
  /** Index of the highlighted step (across all legs). */
  activeStep?: number | null
  defaultActiveStep?: number | null
  onActiveStepChange?: (index: number | null) => void
  /** Called when a route has been computed. */
  onRoute?: (route: RouteResult) => void
  /** Show an "Open in Google Maps" link. Default `true`. */
  externalLink?: boolean
  tone?: MapTone
  label?: string
  className?: string
  classNames?: { root?: string; map?: string; summary?: string; steps?: string; step?: string }
  ref?: React.Ref<HTMLDivElement>
}

const stopLetter = (i: number) => String.fromCharCode(65 + (i % 26))

function MapNavigationInner({
  stops,
  routeService,
  activeStep: activeProp,
  defaultActiveStep = null,
  onActiveStepChange,
  onRoute,
  externalLink = true,
  tone = "primary",
  label,
  className,
  classNames,
  ref,
}: MapNavigationProps) {
  const { t, locale } = useTranslation()
  const { adapter } = useMapEngine()
  const engineService = adapter.useRouteService()
  const service = routeService === false ? null : (routeService ?? engineService)
  const mapRef = React.useRef<MapHandle>(null)
  const [active, setActive] = useControllableState(activeProp, defaultActiveStep, onActiveStepChange)
  const { message, announce } = useAnnouncer()
  const positions = React.useMemo(() => stops.map((s) => s.position), [stops])
  const key = JSON.stringify(positions)
  const [initialBounds] = React.useState(() => boundsOf(positions))

  const straight = React.useMemo(
    () =>
      straightRoute(positions, ({ from, to, direction, distance }) =>
        t("map.straightStep", {
          direction: compassLabel(direction, t),
          distance: formatDistance(distance, t, locale.numberLocale),
          from: stops[from]?.label ?? "",
          to: stops[to]?.label ?? "",
        }),
      ),
    [positions, stops, t, locale.numberLocale],
  )

  const [fetched, setFetched] = React.useState<{ key: string; route: RouteResult | null; failed: boolean } | null>(null)
  React.useEffect(() => {
    if (!service || positions.length < 2) return
    const ac = new AbortController()
    service(positions, { signal: ac.signal }).then(
      (route) => !ac.signal.aborted && setFetched({ key, route, failed: false }),
      () => !ac.signal.aborted && setFetched({ key, route: null, failed: true }),
    )
    return () => ac.abort()
  }, [service, key, positions])

  const loading = !!service && positions.length >= 2 && fetched?.key !== key
  const failed = !!service && fetched?.key === key && fetched.failed
  const route = (service && fetched?.key === key ? fetched.route : null) ?? straight

  const onRouteRef = React.useRef(onRoute)
  React.useEffect(() => {
    onRouteRef.current = onRoute
  })
  React.useEffect(() => {
    if (!loading) onRouteRef.current?.(route)
  }, [route, loading])

  const steps: RouteStep[] = route.legs.flatMap((leg) => leg.steps)
  const legOffsets = route.legs.map((_, i) => route.legs.slice(0, i).reduce((n, l) => n + l.steps.length, 0))
  const totalDistance = route.legs.reduce((sum, l) => sum + l.distance, 0)
  const durations = route.legs.map((l) => l.duration)
  const totalDuration = durations.every((d) => d !== undefined)
    ? durations.reduce<number>((sum, d) => sum + (d ?? 0), 0)
    : undefined
  const current = active !== null && active < steps.length ? active : null

  const goTo = (index: number | null) => {
    setActive(index)
    const step = index !== null ? steps[index] : undefined
    if (step) {
      mapRef.current?.panTo(step.start)
      announce(t("map.stepOf", { index: index! + 1, total: steps.length, instruction: step.instruction }))
    }
  }

  return (
    <div
      ref={ref}
      data-slot="map-navigation"
      className={cn("gap-3 min-w-0 @container/nav grid", classNames?.root, className)}
    >
      <div className={cn("gap-x-4 gap-y-1 flex flex-wrap items-center", classNames?.summary)}>
        <p className="font-semibold text-lg tabular-nums">{formatDistance(totalDistance, t, locale.numberLocale)}</p>
        {totalDuration !== undefined ? (
          <p className="text-muted-foreground tabular-nums">{formatDuration(totalDuration, t)}</p>
        ) : null}
        {loading ? (
          <span className="gap-1.5 text-sm flex items-center text-muted-foreground">
            <Spinner /> {t("map.findingRoute")}
          </span>
        ) : null}
        {externalLink ? (
          <a
            href={googleDirectionsUrl(positions)}
            target="_blank"
            rel="noreferrer"
            className="gap-1 text-sm ms-auto inline-flex items-center text-primary underline-offset-4 hover:underline"
          >
            {t("map.openInGoogleMaps")}
            <Icon name="external-link" size="sm" />
            <span className="sr-only">{t("map.opensInNewTab")}</span>
          </a>
        ) : null}
      </div>
      {route.source === "straight" && !loading ? (
        <p className="gap-2 text-sm px-3 py-2 flex items-start rounded-md bg-muted text-muted-foreground">
          <Icon name="info" size="sm" className="mt-0.5 shrink-0" />
          {failed ? t("map.routeFailed") : t("map.straightLineNotice")}
        </p>
      ) : null}
      <div className="gap-3 @3xl/nav:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] grid">
        <MapView
          label={label ?? t("map.navigationLabel")}
          bounds={initialBounds}
          mapRef={mapRef}
          className={cn("@3xl/nav:h-full @3xl/nav:min-h-80", classNames?.map)}
        >
          <MapPolylineShape path={route.path} tone={tone} width={5} dashed={route.source === "straight"} />
          {stops.map((s, i) => (
            <MapMarker
              key={s.id ?? i}
              position={s.position}
              title={t("map.stopName", { letter: stopLetter(i), name: s.label })}
              label={stopLetter(i)}
              tone={i === 0 ? "success" : i === stops.length - 1 ? "destructive" : tone}
              zIndex={10}
            />
          ))}
          {current !== null && steps[current] ? (
            <MapMarker position={steps[current].start} title={t("map.currentStep")} tone="info" zIndex={20} />
          ) : null}
        </MapView>
        <section aria-label={t("map.directions")} className={cn("gap-2 grid content-start", classNames?.steps)}>
          <div className="gap-2 flex items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!steps.length || current === 0}
              onClick={() => goTo(current === null ? 0 : current - 1)}
            >
              <Icon name="chevron-left" />
              {t("map.previousStep")}
            </Button>
            <span className="text-sm flex-1 text-center text-muted-foreground tabular-nums">
              {current !== null
                ? t("map.stepCounter", { index: current + 1, total: steps.length })
                : t("map.stepsTotal", { count: steps.length })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!steps.length || current === steps.length - 1}
              onClick={() => goTo(current === null ? 0 : current + 1)}
            >
              {t("map.nextStep")}
              <Icon name="chevron-right" />
            </Button>
          </div>
          <ol className="max-h-96 overflow-auto rounded-md border">
            {route.legs.map((leg, legIndex) => (
              <li key={legIndex} className="border-b last:border-b-0">
                <p className="gap-2 px-3 py-2 text-xs font-medium flex items-center bg-muted/50 text-muted-foreground">
                  <span className="size-5 font-semibold flex shrink-0 items-center justify-center rounded-full border bg-background text-[0.65rem]">
                    {stopLetter(legIndex)}
                  </span>
                  <span className="min-w-0 truncate">
                    {t("map.legFromTo", { from: stops[legIndex]?.label ?? "", to: stops[legIndex + 1]?.label ?? "" })}
                  </span>
                  <span className="ms-auto shrink-0 tabular-nums">
                    {formatDistance(leg.distance, t, locale.numberLocale)}
                  </span>
                </p>
                <ol>
                  {leg.steps.map((step, stepIndex) => {
                    const index = (legOffsets[legIndex] ?? 0) + stepIndex
                    return (
                      <li key={index}>
                        <button
                          type="button"
                          aria-current={index === current ? "step" : undefined}
                          className={cn(
                            "gap-3 px-3 py-2 text-sm touch:py-3 flex w-full items-start text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                            index === current && "bg-primary/10",
                            classNames?.step,
                          )}
                          onClick={() => goTo(index)}
                        >
                          <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{index + 1}.</span>
                          <span className="min-w-0 flex-1">{step.instruction}</span>
                          <span className="shrink-0 text-muted-foreground tabular-nums">
                            {formatDistance(step.distance, t, locale.numberLocale)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
            <li className="gap-2 px-3 py-2 text-xs font-medium flex items-center text-muted-foreground">
              <span className="size-5 font-semibold flex shrink-0 items-center justify-center rounded-full border bg-background text-[0.65rem]">
                {stopLetter(stops.length - 1)}
              </span>
              {t("map.arrive", { name: stops[stops.length - 1]?.label ?? "" })}
            </li>
          </ol>
        </section>
      </div>
      <div aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  )
}

/**
 * Turn-by-turn style directions between stops: the route on the map and a
 * step list. Uses the engine's routing service when available, otherwise
 * straight segments with compass directions.
 */
export function MapNavigation(props: MapNavigationProps) {
  return (
    <EnsureMapProvider>
      <MapNavigationInner {...props} />
    </EnsureMapProvider>
  )
}

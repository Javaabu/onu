"use client"

import * as React from "react"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { Skeleton } from "../ui/skeleton"
import { chartColor, ChartFrame, type ChartBaseProps, type ChartDatum } from "./_shared"
import { choroplethRegions, stepOpacity, type ChoroplethRegion, type GeoJsonFeatureCollection } from "./choropleth"
import { useChartFormat, type ValueFormat } from "./format"

export interface MapChartProps extends Omit<ChartBaseProps, "showTableToggle"> {
  /** Region shapes, e.g. atolls or islands. */
  geojson: GeoJsonFeatureCollection
  /** One value per region, e.g. `{ id: "K", value: 212000 }`. */
  data: ChartDatum[]
  /** Key of the region id in `data`. Default `"id"`. */
  idKey?: string
  /** Key of the value in `data`. Default `"value"`. */
  valueKey?: string
  /** Feature property that matches `data[idKey]`; falls back to `feature.id`. Default `"id"`. */
  featureIdKey?: string
  /** Feature property used as the region name. Default `"name"`. */
  featureNameKey?: string
  /** Number of colour steps. Default `5`. */
  steps?: number
  /** Base colour (token or CSS colour). Steps are lighter mixes of it. Default `var(--chart-1)`. */
  color?: string
  valueFormat?: ValueFormat
  /** Map centre. Default: the Maldives. */
  center?: { lat: number; lng: number }
  /** Initial zoom. Default `6`. */
  zoom?: number
  /** Column header for region names in the table. */
  regionLabel?: React.ReactNode
  /** Show the "View as table" toggle when the map is available. Default `true`. */
  showTableToggle?: boolean
}

const GoogleChoropleth = React.lazy(() => import("./_map-chart-google"))

/**
 * Choropleth map on Google Maps with a deck.gl `GeoJsonLayer`. Regions are shaded by value,
 * with a legend, a tap/hover read-out and a data table. Without a Google Maps API key
 * (`OnuProvider maps={{ googleMapsApiKey }}`) it shows an accessible placeholder and the table.
 */
export function MapChart({
  geojson,
  data,
  idKey = "id",
  valueKey = "value",
  featureIdKey = "id",
  featureNameKey = "name",
  steps = 5,
  color = chartColor(0),
  valueFormat = "number",
  center = { lat: 3.2028, lng: 73.2207 },
  zoom = 6,
  regionLabel,
  height = 400,
  classNames,
  ...frameProps
}: MapChartProps) {
  const { t, maps } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const apiKey = maps.googleMapsApiKey
  const [selected, setSelected] = React.useState<ChoroplethRegion | null>(null)

  const { regions, scale } = React.useMemo(
    () => choroplethRegions(geojson, data, { idKey, valueKey, featureIdKey, featureNameKey, steps }),
    [geojson, data, idKey, valueKey, featureIdKey, featureNameKey, steps],
  )
  const withData = regions.filter((r) => r.value !== null)

  const summary = [
    t("chart.summary", { type: t("chart.typeMap"), series: 1, count: withData.length }),
    withData.length
      ? t("chart.seriesRange", { series: t("chart.value"), min: fmt.value(scale.min), max: fmt.value(scale.max) })
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const table = {
    columns: [regionLabel ?? t("chart.region"), t("chart.value")],
    rows: regions.map((r) => ({
      key: r.id,
      header: r.name,
      cells: [r.value === null ? t("chart.noValue") : fmt.value(r.value)],
    })),
  }

  const legend = (
    <div data-slot="map-legend" className="gap-x-3 gap-y-1 text-xs flex flex-wrap items-center">
      <span className="text-muted-foreground">{t("chart.legend")}:</span>
      <ul className="gap-x-3 gap-y-1 flex flex-wrap items-center">
        {scale.thresholds.map((from, step) => {
          const to = step === steps - 1 ? scale.max : scale.thresholds[step + 1]!
          return (
            <li key={step} className="gap-1.5 flex items-center tabular-nums">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-sm border border-border"
                style={{
                  background: `color-mix(in oklch, ${color} ${Math.round(stepOpacity(step, steps) * 100)}%, transparent)`,
                }}
              />
              {fmt.value(from)} – {fmt.value(to)}
            </li>
          )
        })}
        <li className="gap-1.5 flex items-center">
          <span aria-hidden="true" className="size-3 shrink-0 rounded-sm border border-dashed border-border bg-muted" />
          {t("chart.noValue")}
        </li>
      </ul>
    </div>
  )

  const readout = apiKey ? (
    <p data-slot="map-readout" aria-live="polite" className="text-sm text-muted-foreground">
      {selected
        ? t("chart.selectedRegion", {
            name: selected.name,
            value: selected.value === null ? t("chart.noValue") : fmt.value(selected.value),
          })
        : t("chart.mapHint")}
    </p>
  ) : null

  return (
    <ChartFrame
      {...frameProps}
      dataSlot="map-chart"
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      isEmpty={!regions.length}
      forceTable={!apiKey}
      lead={
        apiKey ? (
          legend
        ) : (
          <div
            data-slot="map-placeholder"
            role="note"
            className="gap-3 p-4 text-sm flex items-start rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground"
          >
            <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
            <p>{t("chart.mapUnavailable")}</p>
          </div>
        )
      }
      footer={readout}
    >
      {({ titleId, summaryId }) => (
        <div
          role="region"
          aria-labelledby={titleId}
          aria-describedby={summaryId}
          data-slot="map-chart-canvas"
          className={cn("relative w-full overflow-hidden rounded-lg bg-muted", classNames?.chart)}
          style={{ height }}
        >
          <React.Suspense
            fallback={
              <Skeleton className="size-full" role="status">
                <span className="sr-only">{t("chart.mapLoading")}</span>
              </Skeleton>
            }
          >
            <GoogleChoropleth
              apiKey={apiKey!}
              mapId={maps.mapId}
              darkMapId={maps.darkMapId}
              regions={regions}
              steps={steps}
              color={color}
              center={center}
              zoom={zoom}
              onSelect={setSelected}
            />
          </React.Suspense>
        </div>
      )}
    </ChartFrame>
  )
}

---
title: MapChart
sidebar_position: 9
---

A choropleth map: regions shaded by value on Google Maps, drawn with a deck.gl `GeoJsonLayer` (`GoogleMapsOverlay`). It has a stepped legend, a tap/hover read-out and a data table. Without a Google Maps API key it shows an accessible notice and the table instead.

:::info
Needs the optional peers `@vis.gl/react-google-maps`, `@deck.gl/core`, `@deck.gl/layers` and `@deck.gl/google-maps`. The map code is loaded lazily, only when an API key is configured.
:::

```tsx
import { OnuProvider } from "@javaabu/onu"
import { MapChart } from "@javaabu/onu/charts"

;<OnuProvider maps={{ googleMapsApiKey: "…", mapId: "…", darkMapId: "…" }}>
  <MapChart
    title="Resident population by atoll"
    geojson={atolls}
    data={[
      { id: "K", value: 22400 },
      { id: "S", value: 34500 },
    ]}
    regionLabel="Atoll"
  />
</OnuProvider>
```

`geojson` is a `FeatureCollection` of polygons. Each feature is matched to `data` by `properties[featureIdKey]` (or `feature.id`), and named by `properties[featureNameKey]`.

## Props

Also takes the common chart props (`title`, `description`, `valueFormat`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `actions`, `className`, `classNames`); see [BarChart](./bar-chart).

| Prop             | Type                        | Default          | Description                                |
| ---------------- | --------------------------- | ---------------- | ------------------------------------------ |
| `geojson`        | `GeoJsonFeatureCollection`  | required         | Region shapes                              |
| `data`           | `Record<string, unknown>[]` | required         | One value per region                       |
| `idKey`          | `string`                    | `"id"`           | Region id key in `data`                    |
| `valueKey`       | `string`                    | `"value"`        | Value key in `data`                        |
| `featureIdKey`   | `string`                    | `"id"`           | Feature property matching `data[idKey]`    |
| `featureNameKey` | `string`                    | `"name"`         | Feature property used as the name          |
| `steps`          | `number`                    | `5`              | Colour steps (equal intervals)             |
| `color`          | `string`                    | `var(--chart-1)` | Base colour; steps are lighter mixes of it |
| `center`         | `{ lat, lng }`              | the Maldives     | Initial centre                             |
| `zoom`           | `number`                    | `6`              | Initial zoom                               |
| `regionLabel`    | `ReactNode`                 | "Region"         | Table header for regions                   |
| `height`         | `number`                    | `400`            | Map height in px                           |

Helpers `choroplethScale`, `choroplethRegions` and `stepOpacity` are exported.

## Theming

The fill colour is a theme token resolved at runtime (deck.gl needs RGB), and is re-resolved when the theme switches. In dark mode the map uses `darkMapId` (if set) and Google's dark colour scheme. The map UI language follows the active locale.

## Accessibility

- With no API key: a `role="note"` notice explains why the map is missing, and the data table is shown.
- With a key: the map sits in a region named by the title and described by the summary (range of values). Hovering or tapping a region announces "Kaafu: 22,400" in a polite live region.
- The legend lists every step with its range, plus "No data".
- **View as table** lists every region and value, so the data is fully available without the map.

| Key                                   | Action                                             |
| ------------------------------------- | -------------------------------------------------- |
| <kbd>Tab</kbd>                        | Reach the map's zoom controls and the table toggle |
| Arrow keys, <kbd>+</kbd>/<kbd>-</kbd> | Pan and zoom the focused map (Google Maps)         |

---
title: MapProvider
sidebar_position: 1
---

Configures the map engine for every map inside it. Onu maps default to **Google Maps** (via `@vis.gl/react-google-maps`), and fall back to a keyless schematic preview when no API key is set.

```tsx
import { OnuProvider } from "@javaabu/onu"

;<OnuProvider maps={{ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, mapId: "…", darkMapId: "…" }}>
  <App />
</OnuProvider>
```

Every map component reads `useOnu().maps` and adds a `MapProvider` itself when there is none above it. Add one explicitly to override settings for a subtree, or to load the Maps JavaScript API once for many maps:

```tsx
import { MapProvider } from "@javaabu/onu/maps"

;<MapProvider apiKey="…" mapId="…" region="MV">
  <MapPicker />
  <LiveMap markers={vessels} />
</MapProvider>
```

Install the optional peers for the maps entry: `@vis.gl/react-google-maps`, `terra-draw`, `terra-draw-google-maps-adapter`, `@googlemaps/markerclusterer`, `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/aggregation-layers`, `@deck.gl/google-maps` and `@turf/turf`. terra-draw, deck.gl and the clusterer are loaded on demand.

## Light, dark and language

- The colour scheme follows the page (`.dark` or `data-theme="dark"` on `<html>`). With `darkMapId` the dark Map ID is used in dark mode; otherwise Google's `colorScheme` is switched.
- Markers and shapes use theme tokens (`--primary`, `--chart-1` … `--chart-8`, `--success`, …), so they recolour with `--onu-primary`.
- Map tiles use the active locale. Google has **no Dhivehi map language**, so with `locale="dv"` tiles and Google's own controls fall back to English while Onu's UI stays in Dhivehi and RTL.
- Without a Map ID, Google's `DEMO_MAP_ID` is used so advanced markers work. Set your own Map ID in production.

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Deprecated Google APIs

Onu never uses Google's deprecated Drawing Library or HeatmapLayer. Drawing uses **terra-draw** with its Google Maps adapter; heatmaps and replay trails use **deck.gl** through `GoogleMapsOverlay`.

## Adapter interface

Components only talk to a small `MapAdapter` interface (map, marker, circle, polygon, polyline, drawing, heatmap, trail, clusters, place search and routing). Two adapters ship: `googleMapsAdapter` and the keyless `placeholderAdapter`. A MapLibre adapter can be added later without changing component APIs:

```tsx
<MapProvider adapter={myAdapter}>…</MapProvider>
```

## Verified against Google Maps JS API

The Google adapter was driven end to end in Chromium (Playwright) against the real **Maps JavaScript API 3.66.7** (`weekly` channel, loaded by `@vis.gl/react-google-maps` 1.10), with `DEMO_MAP_ID`, terra-draw 1.37 + terra-draw-google-maps-adapter 1.7, deck.gl 9.4 and `@googlemaps/markerclusterer` 2.6. Every maps showcase demo and the Maps and operations sample pages were checked in light/LTR/English and dark/RTL/Dhivehi:

- the script loads once, every map creates a `google.maps.Map` with tiles, advanced markers, polygons, polylines and circles;
- clicks, marker selection, panning from a list outside the map, `fitBounds` / initial fit, and keeping the camera when the colour scheme switches;
- terra-draw drawing and vertex editing (polygon and route), clustering, and deck.gl heatmap and trail overlays;
- `colorScheme` follows dark mode, and with `dv` Google's labels fall back to English while Onu's UI is Dhivehi and RTL.

Limitations of that run: it had **no API key**, so Google showed its "for development purposes only" watermark and dialog, logged `NoApiKeys` / `InvalidKey` / `ApiProjectMapError`, and drew the map as a raster map. Services that need a key were not verified: geocoding search (`search={true}`) and routed directions (`MapNavigation` fell back to straight lines, as designed). Google also logs that `DirectionsService` is deprecated in favour of `google.maps.routes.Route.computeRoutes` (still supported). `@googlemaps/markerclusterer` 2.6 logs a deprecation warning about `addListener` on its cluster markers.

To repeat the check in the examples app without a key, build it with `VITE_GOOGLE_MAPS_FORCE=1 VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID`. The flag only exists in the examples app: it wraps the app in `<MapProvider adapter={googleMapsAdapter}>`. The library itself still uses the placeholder when an app sets no key.

## Props

| Prop          | Type                | Default                             | Description                            |
| ------------- | ------------------- | ----------------------------------- | -------------------------------------- |
| `apiKey`      | `string`            | `OnuProvider maps.googleMapsApiKey` | Google Maps API key                    |
| `mapId`       | `string`            | `OnuProvider maps.mapId`            | Map ID (vector maps, advanced markers) |
| `darkMapId`   | `string`            | `OnuProvider maps.darkMapId`        | Map ID used in dark mode               |
| `colorScheme` | `"light" \| "dark"` | page theme                          | Force a colour scheme                  |
| `region`      | `string`            | `"MV"`                              | Region bias for geocoding              |
| `adapter`     | `MapAdapter`        | Google with a key, else placeholder | The map engine                         |

## Helpers

The maps entry also exports pure helpers: `distanceMeters`, `pathLength`, `polygonArea` (turf), `formatLatLng`, `formatDistance`, `formatArea`, `formatDuration`, `boundsOf`, `googleMapsUrl`, `googleDirectionsUrl`, `staticMapUrl`, GeoJSON converters (`shapesToPolygons`, `polygonsToShapes`, `pathToLineString`), track helpers (`normalizeTrack`, `trackStateAt`) and `MALDIVES_ATOLLS`.

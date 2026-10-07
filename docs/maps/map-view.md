---
title: MapView
sidebar_position: 2
---

The base map. Put markers, shapes and layers inside it. `MapMarker`, `MapCircleShape`, `MapPolygonShape` and `MapPolylineShape` are the building blocks the other map components use.

```tsx
import { MapView, MapMarker, MapPolygonShape } from "@javaabu/onu/maps"

;<MapView center={{ lat: 4.1755, lng: 73.5093 }} zoom={13} onMapClick={(p) => console.log(p)}>
  <MapMarker position={{ lat: 4.1755, lng: 73.5093 }} title="Malé" onClick={() => select("male")} />
  <MapPolygonShape path={ward} tone="chart-2" />
</MapView>
```

Control the camera with `mapRef`:

```tsx
const mapRef = React.useRef<MapHandle>(null)
mapRef.current?.panTo({ lat: 4.21, lng: 73.54 }, 15)
mapRef.current?.fitBounds(boundsOf(points)!)
```

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop                      | Type                                            | Default         | Description                                     |
| ------------------------- | ----------------------------------------------- | --------------- | ----------------------------------------------- |
| `label`                   | `string`                                        | "Map"           | Accessible name of the map region               |
| `center` / `zoom`         | `LatLng` / `number`                             | Malé / `12`     | Initial camera                                  |
| `bounds`                  | `LatLngBounds`                                  |                 | Fit these bounds initially                      |
| `onMapClick`              | `(p: LatLng) => void`                           |                 | Clicked point                                   |
| `onViewChange`            | `(view: MapViewState) => void`                  |                 | Centre, zoom and bounds after the camera stops  |
| `mapRef`                  | `Ref<MapHandle>`                                |                 | `panTo`, `fitBounds`, `getView`                 |
| `controls`                | `boolean`                                       | `true`          | Zoom / map-type controls                        |
| `gestureHandling`         | `"cooperative" \| "greedy" \| "none" \| "auto"` | `"cooperative"` | Two-finger / Ctrl+scroll so the page scrolls    |
| `overlay`                 | `ReactNode`                                     |                 | Content over the map frame (legend, info panel) |
| `className`, `classNames` | `string`, `{ root, map }`                       |                 | Overrides                                       |

`MapMarker`: `position`, `title` (accessible name), `label` (text in the pin), `tone`, `selected`, `heading` (arrow marker), `draggable`, `onDragEnd`, `onClick`, `zIndex`.
`MapCircleShape`: `center`, `radius` (m), `tone`, `editable`, `onChange`. `MapPolygonShape`: `path`, `tone`, `selected`, `onClick`. `MapPolylineShape`: `path`, `tone`, `dashed`, `width`.

Tones: `primary`, `muted`, `success`, `warning`, `destructive`, `info`, `chart-1` … `chart-8`.

## Accessibility

- The map is a labelled region. Markers with `onClick` (or `draggable`) are focusable buttons named by `title`; other markers are images with that name.
- Maps are not the only way to see data: pair them with a list or table. The higher-level map components do this for you (R14.9).

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

## RTL

Map content is geographic, so it is never mirrored. Onu's controls around and over the map (zoom buttons, notices, panels) follow the page direction.

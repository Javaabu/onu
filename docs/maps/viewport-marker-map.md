---
title: ViewportMarkerMap
sidebar_position: 15
---

Loads markers for the visible area through your fetcher and clusters them (`@googlemaps/markerclusterer`). Requests are debounced after the map stops moving, and older requests are cancelled with `AbortController`, so a slow response never replaces a newer one.

```tsx
import { ViewportMarkerMap } from "@javaabu/onu/maps"

;<ViewportMarkerMap
  minZoom={9}
  fetcher={async (b, { zoom, signal }) => {
    const res = await fetch(
      `/api/places?north=${b.north}&south=${b.south}&east=${b.east}&west=${b.west}&zoom=${zoom}`,
      { signal },
    )
    return (await res.json()).data
  }}
/>
```

Each marker: `{ id, position, title, tone?, description? }`. Onu never makes requests itself (R16.6): the fetcher is yours.

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop                                            | Type                                         | Default | Description                                        |
| ----------------------------------------------- | -------------------------------------------- | ------- | -------------------------------------------------- |
| `fetcher`                                       | `(bounds, { zoom, signal }) => Promise<M[]>` |         | Loads markers                                      |
| `debounce`                                      | `number`                                     | `300`   | ms after the map stops                             |
| `cluster`                                       | `boolean`                                    | `true`  | Cluster markers                                    |
| `minZoom`                                       | `number`                                     |         | Below this nothing loads ("Zoom in to see places") |
| `selectedId` / `defaultSelectedId` / `onSelect` |                                              |         | Selection; `onSelect(id, marker)`                  |
| `onLoad`                                        | `(markers, bounds) => void`                  |         | After each load                                    |
| `list`                                          | `boolean`                                    | `true`  | List of loaded markers                             |
| `overlay`                                       | `ReactNode`                                  |         | E.g. `MapInfoPanel`                                |
| `center`, `zoom`, `bounds`, `label`             |                                              |         | Map setup                                          |
| `className`, `classNames`                       | `{ root, map, status, list, item }`          |         | Overrides                                          |

## Accessibility

- Loading, empty, error (with **Retry**) and "N places in view" states are announced in a polite live region.
- The list of loaded markers is the text alternative; selecting from it moves the map.

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a list item  | Select the place and move the map to it         |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

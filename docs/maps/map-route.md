---
title: MapRoute
sidebar_position: 6
---

Draw a route as a line (patrol path, ferry line, delivery route). The value is a GeoJSON `LineString` feature and its length is measured with turf.

```tsx
import { MapRoute } from "@javaabu/onu/maps"

;<FormField label="Patrol route" name="route">
  <MapRoute onDistanceChange={(m) => setMeters(m)} />
</FormField>
```

Draw with **Draw route** (double-click the last point or press **Done**), edit with **Edit points**, or type points below the map. Points can be moved up and down in the list.

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop                                  | Type                                    | Default        | Description                |
| ------------------------------------- | --------------------------------------- | -------------- | -------------------------- |
| `value` / `defaultValue` / `onChange` | `RouteFeature \| null`                  |                | GeoJSON LineString feature |
| `onDistanceChange`                    | `(meters: number) => void`              |                | Length after each change   |
| `name`                                | `string`                                | from FormField | Hidden input with the JSON |
| `tone`, `center`, `zoom`, `label`     |                                         |                | Appearance and map setup   |
| `disabled`, `required`, `id`          |                                         |                | Wired from `FormField`     |
| `className`, `classNames`             | `{ root, toolbar, map, list, summary }` |                | Overrides                  |

## Accessibility

Same as [MapPolygon](./map-polygon): the point list is a full keyboard alternative, with **Move up / Move down** buttons to reorder points.

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Move, remove or add a point                     |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

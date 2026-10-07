---
title: RouteStopEditor
sidebar_position: 13
---

An ordered list of stops synced with numbered markers. Add stops by clicking the map or with coordinates, rename them, drag to reorder (`@dnd-kit/react`, touch-friendly), or use the arrow buttons, and remove them.

```tsx
import { RouteStopEditor, type RouteStop } from "@javaabu/onu/maps"

const [stops, setStops] = React.useState<RouteStop[]>([])
<FormField label="Shuttle stops">
  <RouteStopEditor value={stops} onChange={setStops} name="stops" max={8} />
</FormField>
```

Each stop: `{ id, label, position: LatLng | null }`. Submits `stops[0][label]`, `stops[0][lat]`, `stops[0][lng]`, … in order. The total straight-line distance is shown.

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop                                          | Type                                | Default | Description                  |
| --------------------------------------------- | ----------------------------------- | ------- | ---------------------------- |
| `value` / `defaultValue` / `onChange`         | `RouteStop[]`                       | `[]`    | Stops in order               |
| `name`                                        | `string`                            |         | Hidden inputs                |
| `max`                                         | `number`                            |         | Maximum stops                |
| `addOnMapClick`                               | `boolean`                           | `true`  | Clicking the map adds a stop |
| `showPath`                                    | `boolean`                           | `true`  | Connect stops with a line    |
| `thaana`                                      | `boolean \| ThaanaOptions`          |         | Thaana typing in stop names  |
| `disabled`, `tone`, `center`, `zoom`, `label` |                                     |         | Without `center`/`zoom`, fits the stops |
| `className`, `classNames`                     | `{ root, map, list, item, footer }` |         | Overrides                    |

## Accessibility

- Every action has a button: move up/down, remove, edit coordinates. Reordering is announced ("Airport moved to position 2 of 4").
- The drag handle also works with the keyboard (dnd-kit: <kbd>Space</kbd> to pick up, arrows to move, <kbd>Space</kbd> to drop).

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Space</kbd> on a drag handle                   | Pick up / drop                                  |
| <kbd>↑</kbd> / <kbd>↓</kbd> while dragging          | Move the stop                                   |
| <kbd>Esc</kbd> while dragging                       | Cancel                                          |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

:::warning
dnd-kit's own drag announcements are in English. The editor announces the result of each move in the active locale.
:::

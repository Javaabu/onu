---
title: LiveMap
sidebar_position: 7
---

Markers that move as positions arrive, from props (polling) or a stream (WebSocket, SSE, Laravel Echo). Markers glide between updates, can be followed, and are listed as a text alternative.

```tsx
import { LiveMap } from "@javaabu/onu/maps"

<LiveMap
  markers={vessels}
  subscribe={(push) => {
    const channel = echo.channel("fleet").listen("PositionUpdated", (e) => push(e.vessel))
    return () => channel.stopListening("PositionUpdated")
  }}
  overlay={<MapInfoPanel open={!!selected} … />}
/>
```

Each marker: `{ id, position, title, heading?, tone?, status?, updatedAt? }`. Updates from `subscribe` merge into `markers` by `id`.

When the selection changes from the built-in list or from outside the map (a controlled `selectedId`, e.g. picking a vessel in your own table), the map pans to centre that marker. It does not turn on follow mode, and a tap on the marker itself does not move the map. Without `center` or `zoom`, the map fits all the markers once (also when they arrive after the first render, e.g. from a stream).

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop                                              | Type                        | Default | Description                                               |
| ------------------------------------------------- | --------------------------- | ------- | --------------------------------------------------------- |
| `markers`                                         | `LiveMapMarker[]`           | `[]`    | Current markers                                           |
| `subscribe`                                       | `(push) => unsubscribe`     |         | Stream of updates                                         |
| `selectedId` / `defaultSelectedId` / `onSelect`   | `string \| null`            |         | Selected marker                                           |
| `followId` / `defaultFollowId` / `onFollowChange` | `string \| null`            |         | Marker the camera follows                                 |
| `animationDuration`                               | `number`                    | `1000`  | Glide time in ms (`0` jumps; reduced motion always jumps) |
| `list`                                            | `boolean`                   | `true`  | Marker list (text alternative)                            |
| `overlay`                                         | `ReactNode`                 |         | Over the map, e.g. `MapInfoPanel`                         |
| `center`, `zoom`, `label`                         |                             |         | Map setup (fits the markers when neither is set)             |
| `className`, `classNames`                         | `{ root, map, list, item }` |         | Overrides                                                 |

## Accessibility

- Markers are buttons named by `title`; the list shows position, heading (as a compass direction) and the last update time.
- Follow buttons are toggles (`aria-pressed`); following is announced. Position updates are not announced, to avoid noise.
- Motion respects `prefers-reduced-motion`.

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a list item  | Select the marker and move the map to it        |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

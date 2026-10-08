---
title: MapNavigation
sidebar_position: 8
---

Turn-by-turn style directions between stops: the route on the map, a summary, and a step list with Previous / Next.

```tsx
import { MapNavigation } from "@javaabu/onu/maps"

;<MapNavigation
  stops={[
    { label: "Warehouse", position: { lat: 4.1745, lng: 73.5015 } },
    { label: "Hulhumalé", position: { lat: 4.2135, lng: 73.5395 } },
  ]}
/>
```

Routing: with Google Maps the **Directions service** is used. Without one (no key, a sea route, or `routeService={false}`), or if the request fails, the component draws **straight segments** and writes compass directions ("Head north-east from IGMH to Hulhumalé"). Plug in any routing API with `routeService`:

```tsx
<MapNavigation stops={stops} routeService={async (points, { signal }) => myRouter(points, signal)} />
```

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider#verified-against-google-maps-js-api)): markers, the dashed fallback line and the step list; a step click pans. Without an API key Google denies the Directions request and the straight-line fallback with its notice is shown, so routed directions were not verified.

## Props

| Prop                                                      | Type                                  | Default  | Description                           |
| --------------------------------------------------------- | ------------------------------------- | -------- | ------------------------------------- |
| `stops`                                                   | `{ label, position, id? }[]`          |          | Two or more stops in order            |
| `routeService`                                            | `RouteService \| false`               | engine's | Routing                               |
| `activeStep` / `defaultActiveStep` / `onActiveStepChange` | `number \| null`                      |          | Highlighted step                      |
| `onRoute`                                                 | `(route: RouteResult) => void`        |          | Computed route                        |
| `externalLink`                                            | `boolean`                             | `true`   | "Open in Google Maps" directions link |
| `tone`, `label`                                           |                                       |          | Appearance                            |
| `className`, `classNames`                                 | `{ root, map, summary, steps, step }` |          | Overrides                             |

## Accessibility

- The step list is the text alternative; the current step has `aria-current="step"` and is announced ("Step 2 of 7: …").
- Stops are labelled markers (A, B, C…).

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a step       | Go to that step                                 |
| Previous / Next buttons                             | Step through the route                          |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

## RTL

Previous / Next chevrons mirror in RTL.

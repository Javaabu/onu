---
title: HeatmapLayer
sidebar_position: 14
---

A density heatmap inside a `MapView`. On Google Maps it is deck.gl's `HeatmapLayer` through `GoogleMapsOverlay` (Google's own HeatmapLayer is deprecated and never used). Colours come from theme tokens.

```tsx
import { HeatmapLayer, MapView, MapLegend, HEATMAP_TONES, toneVar } from "@javaabu/onu/maps"

;<MapView
  overlay={<MapLegend items={[{ label: "Low → high", shape: "gradient", colors: HEATMAP_TONES.map(toneVar) }]} />}
>
  <HeatmapLayer points={incidents.map((i) => ({ position: i.position, weight: i.severity }))} />
</MapView>
```

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider).
:::

## Props

| Prop        | Type                                      | Default              | Description                    |
| ----------- | ----------------------------------------- | -------------------- | ------------------------------ |
| `points`    | `{ position: LatLng; weight?: number }[]` |                      | Data                           |
| `radius`    | `number`                                  | `30`                 | Pixels each point spreads over |
| `intensity` | `number`                                  | `1`                  | Weight multiplier              |
| `opacity`   | `number`                                  | `0.8`                | Layer opacity                  |
| `colors`    | `(MapTone \| "#rrggbb")[]`                | `HEATMAP_TONES`      | Colour ramp, low to high       |
| `summary`   | `string \| null`                          | count + total weight | Visually hidden summary        |

## Accessibility

The layer adds a visually hidden summary ("Heatmap of 215 points, total weight 640"). A heatmap is still visual: give users a table or list of the underlying data as well (R14.9), and a legend with text.

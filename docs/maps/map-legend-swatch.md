---
title: MapLegendSwatch
sidebar_position: 16
---

Colour and shape samples that match how layers are drawn, and `MapLegend`, a labelled list of them.

```tsx
import { MapLegend, MapLegendSwatch } from "@javaabu/onu/maps"

<MapLegend
  items={[
    { label: "Under way", tone: "success", shape: "pin", description: "12" },
    { label: "Ferry line", tone: "chart-3", shape: "dashed" },
  ]}
/>

<MapLegendSwatch shape="area" tone="chart-2" />
```

Shapes: `circle`, `square`, `pin`, `area`, `line`, `dashed`, `gradient` (with `colors`).

## Props

`MapLegendSwatch`:

| Prop     | Type                   | Default     | Description                                     |
| -------- | ---------------------- | ----------- | ----------------------------------------------- |
| `tone`   | `MapTone`              | `"primary"` | Theme colour                                    |
| `shape`  | `MapLegendShape`       | `"circle"`  | Sample shape                                    |
| `colors` | `string[]`             |             | Gradient stops (CSS colours or `toneVar(tone)`) |
| `size`   | `"sm" \| "md" \| "lg"` | `"md"`      | Size (`mapLegendSwatchVariants`)                |

`MapLegend`:

| Prop          | Type                                                | Default      | Description                  |
| ------------- | --------------------------------------------------- | ------------ | ---------------------------- |
| `items`       | `{ label, tone?, shape?, colors?, description? }[]` |              | Entries                      |
| `title`       | `ReactNode \| null`                                 | "Legend"     | Heading; `null` hides it     |
| `orientation` | `"vertical" \| "horizontal"`                        | `"vertical"` | Layout (`mapLegendVariants`) |
| `size`        | swatch size                                         | `"sm"`       |                              |
| `classNames`  | `{ title, list, item, swatch }`                     |              | Overrides                    |

## Accessibility

Swatches are decorative (`aria-hidden`); every entry has a text label, so colour is never the only cue (R14.6). The list is labelled by its title.

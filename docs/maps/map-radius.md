# MapRadius

A centre and a radius in metres: click to place the centre, drag the handles, or type the numbers. Submits `name[lat]`, `name[lng]` and `name[radius]`.

```tsx
import { MapRadius } from "@javaabu/onu/maps"

;<FormField label="Delivery area" name="area">
  <MapRadius min={100} max={5000} step={50} defaultRadius={800} />
</FormField>
```

On Google Maps the handles are the editable `google.maps.Circle` (core Maps API, not the deprecated Drawing Library).

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider.md).
:::

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider.md#verified-against-google-maps-js-api)): the editable circle renders with drag handles, and clicking an empty map places the centre.

## Props

| Prop                                  | Type                                         | Default               | Description                          |
| ------------------------------------- | -------------------------------------------- | --------------------- | ------------------------------------ |
| `value` / `defaultValue` / `onChange` | `{ center: LatLng; radius: number } \| null` |                       | Centre and radius (m)                |
| `name`                                | `string`                                     | from FormField        | Hidden inputs                        |
| `defaultRadius`                       | `number`                                     | `500`                 | Radius when a centre is first placed |
| `min` / `max` / `step`                | `number`                                     | `10` / `50000` / `10` | Radius limits (m)                    |
| `tone`                                | `MapTone`                                    | `"primary"`           | Circle colour                        |
| `center` / `zoom` / `label`           |                                              |                       | Map setup                            |
| `disabled`, `required`, `id`          |                                              |                       | Wired from `FormField`               |
| `className`, `classNames`             | `{ root, map, fields, summary }`             |                       | Overrides                            |

## Accessibility

The radius is a numeric input and the centre has latitude/longitude fields, so everything works without the map. Changes are announced ("Radius 800 m around …"). The summary shows the radius and area.

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd> in the radius field     | Change the radius by `step`                     |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

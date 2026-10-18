# MapPolygon

Draw and edit polygons (zones, plots, service areas). The value is a GeoJSON `FeatureCollection` of `Polygon`s; each area is measured with turf. Drawing on Google Maps uses **terra-draw** with its Google adapter.

```tsx
import { MapPolygon, type PolygonCollection } from "@javaabu/onu/maps"

const [zones, setZones] = React.useState<PolygonCollection | null>(null)
<FormField label="Collection zones" name="zones">
  <MapPolygon value={zones} onChange={setZones} />
</FormField>
```

- **Draw area**: click to add points; click the first point (or press **Done**) to finish.
- **Edit points**: drag points; drag a midpoint to add a point.
- The list beside the map shows each area with its point count and size, and the points of the selected area. Points can be added by typing coordinates, and removed one by one.
- Feature `properties` you set (e.g. a name) are kept when shapes change.

With `name`, the GeoJSON is submitted as a JSON string.

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider.md).
:::

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider.md#verified-against-google-maps-js-api)): terra-draw draws a polygon by clicking, edit mode drags a vertex and updates the value, the initial value stays listed while terra-draw loads it, shapes survive a tone or colour-scheme change, and Fit to view fits the shapes.

## Props

| Prop                                  | Type                                    | Default        | Description                      |
| ------------------------------------- | --------------------------------------- | -------------- | -------------------------------- |
| `value` / `defaultValue` / `onChange` | `PolygonCollection \| null`             |                | GeoJSON; `null` when empty       |
| `multiple`                            | `boolean`                               | `true`         | Allow several polygons           |
| `name`                                | `string`                                | from FormField | Hidden input with the JSON       |
| `tone`                                | `MapTone`                               | `"primary"`    | Colour                           |
| `center` / `zoom` / `label`           |                                         |                | Map setup (without `center`/`zoom`, fits the shapes) |
| `disabled`, `required`, `id`          |                                         |                | Wired from `FormField`           |
| `className`, `classNames`             | `{ root, toolbar, map, list, summary }` |                | Overrides                        |

## Accessibility

- Every area can be created, reviewed and edited from the list with the keyboard; changes are announced ("Point 3 added").
- Toolbar buttons are toggle buttons (`aria-pressed`).

| Key                                                 | Action                                                    |
| --------------------------------------------------- | --------------------------------------------------------- |
| <kbd>Tab</kbd>                                      | Toolbar, map, area list, point list and coordinate fields |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Select an area, remove a point, add a point               |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls           |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)                      |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)                    |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                                 |

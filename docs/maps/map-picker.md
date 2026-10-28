# MapPicker

Pick a point: click the map, drag the pin, search a place, use the device location, or type the latitude and longitude. Submits `name[lat]` and `name[lng]`.

```tsx
import { MapPicker } from "@javaabu/onu/maps"

;<FormField label="Business location" name="location" required>
  <MapPicker />
</FormField>
```

Controlled:

```tsx
const [value, setValue] = React.useState<LatLng | null>(null)
<MapPicker value={value} onChange={setValue} />
```

## Search

`search` is `true` by default and uses the engine's geocoder (Google Geocoding, biased to the Maldives). Pass your own function to search your API, or `false` to hide the box:

```tsx
<MapPicker search={async (query, { signal }) => (await fetch(`/api/places?q=${query}`, { signal })).json()} thaana />
```

The search box is also available on its own as `PlaceSearchBox`, and its state as the `usePlaceSearchBox({ search, minLength, debounce })` hook (debounced; older requests aborted with `AbortController`).

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider.md).
:::

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider.md#verified-against-google-maps-js-api)): clicking the map moves the pin and the value, and an empty picker places a pin on click.

## Props

| Prop                                  | Type                                     | Default        | Description                                 |
| ------------------------------------- | ---------------------------------------- | -------------- | ------------------------------------------- |
| `value` / `defaultValue` / `onChange` | `LatLng \| null`                         |                | The picked point                            |
| `name`                                | `string`                                 | from FormField | Hidden inputs `name[lat]`, `name[lng]`      |
| `search`                              | `boolean \| PlaceSearch`                 | `true`         | Place search                                |
| `thaana`                              | `boolean \| ThaanaOptions`               |                | Thaana typing in the search box             |
| `locate`                              | `boolean`                                | `true`         | "Use my location" (when geolocation exists) |
| `coordinates`                         | `boolean`                                | `true`         | Latitude / longitude fields                 |
| `clearable`                           | `boolean`                                | not required   | "Clear" button                              |
| `center` / `zoom`                     | `LatLng` / `number`                      | Malé / `11`    | Where the map opens when empty              |
| `disabled`, `required`, `id`, `label` |                                          |                | Wired from `FormField` when inside one      |
| `className`, `classNames`             | `{ root, toolbar, search, map, fields }` |                | Overrides                                   |

Values are rounded to 6 decimals (about 10 cm).

## Accessibility

- The latitude/longitude fields are the keyboard and screen-reader alternative to the map; invalid numbers show an error.
- The search box follows the WAI-ARIA combobox pattern. The picked location is announced ("Location set to …").

| Key                                                 | Action                                          |
| --------------------------------------------------- | ----------------------------------------------- |
| <kbd>↓</kbd> / <kbd>↑</kbd>                         | Move through search results                     |
| <kbd>Enter</kbd>                                    | Choose the highlighted result                   |
| <kbd>Esc</kbd>                                      | Close the results, then clear the search        |
| <kbd>Tab</kbd>                                      | Moves between the map, its markers and controls |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan the map (when the map has focus)            |
| <kbd>+</kbd> / <kbd>-</kbd>                         | Zoom in / out (when the map has focus)          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Activate a focused marker                       |

## RTL and Thaana

Coordinate fields are always `dir="ltr"`. Set `thaana` to type Thaana place names in the search box.

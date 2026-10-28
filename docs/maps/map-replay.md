# MapReplay

Plays back a timestamped track (a vessel trip, a delivery run): play/pause, speed and a scrubber. On Google Maps the travelled trail is drawn with deck.gl's `PathLayer` through `GoogleMapsOverlay`.

```tsx
import { MapReplay } from "@javaabu/onu/maps"

;<MapReplay track={points} title="Ferry Raajje" />
```

`track` is either `{ lat, lng, time }[]` (epoch ms) or a GeoJSON `LineString` feature with `properties.timestamps` (ms or ISO strings):

```json
{ "type": "Feature", "properties": { "timestamps": ["2026-03-12T04:30:00Z", "…"] }, "geometry": { "type": "LineString", "coordinates": [[73.51, 4.17], …] } }
```

:::info No API key?
Without a Google Maps API key the map renders a labelled **schematic preview** (no tiles, no network) instead of crashing. Everything else, including the text alternative, keeps working. See [MapProvider](./map-provider.md).
:::

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider.md#verified-against-google-maps-js-api)): the deck.gl trail attaches through `GoogleMapsOverlay`, and playback moves the marker.

## Props

| Prop                                             | Type                                         | Default            | Description                           |
| ------------------------------------------------ | -------------------------------------------- | ------------------ | ------------------------------------- |
| `track`                                          | `TrackPoint[] \| TrackFeature`               |                    | The track                             |
| `time` / `defaultTime` / `onTimeChange`          | `number`                                     | start              | Playback time (epoch ms)              |
| `playing` / `defaultPlaying` / `onPlayingChange` | `boolean`                                    | `false`            | Playing state                         |
| `speeds`                                         | `number[]`                                   | `[1, 10, 60, 300]` | Speed options                         |
| `defaultSpeed`                                   | `number`                                     | `60`               | Starting speed                        |
| `follow`                                         | `boolean`                                    | `true`             | Keep the marker in view while playing |
| `title`, `tone`, `label`                         |                                              |                    | Tracked object name and appearance    |
| `className`, `classNames`                        | `{ root, map, controls, scrubber, details }` |                    | Overrides                             |

## Accessibility

- The scrubber is a slider with `aria-valuetext` giving the clock time and elapsed / total duration.
- The current time, position and a track summary (points, distance, duration) are shown as text.

| Key                                         | Action                             |
| ------------------------------------------- | ---------------------------------- |
| <kbd>Space</kbd> / <kbd>Enter</kbd> on Play | Play / pause (at the end, restart) |
| <kbd>←</kbd> <kbd>→</kbd> on the scrubber   | One second back / forward          |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>   | Larger steps                       |
| <kbd>Home</kbd> / <kbd>End</kbd>            | Start / end of the track           |

## RTL

The scrubber runs right-to-left in RTL, and arrow keys follow it.

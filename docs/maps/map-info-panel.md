---
title: MapInfoPanel
sidebar_position: 12
---

Details of the selected marker: a side panel over the map on desktop and a bottom sheet on phones. Put it in a map's `overlay`.

```tsx
import { MapInfoPanel, MapView, MapMarker } from "@javaabu/onu/maps"

;<MapView
  overlay={
    <MapInfoPanel
      open={!!place}
      onOpenChange={(o) => !o && setPlace(null)}
      title={place?.name}
      actions={<Button>Directions</Button>}
    >
      <dl>…</dl>
    </MapInfoPanel>
  }
>
  {places.map((p) => (
    <MapMarker key={p.id} position={p.position} title={p.name} onClick={() => setPlace(p)} />
  ))}
</MapView>
```

The bottom sheet is shadcn's `Drawer` (drag down to dismiss).

Verified on the real Google Maps JavaScript API (see [MapProvider](./map-provider#verified-against-google-maps-js-api)): the panel opens over a Google map when a marker is clicked.

## Props

| Prop                      | Type                              | Default  | Description                       |
| ------------------------- | --------------------------------- | -------- | --------------------------------- |
| `open` / `onOpenChange`   | `boolean`                         |          | Visibility                        |
| `title`                   | `ReactNode`                       |          | Heading                           |
| `description`             | `ReactNode`                       |          | Subtitle                          |
| `children`                | `ReactNode`                       |          | Details                           |
| `actions`                 | `ReactNode`                       |          | Footer buttons                    |
| `variant`                 | `"auto" \| "side" \| "sheet"`     | `"auto"` | Side on desktop, sheet below `md` |
| `className`, `classNames` | `{ header, title, body, footer }` |          | Overrides                         |

## Accessibility

- The side panel is a labelled `complementary` region. Focus moves to its heading when it opens and returns to what opened it (e.g. the marker) when it closes.
- The sheet is a dialog with focus trapping and restore.

| Key            | Action                                       |
| -------------- | -------------------------------------------- |
| <kbd>Esc</kbd> | Close                                        |
| <kbd>Tab</kbd> | Move through the panel's content and actions |

## RTL

The side panel sits at the inline end (left in RTL).

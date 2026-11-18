# LocationCard

A place at a glance: a static map thumbnail, the address, coordinates and an **Open in Google Maps** link.

```tsx
import { LocationCard } from "@javaabu/onu/maps"

;<LocationCard
  position={{ lat: 4.1771, lng: 73.5123 }}
  title="Ministry of Finance"
  address="Ameenee Magu, Malé 20379"
/>
```

The thumbnail is a Google Static Maps image (needs the API key, uses the dark Map ID in dark mode). Without a key, or if the image fails, a styled placeholder is shown instead.

## Props

| Prop                      | Type                                       | Default      | Description                             |
| ------------------------- | ------------------------------------------ | ------------ | --------------------------------------- |
| `position`                | `LatLng`                                   |              | The place                               |
| `title`                   | `ReactNode`                                |              | Place name                              |
| `address`                 | `ReactNode`                                |              | Address (rendered in `<address>`)       |
| `placeId`                 | `string`                                   |              | Google place id for the link            |
| `zoom`                    | `number`                                   | `15`         | Thumbnail zoom                          |
| `thumbnail`               | `boolean`                                  | `true`       | Show the map image                      |
| `showCoordinates`         | `boolean`                                  | `true`       | Show coordinates                        |
| `actions`                 | `ReactNode`                                |              | Extra actions                           |
| `layout`                  | `"vertical" \| "horizontal"`               | `"vertical"` | Horizontal from medium container widths |
| `apiKey`                  | `string`                                   | provider     | Static Maps key                         |
| `className`, `classNames` | `{ media, body, title, address, actions }` |              | Overrides                               |

`locationCardVariants` is exported.

## Accessibility

- The thumbnail has alt text ("Map of …"); the placeholder is a labelled image.
- The link says it opens in a new tab (visually hidden text).

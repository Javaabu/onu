---
title: Gallery
sidebar_position: 11
---

A responsive image grid or masonry layout. Thumbnails are lazy-loaded; activating one opens the [`Lightbox`](./lightbox) (keyboard, swipe, zoom), and focus returns to the thumbnail when it closes. Part of the optional media entry.

```bash
pnpm add yet-another-react-lightbox
```

```tsx
import { Gallery } from "@javaabu/onu/media"

;<Gallery
  images={[
    { src: "/photos/maafushi.jpg", thumbnail: "/photos/maafushi-sm.jpg", alt: "Maafushi beach", title: "Maafushi" },
    { src: "/photos/fuvahmulah.jpg", alt: "Sunset over Fuvahmulah", width: 900, height: 1200 },
  ]}
  layout="masonry"
  columns={4}
  showCaptions
/>
```

## Props

| Prop            | Type                                         | Default    | Description                                  |
| --------------- | -------------------------------------------- | ---------- | -------------------------------------------- |
| `images`        | `GalleryImage[]`                             |            | Lightbox slides plus an optional `thumbnail` |
| `layout`        | `"grid" \| "masonry"`                        | `"grid"`   | Layout (`galleryVariants`)                   |
| `columns`       | `2 \| 3 \| 4`                                | `3`        | Columns at wide container sizes              |
| `aspect`        | `"square" \| "video" \| "portrait"`          | `"square"` | Thumbnail shape in the grid                  |
| `showCaptions`  | `boolean`                                    | `false`    | Show each image's title under it             |
| `lightbox`      | `boolean`                                    | `true`     | Open the lightbox on click                   |
| `lightboxProps` | `{ zoom, captions, counter, loop, plugins }` |            | Lightbox options                             |
| `onImageClick`  | `(index) => void`                            |            | An image was activated                       |
| `classNames`    | `{ list, item, image, caption }`             |            | Classes for each part                        |

## Accessibility

Each thumbnail is a button named by its alt text (required, R14.10) with `aria-haspopup="dialog"`.

| Key                                 | Action            |
| ----------------------------------- | ----------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the lightbox |

See [`Lightbox`](./lightbox) for keys inside the viewer.

## RTL and Dhivehi

The grid flows from the inline start; columns adapt to the container (container queries).

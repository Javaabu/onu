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

## Masonry for other content

For cards, posts or anything else that is not an image gallery, masonry is a few Tailwind classes on a plain container, not a component: CSS columns pack items of different heights, and nothing measures them in JavaScript.

```tsx
<div className="sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 columns-1 [&>*]:break-inside-avoid">
  {posts.map((post) => (
    <Card key={post.id} title={post.title}>
      {post.excerpt}
    </Card>
  ))}
</div>
```

Use container variants (`@container` on a parent, then `@sm:columns-2 @3xl:columns-3`) to follow the container width instead of the viewport. CSS columns flow top to bottom, then into the next column, so the visual order differs from a row-based grid; the DOM and tab order is the source order, so make sure it reads well on its own. Columns fill from the inline start (right to left in RTL).

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

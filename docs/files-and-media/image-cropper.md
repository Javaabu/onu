---
title: ImageCropper
sidebar_position: 9
---

Crops an image with [`react-easy-crop`](https://github.com/ValentinH/react-easy-crop): drag or pinch to move and zoom, arrow keys to nudge, a zoom slider, rotation, aspect-ratio presets, and Blob/File output. Part of the optional media entry.

```bash
pnpm add react-easy-crop
```

```tsx
import { ImageCropper, type ImageCropperHandle } from "@javaabu/onu/media"

const cropper = React.useRef<ImageCropperHandle>(null)

<ImageCropper
  ref={cropper}
  src={file}
  alt="Shop front"
  aspect={16 / 9}
  aspectOptions={[
    { label: "16:9", value: 16 / 9 },
    { label: "1:1", value: 1 },
    { label: "Free", value: undefined },
  ]}
/>
<Button onClick={async () => upload(await cropper.current!.getFile("cover.jpg", { maxSize: 1600 }))}>Save</Button>
```

The canvas helpers are exported for use without the component: `cropImage(src, pixelCrop, { rotation, type, quality, maxSize })` returns a `Blob`, and `cropImageToFile(...)` a `File`.

## Props

| Prop                  | Type                                   | Default    | Description                                                          |
| --------------------- | -------------------------------------- | ---------- | -------------------------------------------------------------------- |
| `src`                 | `string \| Blob`                       |            | Image URL or picked file                                             |
| `alt`                 | `string`                               | (required) | Names the crop area                                                  |
| `aspect`              | `number`                               | `1`        | Initial aspect ratio                                                 |
| `aspectOptions`       | `{ label, value }[]`                   |            | Aspect presets (`undefined` = free, image ratio)                     |
| `onAspectChange`      | `(aspect) => void`                     |            | A preset was chosen                                                  |
| `cropShape`           | `"rect" \| "round"`                    | `"rect"`   | Crop shape                                                           |
| `minZoom` / `maxZoom` | `number`                               | `1` / `3`  | Zoom range                                                           |
| `rotatable`           | `boolean`                              | `true`     | Show rotate buttons and slider                                       |
| `keyboardStep`        | `number`                               | `4`        | Pixels per arrow key press                                           |
| `onCropComplete`      | `(area: PixelCrop, rotation) => void`  |            | The crop changed                                                     |
| `ref`                 | `Ref<ImageCropperHandle>`              |            | `getBlob(options)`, `getFile(name, options)`, `getCrop()`, `reset()` |
| `classNames`          | `{ stage, controls, cropArea, media }` |            | Classes for each part                                                |

## Accessibility

The crop area is focusable, named "Crop area for {alt}" and described with the keyboard help. Zoom and rotation also have sliders and buttons, so nothing depends on dragging or pinching.

| Key                                                       | Action                        |
| --------------------------------------------------------- | ----------------------------- |
| Arrow keys                                                | Move the image (Shift: finer) |
| <kbd>+</kbd> / <kbd>-</kbd>                               | Zoom in / out                 |
| Arrow keys / <kbd>Home</kbd> / <kbd>End</kbd> on a slider | Change zoom or rotation       |

## RTL and Dhivehi

Sliders follow the reading direction; labels come from the `file` namespace.

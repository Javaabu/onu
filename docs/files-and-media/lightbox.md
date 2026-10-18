# Lightbox

A full-screen image viewer built on [yet-another-react-lightbox](https://yet-another-react-lightbox.com): keyboard, swipe, pinch/double-tap/wheel zoom, captions and a counter, with a focus trap, focus return, translated labels and mirrored arrows in RTL. Part of the optional media entry. Use [`Gallery`](./gallery.md) for the thumbnail grid.

```bash
pnpm add yet-another-react-lightbox
```

```tsx
import { Lightbox } from "@javaabu/onu/media"

const [open, setOpen] = React.useState(false)
const [index, setIndex] = React.useState(0)

<Button onClick={() => setOpen(true)}>View photos</Button>
<Lightbox
  open={open}
  onOpenChange={setOpen}
  slides={[{ src: "/photos/1.jpg", alt: "Malé skyline", title: "Malé", description: "From the Hulhumalé ferry" }]}
  index={index}
  onIndexChange={setIndex}
/>
```

:::info

The component imports the library's CSS (`yet-another-react-lightbox/styles.css` and the captions/counter plugin styles). Bundlers such as Vite and Next.js handle this automatically. Colours are bound to Onu tokens through the library's CSS variables, so the viewer follows light and dark mode.

:::

## Props

| Prop            | Type              | Default | Description                                                    |
| --------------- | ----------------- | ------- | -------------------------------------------------------------- |
| `open`          | `boolean`         |         | Whether the viewer is open                                     |
| `onOpenChange`  | `(open) => void`  |         | Called with `false` on close                                   |
| `slides`        | `LightboxSlide[]` |         | `{ src, alt, title?, description?, width?, height?, srcSet? }` |
| `index`         | `number`          | `0`     | Slide to show                                                  |
| `onIndexChange` | `(index) => void` |         | The slide changed                                              |
| `zoom`          | `boolean`         | `true`  | Zoom plugin                                                    |
| `captions`      | `boolean`         | `true`  | Captions plugin                                                |
| `counter`       | `boolean`         | `true`  | "2 / 8" counter                                                |
| `loop`          | `boolean`         | `false` | Wrap around                                                    |
| `plugins`       | `Plugin[]`        |         | Extra library plugins (thumbnails, slideshow, …)               |
| `className`     | `string`          |         | Class on the viewer root                                       |

## Accessibility

The viewer is a modal dialog ("Image viewer"); slides are announced as "2 of 8"; focus is trapped while open and returns to the element that opened it. Every gesture has a button alternative.

| Key                   | Action                            |
| --------------------- | --------------------------------- |
| <kbd>ArrowRight</kbd> | Next image (previous in RTL)      |
| <kbd>ArrowLeft</kbd>  | Previous image (next in RTL)      |
| <kbd>Escape</kbd>     | Close                             |
| <kbd>Tab</kbd>        | Move between the viewer's buttons |

## RTL and Dhivehi

The arrows swap sides and the keys follow the reading direction in RTL (the viewer reads the document's `dir`, which `OnuProvider` sets). Labels come from the `file` namespace.

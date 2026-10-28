# Logo

The product or organisation logo with separate light and dark images, an optional wordmark, linking home.

```tsx
import { Logo } from "@javaabu/onu"

;<Logo src="/logo.svg" darkSrc="/logo-dark.svg" alt="Javaabu" text="Javaabu" />

// Inline SVG mark, no link
<Logo alt="Onu" href={null}>
  <OnuMark className="size-8" />
</Logo>
```

## Props

| Prop               | Type                    | Default | Description                                    |
| ------------------ | ----------------------- | ------- | ---------------------------------------------- |
| `alt`              | `string`                |         | Required. Organisation name                    |
| `src`              | `string`                |         | Image (light mode, and dark without `darkSrc`) |
| `darkSrc`          | `string`                |         | Image for dark mode                            |
| `href`             | `string \| null`        | `"/"`   | Link target; `null` for no link                |
| `text`             | `ReactNode`             |         | Wordmark beside the image                      |
| `children`         | `ReactNode`             |         | Custom mark instead of `src`                   |
| `asChild`          | `boolean`               | `false` | Merge image classes into the custom mark       |
| `width` / `height` | `number`                |         | Image dimensions (avoid layout shift)          |
| `classNames`       | `{ image, text, link }` |         | Classes for each part                          |

## Accessibility

- As a link, its name is "Javaabu, home" (translated); the images inside are decorative.
- Without a link, the image carries `alt` (or the wrapper gets `role="img"` for a custom mark).

## RTL

The wordmark sits after the mark in reading order.

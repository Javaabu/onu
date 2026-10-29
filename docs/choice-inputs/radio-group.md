---
title: Radio group
sidebar_position: 10
---

A set of radios where one can be chosen (shadcn radio group). Give `options` or [`Radio`](./radio) children, in the `default`, `card` or `image` variant, stacked or side by side.

```tsx
import { RadioGroup } from '@javaabu/onu';

<RadioGroup options={['Female', 'Male']} orientation="horizontal" />
<RadioGroup
  variant="card"
  options={[
    { value: 'post', label: 'Post', description: 'Collect from the post office' },
    { value: 'courier', label: 'Courier', description: 'To your door', aside: 'MVR 50' },
  ]}
/>
```

## Image tiles

`variant="image"` shows each option as a tile: the image fills it, the label (and description) sit under it, and the checked tile gets the card ring and a check mark. Tiles are at least `minItemWidth` wide and the grid fits as many columns as the container allows, so it works in narrow columns and on phones. All four arrow keys move between tiles.

```tsx
<RadioGroup
  variant="image"
  options={[
    { value: 'lagoon', label: 'Lagoon', image: { src: '/themes/lagoon.jpg', alt: '' } },
    { value: 'reef', label: 'Reef', image: { src: '/themes/reef.jpg', alt: '' } },
  ]}
  defaultValue="lagoon"
/>
<RadioGroup variant="image" options={covers} aspectRatio="video" minItemWidth="10rem" />
<RadioGroup variant="image" options={swatches} minItemWidth="4rem" classNames={{ label: 'sr-only' }} />
```

`image.alt` is required (R14.10); use `""` when the label already describes the image. To hide the labels, keep them for screen readers with `classNames={{ label: 'sr-only' }}`. A `Radio` child takes the same `image` prop. The image variant is single choice.

## Props

All Radix radio group props (`value`, `defaultValue`, `onValueChange`, `name`, `required`, `disabled`, `loop`), plus:

| Prop          | Type                                      | Default      | Description                                      |
| ------------- | ----------------------------------------- | ------------ | ------------------------------------------------ |
| `options`     | `(RadioGroupOption \| string)[]`          |              | `ChoiceOption` plus `media`, `image` and `aside` |
| `variant`     | `"default" \| "card" \| "image"`          | `"default"`  | Radios with labels, selectable cards, or image tiles |
| `orientation` | `"vertical" \| "horizontal"`              | `"vertical"` | Horizontal wraps; card columns fit the container. Not used by `image` |
| `minItemWidth` | CSS length                               | `"8rem"`     | Image variant: minimum tile width                |
| `aspectRatio` | `"square" \| "video" \| "portrait" \| number` | `"square"` | Image variant: image shape                    |
| `size`        | `"default" \| "lg"`                       | `"default"`  | `lg` for kiosks                                  |
| `classNames`  | `{ item, label, description, indicator }` |              | Applied to every item                            |

:::info

`RadioGroup` replaces shadcn's primitive in the main export and is compatible with it (shadcn `RadioGroupItem` children still work). The primitive is available from `@javaabu/onu/primitives`.

:::

## Accessibility

A `radiogroup`, labelled by its [`FormField`](../form-scaffolding/form-field) label (or `aria-label`). Errors set `aria-invalid` on the group and its items.

| Key        | Action                                                |
| ---------- | ----------------------------------------------------- |
| Tab        | Focus the checked radio (or the first)                |
| Arrow keys | Move to and check the next/previous radio; follow RTL (all four in the image variant) |
| Space      | Check the focused radio                               |

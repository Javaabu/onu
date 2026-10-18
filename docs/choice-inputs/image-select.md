# Image select

A grid of image options: one choice (radio semantics) or several (`multiple`, checkbox semantics). Tiles fit the container width (`minItemWidth`), so the grid works in narrow columns and on phones.

```tsx
import { ImageSelect } from '@javaabu/onu';

<ImageSelect
  options={[
    { value: 'lagoon', label: 'Lagoon', src: '/themes/lagoon.jpg', alt: '' },
    { value: 'reef', label: 'Reef', src: '/themes/reef.jpg', alt: '' },
  ]}
  defaultValue="lagoon"
/>
<ImageSelect options={photos} multiple max={3} aspectRatio="video" name="covers" />
```

## Props

| Prop                     | Type                                          | Default    | Description                                           |
| ------------------------ | --------------------------------------------- | ---------- | ----------------------------------------------------- |
| `options`                | `ImageOption[]`                               |            | `{ value, label, src, alt, description?, disabled? }` |
| `multiple`               | `boolean`                                     | `false`    | Checkbox semantics                                    |
| `value` / `defaultValue` | `string \| null` (`string[]` when multiple)   |            |                                                       |
| `onValueChange`          | `(value) => void`                             |            |                                                       |
| `aspectRatio`            | `"square" \| "video" \| "portrait" \| number` | `"square"` | Image shape                                           |
| `minItemWidth`           | CSS length                                    | `"8rem"`   | Minimum tile width                                    |
| `showLabels`             | `boolean`                                     | `true`     | Labels under images                                   |
| `max`                    | `number`                                      |            | Multiple only                                         |
| `name`                   | `string`                                      |            | Form value (`name[]` when multiple)                   |
| `classNames`             | `{ item, image, label, indicator }`           |            |                                                       |

`alt` is required (R14.10); use `""` when the label already describes the image.

## Accessibility

Single: a `radiogroup` of `radio` tiles (arrow keys, RTL aware). Multiple: a `group` of `checkbox` tiles (Tab + Space). Tiles are named by their label.

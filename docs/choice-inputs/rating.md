# Rating

A star rating with optional half steps, a read-only display mode and full keyboard support. Built in-house (no shadcn component exists); stars fill from the reading start, so from the right in RTL.

```tsx
import { Rating } from '@javaabu/onu';

<Rating aria-label="Service" value={value} onValueChange={setValue} allowHalf />
<Rating readOnly value={4.5} size="sm" />
<Rating max={10} icon="heart" name="score" />
```

## Props

| Prop                     | Type                        | Default     | Description                                |
| ------------------------ | --------------------------- | ----------- | ------------------------------------------ |
| `value` / `defaultValue` | `number`                    | `0`         | `0` means not rated                        |
| `onValueChange`          | `(value: number) => void`   |             |                                            |
| `max`                    | `number`                    | `5`         | Number of symbols                          |
| `allowHalf`              | `boolean`                   | `false`     | Half steps (pointer position and keyboard) |
| `readOnly`               | `boolean`                   | `false`     | Display only                               |
| `disabled`               | `boolean`                   |             |                                            |
| `clearable`              | `boolean`                   | `true`      | Clicking the current value clears it       |
| `size`                   | `"sm" \| "default" \| "lg"` | `"default"` | `ratingVariants`                           |
| `icon`                   | semantic icon name          | `"star"`    |                                            |
| `name`                   | `string`                    |             | Hidden input                               |
| `classNames`             | `{ star, filled }`          |             |                                            |

## Accessibility

Interactive ratings are a `slider` with `aria-valuetext` ("3.5 out of 5 stars"); read-only ratings are an `img` with the same text.

| Key        | Action              |
| ---------- | ------------------- |
| → / ↑      | Increase (← in RTL) |
| ← / ↓      | Decrease (→ in RTL) |
| Home / End | 0 / maximum         |
| 0–9        | Set that value      |

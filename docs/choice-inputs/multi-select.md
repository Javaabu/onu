# Multi-select

Pick several options. Selected values show as chips in the field (each with a remove button), the list has a "Select all" row for the visible options, and `max` caps the number of values. Same search as [Searchable select](./searchable-select.md).

```tsx
import { MultiSelect } from '@javaabu/onu';

<MultiSelect name="islands" options={islands} defaultValue={['male']} />
<MultiSelect options={ministries} max={3} maxVisibleChips={2} />
```

## Props

All [Searchable select](./searchable-select.md) props with `multiple` fixed on, plus:

| Prop                     | Type                        | Default | Description                                                |
| ------------------------ | --------------------------- | ------- | ---------------------------------------------------------- |
| `value` / `defaultValue` | `string[]`                  |         |                                                            |
| `onValueChange`          | `(values, options) => void` |         |                                                            |
| `selectAll`              | `boolean`                   | `true`  | "Select all" / "Deselect all" row                          |
| `max`                    | `number`                    |         | Maximum values; other options disable, a note explains why |
| `maxVisibleChips`        | `number`                    |         | Collapse the rest into "+N more"                           |
| `clearable`              | `boolean`                   | `true`  | Clear all button                                           |

With `name="islands"` it submits `islands[]` (Laravel arrays).

## Accessibility

Options carry `aria-checked`; the field announces "N selected". Each chip's remove button is labelled "Remove …". In the search field, **Backspace** on an empty search removes the last value. The list stays open while picking.

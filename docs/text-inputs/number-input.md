---
title: NumberInput
sidebar_position: 6
---

A numeric input with locale-aware formatting, `min` / `max` / `step`, and spinbutton keys. The value is shown formatted while the field is not focused (`12,500.00`) and as a plain number while editing (`12500`).

It is a text field with a numeric keyboard (`inputMode`), not `type="number"`, so the scroll wheel never changes the value by accident and formatting works in every locale.

```tsx
import { NumberInput } from "@javaabu/onu"

const [amount, setAmount] = useState<number | null>(1500)

<NumberInput
  value={amount}
  onValueChange={setAmount}
  min={0}
  step={0.01}
  formatOptions={{ style: "currency", currency: "MVR" }}
/>
```

`formatOptions` are `Intl.NumberFormat` options and use the active locale's `numberLocale` (Western digits for Dhivehi, R12.6). For `style: "percent"`, the value is a fraction (`0.08`) and the user edits `8`.

## Form submission

With a `name` (or inside a `FormField` with `name`), the raw number is submitted through a hidden input, so `1,234.5` is posted as `1234.5`. The visible input has no name.

## Props

| Prop                      | Type                               | Default     | Description                                           |
| ------------------------- | ---------------------------------- | ----------- | ----------------------------------------------------- |
| `value`                   | `number \| null`                   |             | Controlled value (`null` is empty)                    |
| `defaultValue`            | `number \| null`                   | `null`      | Initial value                                         |
| `onValueChange`           | `(value: number \| null) => void`  |             | Called as the user types or steps                     |
| `min` / `max`             | `number`                           |             | Limits (applied on blur and when stepping)            |
| `step`                    | `number`                           | `1`         | Arrow key step                                        |
| `largeStep`               | `number`                           | `step × 10` | Page Up/Down and Shift+Arrow step                     |
| `formatOptions`           | `Intl.NumberFormatOptions`         |             | Display format                                        |
| `clampOnBlur`             | `boolean`                          | `true`      | Clamp to `min` / `max` on blur                        |
| `inputMode`               | `"numeric" \| "decimal" \| "text"` | auto        | Keyboard; `numeric` for non-negative integers         |
| `startAddon` / `endAddon` | `ReactNode`                        |             | Addons, e.g. a unit (see [`UnitInput`](./unit-input)) |

Also exported: `parseLocaleNumber(text, numberLocale)` and `numberSymbols(numberLocale)`.

## RTL and Thaana

Always `dir="ltr"` with tabular figures. No `thaana` prop.

## Accessibility

The input has `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the formatted value), following the WAI-ARIA spinbutton pattern.

| Key                                          | Action                             |
| -------------------------------------------- | ---------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd>                  | Increase / decrease by `step`      |
| <kbd>Shift</kbd>+<kbd>↑</kbd> / <kbd>↓</kbd> | Increase / decrease by `largeStep` |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>    | Increase / decrease by `largeStep` |

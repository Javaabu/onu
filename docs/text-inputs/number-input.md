---
title: NumberInput
sidebar_position: 6
---

A numeric input with locale-aware formatting, `min` / `max` / `step`, spinbutton keys, an optional unit (fixed text or a unit select) and an optional stepper with large − and + buttons. The value is shown formatted while the field is not focused (`12,500.00`) and as a plain number while editing (`12500`).

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

## Units

`unit` shows fixed text beside the number (`kg`, `MVR`, `%`); `units` renders a unit select instead (`m` / `km`). The unit sits at the inline end, or the start with `unitPosition="start"`.

```tsx
<NumberInput unit="kg" defaultValue={23} min={0} />
<NumberInput unit="MVR" unitPosition="start" step={0.01} />

<NumberInput
  units={[{ value: "m", label: "m" }, { value: "km", label: "km" }]}
  defaultUnit="km"
  unitName="distance_unit"
  name="distance"
/>
```

The selected unit is controlled with `unitValue` / `onUnitChange` (uncontrolled: `defaultUnit`, else the first option) and submitted under `unitName`.

## Stepper

`stepper` adds large − and + buttons at the sides, for cart quantities, tickets and guest counts. Holding a button repeats the step (`repeatDelay`, then every `repeatInterval` ms); arrow keys work in the field as usual.

```tsx
const [tickets, setTickets] = useState(1)

<FormField label="Tickets">
  <NumberInput stepper value={tickets} onValueChange={setTickets} min={1} max={20} />
</FormField>
```

A stepper always holds a number: `min` defaults to `0`, `defaultValue` to `min`, and clearing the field falls back to `min`, so `value` and `onValueChange` use `number` rather than `number | null`. `size="sm" | "default" | "lg"` sets its height and width (variants exported as `numberInputVariants`); on touch screens the buttons are at least 44px in every size, and `lg` suits kiosks. A `unit` can sit next to the number between the buttons.

## Form submission

With a `name` (or inside a `FormField` with `name`), the raw number is submitted through a hidden input, so `1,234.5` is posted as `1234.5`. The visible input has no name.

## Props

| Prop                      | Type                                                                             | Default            | Description                                                |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------- |
| `value`                   | `number \| null` (`number` with `stepper`)                                       |                    | Controlled value (`null` is empty)                         |
| `defaultValue`            | `number \| null` (`number` with `stepper`)                                       | `null` / `min`     | Initial value                                              |
| `onValueChange`           | `(value: number \| null) => void` (`number` with `stepper`)                      |                    | Called as the user types or steps                          |
| `min` / `max`             | `number`                                                                         | `0` with `stepper` | Limits (applied on blur and when stepping)                 |
| `step`                    | `number`                                                                         | `1`                | Arrow key and stepper button step                          |
| `largeStep`               | `number`                                                                         | `step × 10`        | Page Up/Down and Shift+Arrow step                          |
| `formatOptions`           | `Intl.NumberFormatOptions`                                                       |                    | Display format                                             |
| `clampOnBlur`             | `boolean`                                                                        | `true`             | Clamp to `min` / `max` on blur                             |
| `inputMode`               | `"numeric" \| "decimal" \| "text"`                                               | auto               | Keyboard; `numeric` for non-negative integers              |
| `unit`                    | `ReactNode`                                                                      |                    | Fixed unit text                                            |
| `units`                   | `{ value, label, disabled? }[]`                                                  |                    | Choosable units (renders a select)                         |
| `unitValue`               | `string`                                                                         |                    | Controlled unit                                            |
| `defaultUnit`             | `string`                                                                         | first              | Initial unit                                               |
| `onUnitChange`            | `(unit: string) => void`                                                         |                    | Called when the unit changes                               |
| `unitName`                | `string`                                                                         |                    | Form field name for the unit                               |
| `unitLabel`               | `string`                                                                         | "Unit"             | Accessible name of the unit select                         |
| `unitPosition`            | `"start" \| "end"`                                                               | `"end"`            | Which side the unit sits on                                |
| `stepper`                 | `boolean`                                                                        | `false`            | Large − and + buttons with press-and-hold repeat           |
| `size`                    | `"sm" \| "default" \| "lg"`                                                      | `"default"`        | Stepper size (with `stepper`)                              |
| `repeatDelay`             | `number`                                                                         | `400`              | ms before press-and-hold starts repeating (with `stepper`) |
| `repeatInterval`          | `number`                                                                         | `80`               | ms between repeats (with `stepper`)                        |
| `startAddon` / `endAddon` | `ReactNode`                                                                      |                    | Your own addons; the unit sits between them and the number |
| `classNames`              | `{ root, input, startAddon, endAddon, unit, unitTrigger, decrement, increment }` |                    | Classes for each part                                      |

Also exported: `parseLocaleNumber(text, numberLocale)`, `numberSymbols(numberLocale)`, `numberInputVariants` and the `NumberInputUnitOption`, `NumberInputFieldProps` and `NumberInputStepperProps` types.

## RTL and Thaana

Always `dir="ltr"` with tabular figures. No `thaana` prop. The unit and the stepper buttons sit at the inline start and end, so they swap sides in RTL (− at the inline start, + at the inline end); the number itself stays left-to-right.

## Accessibility

The input has `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the formatted value), following the WAI-ARIA spinbutton pattern.

- The unit select is a shadcn `Select` (Radix) named "Unit" from the locale, or `unitLabel`. Label the number itself with a [`FormField`](../form-scaffolding/form-field).
- The stepper buttons are named "Decrease" / "Increase" from the locale. They are not in the tab order (the spinbutton's arrow keys do the same), but are clickable and work with voice control. At a limit they get `aria-disabled` and stop responding.
- Press-and-hold uses pointer events, so it works with touch, pen and mouse; a click from the keyboard or assistive technology steps once.

| Key                                             | Action                             |
| ----------------------------------------------- | ---------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd>                     | Increase / decrease by `step`      |
| <kbd>Shift</kbd>+<kbd>↑</kbd> / <kbd>↓</kbd>    | Increase / decrease by `largeStep` |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>       | Increase / decrease by `largeStep` |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the unit | Open the unit list                 |

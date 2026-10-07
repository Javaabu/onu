---
title: UnitInput
sidebar_position: 8
---

A number with a unit add-on: either fixed text (`kg`, `MVR`, `%`) or a unit select (`m` / `km`). Built on [`NumberInput`](./number-input), so it has the same formatting and keys.

```tsx
import { UnitInput } from "@javaabu/onu"

<UnitInput unit="kg" defaultValue={23} min={0} />
<UnitInput unit="MVR" unitPosition="start" step={0.01} />

<UnitInput
  units={[{ value: "m", label: "m" }, { value: "km", label: "km" }]}
  defaultUnit="km"
  unitName="distance_unit"
  name="distance"
/>
```

## Props

| Prop           | Type                                 | Default | Description                        |
| -------------- | ------------------------------------ | ------- | ---------------------------------- |
| `unit`         | `ReactNode`                          |         | Fixed unit text                    |
| `units`        | `{ value, label, disabled? }[]`      |         | Choosable units (renders a select) |
| `unitValue`    | `string`                             |         | Controlled unit                    |
| `defaultUnit`  | `string`                             | first   | Initial unit                       |
| `onUnitChange` | `(unit: string) => void`             |         | Called when the unit changes       |
| `unitName`     | `string`                             |         | Form field name for the unit       |
| `unitLabel`    | `string`                             | "Unit"  | Accessible name of the unit select |
| `unitPosition` | `"start" \| "end"`                   | `"end"` | Which side the unit sits on        |
| `classNames`   | `{ root, input, unit, unitTrigger }` |         | Classes for each part              |

All [`NumberInput`](./number-input) props are supported.

## RTL

The unit sits at the inline end (or start), so it swaps sides in RTL; the number stays left-to-right.

## Accessibility

The unit select is a shadcn `Select` (Radix) named "Unit" from the locale, or `unitLabel`. Use a [`FormField`](../form-scaffolding/form-field) label for the number.

| Key                                             | Action             |
| ----------------------------------------------- | ------------------ |
| <kbd>↑</kbd> / <kbd>↓</kbd> in the number       | Step the value     |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the unit | Open the unit list |

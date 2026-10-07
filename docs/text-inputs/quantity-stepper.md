---
title: QuantityStepper
sidebar_position: 7
---

A number with large − and + buttons, for cart quantities, tickets and guest counts. Holding a button repeats the step; arrow keys work in the field. Built on [`NumberInput`](./number-input).

```tsx
import { QuantityStepper } from "@javaabu/onu"

const [tickets, setTickets] = useState(1)

<FormField label="Tickets">
  <QuantityStepper value={tickets} onValueChange={setTickets} min={1} max={20} />
</FormField>
```

## Sizes

`size="sm" | "default" | "lg"` (variants exported as `quantityStepperVariants`). On touch screens the buttons are at least 44px in every size; `lg` suits kiosks.

## Props

| Prop             | Type                                    | Default     | Description                               |
| ---------------- | --------------------------------------- | ----------- | ----------------------------------------- |
| `value`          | `number`                                |             | Controlled value                          |
| `defaultValue`   | `number`                                | `min`       | Initial value                             |
| `onValueChange`  | `(value: number) => void`               |             | Called on every change                    |
| `min`            | `number`                                | `0`         | Lowest value                              |
| `max`            | `number`                                |             | Highest value                             |
| `step`           | `number`                                | `1`         | Step for buttons and arrow keys           |
| `size`           | `"sm" \| "default" \| "lg"`             | `"default"` | Size                                      |
| `repeatDelay`    | `number`                                | `400`       | ms before press-and-hold starts repeating |
| `repeatInterval` | `number`                                | `80`        | ms between repeats                        |
| `classNames`     | `{ root, input, decrement, increment }` |             | Classes for each part                     |

Other `NumberInput` props (`formatOptions`, `name`, `disabled`, …) are passed through.

## RTL

The − button sits at the inline start and + at the inline end, so they swap sides in RTL. The number itself stays left-to-right.

## Accessibility

- The field is a `spinbutton` (see [`NumberInput`](./number-input)); the buttons are named "Decrease" / "Increase" from the locale.
- The buttons are not in the tab order (the spinbutton's arrow keys do the same), but are clickable and work with voice control. At a limit they get `aria-disabled` and stop responding.
- Press-and-hold uses pointer events, so it works with touch, pen and mouse.

| Key                                       | Action                          |
| ----------------------------------------- | ------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd>               | Increase / decrease by `step`   |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Increase / decrease by 10 steps |

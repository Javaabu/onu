---
title: TimePicker
sidebar_position: 2
---

A time field that opens large hour and minute steppers with ▲/▼, an AM/PM switch, a clock-face hour grid and a minute grid (REQUIREMENTS §25.2). Popover on desktop, bottom sheet on phones.

```tsx
import { TimePicker } from "@javaabu/onu"

;<FormField label="Opens at" name="opens_at">
  <TimePicker />
</FormField>
```

## Values

The value is a `Date` (its date part is kept; changing the hour never changes the date) or `null`. An empty field gets its first time on `referenceDate` (default today). With `name`, a hidden input posts `HH:mm`.

```tsx
<TimePicker value={time} onChange={setTime} />
<TimePicker hourCycle={24} minuteStep={15} />
```

- ▲/▼ change the value by one and wrap: ▼ on 12 gives 11, ▲ on 59 minutes gives 00.
- **AM / PM** keeps the hour on the clock (9 AM ↔ 9 PM). <kbd>A</kbd> and <kbd>P</kbd> switch directly.
- Clicking the hour opens 12 cells laid out like a clock (00–23 on two rings in 24-hour mode); clicking the minute opens one cell per `minuteStep`. A minute off the grid (07 with a 5-minute step) highlights no cell. **Back** returns without changing anything.

## Props

| Prop                     | Type                            | Default          | Description                               |
| ------------------------ | ------------------------------- | ---------------- | ----------------------------------------- |
| `value` / `defaultValue` | `Date \| null`                  |                  | Selected time                             |
| `onChange`               | `(value: Date \| null) => void` |                  |                                           |
| `hourCycle`              | `12 \| 24`                      | locale           | 12-hour with AM/PM, or 24-hour            |
| `minuteStep`             | `number`                        | `5`              | Minutes between cells in the minute grid  |
| `format`                 | `string`                        | `h:mm a`/`HH:mm` | date-fns display format                   |
| `referenceDate`          | `Date`                          | today            | Date used when an empty field gets a time |

Plus the shared picker field props (`name`, `placeholder`, `required`, `clearable`, `disabled`, `open`, `sheet`, `size`, `className`, `classNames`, `ref`); see [DatePicker](./date-picker#props).

## Accessibility

- The hour and minute are `spinbutton`s with `aria-valuenow` / `aria-valuetext` ("2 PM"); ▲/▼ buttons are mouse/touch shortcuts for the same action.
- AM/PM is a labelled group of toggle buttons with `aria-pressed`.
- Grids follow the APG grid pattern with roving focus; focus returns to the number that opened them.

| Key                                             | Action                                      |
| ----------------------------------------------- | ------------------------------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd> on a number         | Step it by one (wraps)                      |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a number | Open the hour or minute grid                |
| <kbd>A</kbd> / <kbd>P</kbd>                     | AM / PM (12-hour mode)                      |
| Arrow keys in a grid                            | Move between cells (clockwise on the clock) |
| <kbd>Home</kbd> / <kbd>End</kbd> in a grid      | First / last cell (row in the minute grid)  |
| <kbd>Enter</kbd> in a grid                      | Pick the cell and return to the steppers    |
| <kbd>Escape</kbd>                               | Close; focus returns to the field           |

## RTL and Dhivehi

In Dhivehi, AM/PM read މކ / މފ and every label is translated. The clock face is never mirrored, since clocks read the same in every script.

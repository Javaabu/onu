---
title: TimePanel
sidebar_position: 12
---

The steppers, clock-face hour grid and minute grid used inside [TimePicker](./time-picker) and [DateTimePicker](./date-time-picker), for use inline (e.g. in a card or a custom popover).

```tsx
import { TimePanel, type TimeValue } from "@javaabu/onu"

const [time, setTime] = React.useState<TimeValue | null>({ hours: 9, minutes: 30 })
<TimePanel value={time} onChange={setTime} />
```

## Props

| Prop                                    | Type                                 | Default      | Description                 |
| --------------------------------------- | ------------------------------------ | ------------ | --------------------------- |
| `value`                                 | `{ hours, minutes } \| null`         |              | `null` shows "--"           |
| `onChange`                              | `(value: TimeValue) => void`         |              |                             |
| `hourCycle`                             | `12 \| 24`                           | locale       |                             |
| `minuteStep`                            | `number`                             | `5`          | Minute grid step            |
| `view` / `defaultView` / `onViewChange` | `"steppers" \| "hours" \| "minutes"` | `"steppers"` | Which part is shown         |
| `initialFocus`                          | `boolean`                            |              | Focus the hour when mounted |
| `className`                             | `string`                             |              | Root classes                |
| `classNames`                            | `{ stepper, number, period, grid }`  |              | Classes for each part       |
| `ref`                                   | `Ref<HTMLDivElement>`                |              | Root element                |

## Accessibility

Same model as the [TimePicker](./time-picker#accessibility): spinbuttons for hour and minute, a labelled AM/PM group, and APG grids with roving focus. <kbd>A</kbd>/<kbd>P</kbd> switch AM/PM anywhere in the panel.

## RTL and Dhivehi

All labels are translated; the clock face keeps its orientation in RTL.

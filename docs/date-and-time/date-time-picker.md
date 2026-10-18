# DateTimePicker

A calendar with a **time chip** underneath (REQUIREMENTS §25.3). Clicking the chip swaps the calendar for the [time steppers](./time-panel.md); **Back to calendar** swaps back. **Clear time** resets the time to 00:00 and keeps the date. Picking a day before any time sets 00:00.

```tsx
import { DateTimePicker } from "@javaabu/onu"

;<FormField label="Meeting starts" name="starts_at">
  <DateTimePicker />
</FormField>
```

The field shows both parts, e.g. `12/03/2026 2:30 PM`. With `name`, a hidden input posts a local ISO date-time, `yyyy-MM-ddTHH:mm:ss` (Laravel's `date` rule accepts it). The panel stays open after picking a day so the time can still be set; **Done** closes it.

## Props

| Prop                                                             | Type                            | Default             | Description                                               |
| ---------------------------------------------------------------- | ------------------------------- | ------------------- | --------------------------------------------------------- |
| `value` / `defaultValue`                                         | `Date \| null`                  |                     |                                                           |
| `onChange`                                                       | `(value: Date \| null) => void` |                     |                                                           |
| `format`                                                         | `string`                        | `dd/MM/yyyy h:mm a` | date-fns display format                                   |
| `hourCycle`                                                      | `12 \| 24`                      | locale              |                                                           |
| `minuteStep`                                                     | `number`                        | `5`                 |                                                           |
| `defaultTime`                                                    | `{ hours, minutes }`            | `00:00`             | Time for a day picked before any time, and for Clear time |
| `min` / `max` / `disabledDates` / `weekStartsOn` / `weekendDays` |                                 |                     | As for [DatePicker](./date-picker.md#props)                  |

Plus the shared picker field props; see [DatePicker](./date-picker.md#props).

## Accessibility

- The time chip is a button named "Change time, 2:30 PM". Going back to the calendar returns focus to it.
- Calendar and steppers keep the keyboard models of [DatePicker](./date-picker.md#accessibility) and [TimePicker](./time-picker.md#accessibility). <kbd>Escape</kbd> closes from either view and returns focus to the field.

## RTL and Dhivehi

Calendar, chip and steppers follow the locale and direction; Dhivehi gives Dhivehi names and މކ/މފ.

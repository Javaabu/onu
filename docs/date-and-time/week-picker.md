# WeekPicker

Picks a whole week: clicking any day selects its week, hovering previews the week, and week numbers are shown. Built in-house on the shadcn calendar (no library offers a week picker).

```tsx
import { WeekPicker } from "@javaabu/onu"

;<FormField label="Roster week" name="roster_week">
  <WeekPicker />
</FormField>
```

The value is the first day of the week (`Date`), following the locale's week start or `weekStartsOn`. The field shows "Week 12, 2026 (15 Mar – 21 Mar)"; the hidden input posts the first day (`yyyy-MM-dd`).

## Props

| Prop                        | Type                                 | Default | Description                              |
| --------------------------- | ------------------------------------ | ------- | ---------------------------------------- |
| `value` / `defaultValue`    | `Date \| null`                       |         | First day of the week                    |
| `onChange`                  | `(value: Date \| null) => void`      |         |                                          |
| `weekStartsOn`              | `0–6`                                | locale  |                                          |
| `formatWeek`                | `(start: Date, end: Date) => string` |         | Custom field text                        |
| `min`, `max`, `weekendDays` |                                      |         | As for [DatePicker](./date-picker.md#props) |

Plus the shared picker field props.

## Accessibility

Days keep the [DatePicker keyboard model](./date-picker.md#accessibility); <kbd>Enter</kbd> on any day picks its week. All seven days of the selected week have `aria-selected`; week numbers are row headers.

## RTL and Dhivehi

"2026 ގެ 11 ވަނަ ހަފްތާ" in Dhivehi; the week row mirrors in RTL.

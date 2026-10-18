# MonthPicker and YearPicker

Pick a month (or a year) from a grid of 12 that zooms out to years and ranges of years. Same calendar header and keyboard model as the [DatePicker](./date-picker.md).

```tsx
import { MonthPicker, YearPicker } from "@javaabu/onu"

<FormField label="Payroll month" name="payroll_month">
  <MonthPicker />
</FormField>
<FormField label="Year of graduation" name="year">
  <YearPicker />
</FormField>
```

The value is the first day of the month (or year) as a `Date`, or `null`. Hidden inputs post `yyyy-MM` (month) or `yyyy` (year).

## Props

| Prop                     | Type                            | Default              | Description                         |
| ------------------------ | ------------------------------- | -------------------- | ----------------------------------- |
| `value` / `defaultValue` | `Date \| null`                  |                      | First day of the month / year       |
| `onChange`               | `(value: Date \| null) => void` |                      |                                     |
| `format`                 | `string`                        | `LLLL yyyy` / `yyyy` | date-fns display format             |
| `min` / `max`            | `Date`                          |                      | Months/years outside are greyed out |

Plus the shared picker field props; see [DatePicker](./date-picker.md#props).

## Accessibility

Months and years are APG grids with roving focus: arrows move (swapped in RTL), <kbd>Page Up</kbd>/<kbd>Page Down</kbd> change the year (12 years in the years view), <kbd>Home</kbd>/<kbd>End</kbd> go to the row start/end, <kbd>Enter</kbd> picks, <kbd>Escape</kbd> closes and returns focus. The current month/year has `aria-current="date"`.

## RTL and Dhivehi

Month names come from the locale (މާޗު 2026 in Dhivehi); the chevrons mirror in RTL.

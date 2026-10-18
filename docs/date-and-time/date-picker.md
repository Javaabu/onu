# DatePicker

A date field that opens a calendar. Built on shadcn's `Calendar` (react-day-picker) inside a `Popover`, or a bottom-sheet `Drawer` on phones (R3.28). The header zooms out from days to months, years and ranges of years (REQUIREMENTS §25.1).

```tsx
import { DatePicker } from "@javaabu/onu"

;<DatePicker aria-label="Date of birth" />
```

Inside a [`FormField`](../form-scaffolding/form-field.md) the picker gets its `id`, `name`, label, help text, errors, `required` and `disabled` from the field:

```tsx
<FormField label="Joined on" name="joined_on" help="As in the contract" required>
  <DatePicker />
</FormField>
```

## Values

The value is a `Date` (local midnight) or `null`. Use it controlled or uncontrolled:

```tsx
const [date, setDate] = React.useState<Date | null>(null)
<DatePicker value={date} onChange={setDate} />
<DatePicker defaultValue={new Date(2026, 2, 12)} />
```

With a `name` (directly or from the `FormField`), a hidden input posts `yyyy-MM-dd`, so plain HTML and Laravel forms work without JavaScript glue. `parseISODate("2026-03-12")` turns a server value back into a `Date`.

## Limits and formats

```tsx
<DatePicker min={new Date()} max={addDays(new Date(), 30)} disabledDates={{ dayOfWeek: [5] }} />
<DatePicker format="EEEE, d MMMM yyyy" />
<DatePicker weekStartsOn={1} weekendDays={[0, 6]} showWeekNumber />
```

`format` is a date-fns pattern formatted with the active locale; the default is `dd/MM/yyyy`. The week start and month/day names come from the locale (`dv` gives Dhivehi names). Friday and Saturday are styled as the weekend by default.

## Props

| Prop                                    | Type                                        | Default         | Description                                       |
| --------------------------------------- | ------------------------------------------- | --------------- | ------------------------------------------------- |
| `value` / `defaultValue`                | `Date \| null`                              |                 | Selected date                                     |
| `onChange`                              | `(value: Date \| null) => void`             |                 | Called on select and on Clear                     |
| `format`                                | `string`                                    | `"dd/MM/yyyy"`  | date-fns display format                           |
| `placeholder`                           | `string`                                    | "Select a date" | Shown when empty                                  |
| `min` / `max`                           | `Date`                                      |                 | Earliest / latest selectable day                  |
| `disabledDates`                         | `Matcher \| Matcher[]`                      |                 | react-day-picker matchers                         |
| `weekStartsOn`                          | `0–6`                                       | locale          | First day of the week                             |
| `weekendDays`                           | `number[]`                                  | `[5, 6]`        | Days styled as weekend                            |
| `showWeekNumber`                        | `boolean`                                   | `false`         | Week number column                                |
| `name`                                  | `string`                                    |                 | Hidden input with `yyyy-MM-dd`                    |
| `required`                              | `boolean`                                   |                 | Hides Clear, sets `aria-required`                 |
| `clearable`                             | `boolean`                                   | `!required`     | Show Clear                                        |
| `disabled`                              | `boolean`                                   |                 | Field does nothing when clicked                   |
| `open` / `defaultOpen` / `onOpenChange` |                                             |                 | Panel open state                                  |
| `sheet`                                 | `"auto" \| boolean`                         | `"auto"`        | Bottom sheet on phones (`auto`), always, or never |
| `size`                                  | `"sm" \| "default" \| "lg"`                 | `"default"`     | Field height (`pickerTriggerVariants`)            |
| `today`                                 | `Date`                                      | now             | Pins "today" (tests, demos, server time)          |
| `className`                             | `string`                                    |                 | Classes for the field                             |
| `classNames`                            | `{ trigger, value, icon, content, footer }` |                 | Classes for each part                             |
| `ref`                                   | `Ref<HTMLButtonElement>`                    |                 | The field button                                  |

Every other picker in this group shares the field props from `required` down (`PickerFieldProps`).

## Accessibility

- The field is a button with `role="combobox"` and `aria-haspopup="dialog"`, named by its label plus its value. It carries `aria-invalid`, `aria-required` and the field's help/error description.
- The panel is a labelled dialog. Opening it focuses the selected day (or today); nothing is selected until a day is clicked. Closing returns focus to the field.
- Days are a grid (APG grid pattern) with full day names (`Today, Thursday, March 12th, 2026`); month changes and the selected date are announced through polite live regions.
- Keyboard arrows follow visual order, so they swap in RTL (R11.5).

| Key                                              | Action                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the field | Open the picker                                                                                           |
| <kbd>←</kbd> <kbd>→</kbd>                        | Previous / next day (or cell in the month and year views)                                                 |
| <kbd>↑</kbd> <kbd>↓</kbd>                        | Previous / next week (or row)                                                                             |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>        | Previous / next month (year in the months view, 12 years in the years view, 144 years in the ranges view) |
| <kbd>Shift</kbd>+<kbd>Page Up/Down</kbd>         | Previous / next year (days view)                                                                          |
| <kbd>Home</kbd> / <kbd>End</kbd>                 | Start / end of the week (or row)                                                                          |
| <kbd>Enter</kbd> / <kbd>Space</kbd>              | Select the highlighted day, or zoom into the highlighted cell                                             |
| <kbd>Escape</kbd>                                | Close without changing anything; focus returns to the field                                               |

## RTL and Dhivehi

With `locale="dv"` the calendar uses Dhivehi month and weekday names (from Onu's Dhivehi date-fns locale), the header chevrons mirror, and the panel follows `dir`. Dates use Western digits (R12.6).

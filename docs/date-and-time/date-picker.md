# DatePicker

A date field that opens a calendar. Built on shadcn's `Calendar` (react-day-picker) inside a `Popover`, or a bottom-sheet `Drawer` on phones (R3.28). The header zooms out from days to months, years and ranges of years (REQUIREMENTS §25.1).

```tsx
import { DatePicker } from "@javaabu/onu"

;<DatePicker aria-label="Date of birth" />
```

`mode` sets what the field holds: one date (the default), [several dates](#several-dates), a [week](#weeks), or a [month or year](#months-and-years).

```tsx
<DatePicker mode="multiple" maxSelected={5} />
<DatePicker mode="week" />
<DatePicker mode="month" />
<DatePicker mode="year" />
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

| Prop                                    | Type                                                    | Default         | Description                                       |
| --------------------------------------- | ------------------------------------------------------- | --------------- | ------------------------------------------------- |
| `mode`                                  | `"single" \| "multiple" \| "week" \| "month" \| "year"` | `"single"`      | What the field holds; see the sections below      |
| `value` / `defaultValue`                | `Date \| null`                                          |                 | Selected date                                     |
| `onChange`                              | `(value: Date \| null) => void`                         |                 | Called on select and on Clear                     |
| `format`                                | `string`                                                | `"dd/MM/yyyy"`  | date-fns display format                           |
| `placeholder`                           | `string`                                                | "Select a date" | Shown when empty                                  |
| `min` / `max`                           | `Date`                                                  |                 | Earliest / latest selectable day                  |
| `disabledDates`                         | `Matcher \| Matcher[]`                                  |                 | react-day-picker matchers                         |
| `weekStartsOn`                          | `0–6`                                                   | locale          | First day of the week                             |
| `weekendDays`                           | `number[]`                                              | `[5, 6]`        | Days styled as weekend                            |
| `showWeekNumber`                        | `boolean`                                               | `false`         | Week number column                                |
| `name`                                  | `string`                                                |                 | Hidden input with `yyyy-MM-dd`                    |
| `required`                              | `boolean`                                               |                 | Hides Clear, sets `aria-required`                 |
| `clearable`                             | `boolean`                                               | `!required`     | Show Clear                                        |
| `disabled`                              | `boolean`                                               |                 | Field does nothing when clicked                   |
| `open` / `defaultOpen` / `onOpenChange` |                                                         |                 | Panel open state                                  |
| `sheet`                                 | `"auto" \| boolean`                                     | `"auto"`        | Bottom sheet on phones (`auto`), always, or never |
| `size`                                  | `"sm" \| "default" \| "lg"`                             | `"default"`     | Field height (`pickerTriggerVariants`)            |
| `today`                                 | `Date`                                                  | now             | Pins "today" (tests, demos, server time)          |
| `className`                             | `string`                                                |                 | Classes for the field                             |
| `classNames`                            | `{ trigger, value, icon, content, footer }`             |                 | Classes for each part                             |
| `ref`                                   | `Ref<HTMLButtonElement>`                                |                 | The field button                                  |

Every other picker in this group shares the field props from `required` down (`PickerFieldProps`). The table is for `mode="single"`; the other modes change the value and a few props, below.

## Several dates

`mode="multiple"` picks any number of days from one calendar. Clicking a day toggles it; the panel stays open until **Done**.

```tsx
<FormField label="Training days" name="training_days">
  <DatePicker mode="multiple" maxSelected={5} />
</FormField>
```

The value is a sorted `Date[]`. The field lists up to `maxShown` dates ("5 Mar 2026, 20 Mar 2026"), then "3 dates selected". With `name`, one hidden input per date posts `name[]` (`yyyy-MM-dd`). When `maxSelected` is reached, other days are disabled until one is removed. Selected days have `aria-selected`, and the count is announced politely as it changes ("3 ތާރީޚު ހޮވިފައި" in Dhivehi).

| Prop                     | Type                      | Default      | Description                              |
| ------------------------ | ------------------------- | ------------ | ---------------------------------------- |
| `value` / `defaultValue` | `Date[]`                  | `[]`         |                                          |
| `onChange`               | `(value: Date[]) => void` |              |                                          |
| `format`                 | `string`                  | `d MMM yyyy` | Format of each date in the field         |
| `maxShown`               | `number`                  | `2`          | Dates listed before switching to a count |
| `maxSelected`            | `number`                  |              | Most dates that can be picked            |

## Weeks

`mode="week"` picks a whole week: clicking any day selects its week, hovering previews the week, and week numbers are shown. Built in-house on the shadcn calendar (no library offers a week picker).

```tsx
<FormField label="Roster week" name="roster_week">
  <DatePicker mode="week" />
</FormField>
```

The value is the first day of the week (`Date`), following the locale's week start or `weekStartsOn`. The field shows "Week 12, 2026 (15 Mar – 21 Mar)" ("2026 ގެ 11 ވަނަ ހަފްތާ" in Dhivehi); the hidden input posts the first day (`yyyy-MM-dd`). <kbd>Enter</kbd> on any day picks its week. All seven days of the selected week have `aria-selected`; week numbers are row headers.

| Prop                     | Type                                 | Default | Description           |
| ------------------------ | ------------------------------------ | ------- | --------------------- |
| `value` / `defaultValue` | `Date \| null`                       |         | First day of the week |
| `onChange`               | `(value: Date \| null) => void`      |         |                       |
| `formatWeek`             | `(start: Date, end: Date) => string` |         | Custom field text     |

`showWeekNumber` and `format` don't apply; week numbers are always shown.

## Months and years

`mode="month"` (or `"year"`) picks from a grid of 12 that zooms out to years and ranges of years, with the same header and keyboard model.

```tsx
<FormField label="Payroll month" name="payroll_month">
  <DatePicker mode="month" />
</FormField>
<FormField label="Year of graduation" name="year">
  <DatePicker mode="year" />
</FormField>
```

The value is the first day of the month (or year) as a `Date`, or `null`. Hidden inputs post `yyyy-MM` (month) or `yyyy` (year). `format` defaults to `LLLL yyyy` (or `yyyy`), and months/years outside `min`/`max` are greyed out. The day-grid props (`disabledDates`, `weekStartsOn`, `weekendDays`, `showWeekNumber`) don't apply.

Months and years are APG grids with roving focus: arrows move (swapped in RTL), <kbd>Page Up</kbd>/<kbd>Page Down</kbd> change the year (12 years in the years view), <kbd>Home</kbd>/<kbd>End</kbd> go to the row start/end, <kbd>Enter</kbd> picks, <kbd>Escape</kbd> closes and returns focus. The current month/year has `aria-current="date"`; month names come from the locale (މާޗު 2026 in Dhivehi).

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

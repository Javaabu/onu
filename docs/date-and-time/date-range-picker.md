---
title: DateRangePicker
sidebar_position: 4
---

Two fields side by side, **From** and **To**, each opening a [DatePicker](./date-picker) (or a [DateTimePicker](./date-time-picker) with `withTime`). REQUIREMENTS §25.4.

```tsx
import { DateRangePicker, type DateRangeValue } from "@javaabu/onu"

const [range, setRange] = React.useState<DateRangeValue>({ from: null, to: null })
<FormField label="Leave period" name="leave">
  <DateRangePicker value={range} onChange={setRange} />
</FormField>
```

- Either end may be `null` for an open-ended range ("from 1 March onwards", "up to 31 March").
- Without `withTime`, `to` is the **end of that day** (23:59:59.999). With `withTime`, the To field's time defaults to 23:59.
- If To is before From, the message "End date is before start date" shows under the fields and both triggers are marked invalid.
- With `name`, hidden inputs post `name[from]` and `name[to]` (`yyyy-MM-dd`, or ISO date-time with `withTime`); override them with `names`.
- The fields stack in narrow containers (container query).

## Props

| Prop                                                                                              | Type                                       | Default                    | Description              |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------- | ------------------------ |
| `value` / `defaultValue`                                                                          | `{ from: Date \| null; to: Date \| null }` | `{ from: null, to: null }` |                          |
| `onChange`                                                                                        | `(value: DateRangeValue) => void`          |                            |                          |
| `withTime`                                                                                        | `boolean`                                  | `false`                    | Pick a time for each end |
| `names`                                                                                           | `{ from?, to? }`                           | `name[from]`, `name[to]`   | Hidden input names       |
| `labels`                                                                                          | `{ from?, to? }`                           | "From", "To"               | Sub-field labels         |
| `placeholders`                                                                                    | `{ from?, to? }`                           |                            |                          |
| `format`, `min`, `max`, `disabledDates`, `weekStartsOn`, `weekendDays`, `hourCycle`, `minuteStep` |                                            |                            | Passed to both pickers   |
| `classNames`                                                                                      | `{ root, field, label, trigger, error }`   |                            | Classes for each part    |
| `ref`                                                                                             | `Ref<HTMLDivElement>`                      |                            | The group element        |

`name`, `required`, `disabled`, `clearable`, `sheet`, `size`, `today` and `aria-*` apply to both fields.

## Accessibility

- The range is a `role="group"` named by the `FormField` label (or `aria-label`, default "Date range"). Each trigger is named by the field label plus "From"/"To" plus its value; the `FormField` label points at the From field.
- The reversed-range message is a `role="alert"` and is added to each trigger's description.
- Each field has the full [DatePicker keyboard model](./date-picker#accessibility).

## RTL and Dhivehi

From sits at the inline start, so it is on the right in RTL. Labels and the error are translated (ފެށޭ ތާރީޚު / ނިމޭ ތާރީޚު).

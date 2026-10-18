# MultipleDatePicker

Picks any number of days from one calendar. Clicking a day toggles it; the panel stays open until **Done**.

```tsx
import { MultipleDatePicker } from "@javaabu/onu"

;<FormField label="Training days" name="training_days">
  <MultipleDatePicker maxSelected={5} />
</FormField>
```

The value is a sorted `Date[]`. The field lists up to `maxShown` dates ("5 Mar 2026, 20 Mar 2026"), then "3 dates selected". With `name`, one hidden input per date posts `name[]` (`yyyy-MM-dd`). When `maxSelected` is reached, other days are disabled until one is removed.

## Props

| Prop                                                         | Type                      | Default      | Description                              |
| ------------------------------------------------------------ | ------------------------- | ------------ | ---------------------------------------- |
| `value` / `defaultValue`                                     | `Date[]`                  | `[]`         |                                          |
| `onChange`                                                   | `(value: Date[]) => void` |              |                                          |
| `format`                                                     | `string`                  | `d MMM yyyy` | Format of each date in the field         |
| `maxShown`                                                   | `number`                  | `2`          | Dates listed before switching to a count |
| `maxSelected`                                                | `number`                  |              | Most dates that can be picked            |
| `min`, `max`, `disabledDates`, `weekStartsOn`, `weekendDays` |                           |              | As for [DatePicker](./date-picker.md#props) |

Plus the shared picker field props.

## Accessibility

Same calendar and keyboard model as the [DatePicker](./date-picker.md#accessibility); selected days have `aria-selected`. The count ("3 dates selected") is announced politely as it changes.

## RTL and Dhivehi

Translated count ("3 ތާރީޚު ހޮވިފައި"), Dhivehi month and day names, mirrored layout.

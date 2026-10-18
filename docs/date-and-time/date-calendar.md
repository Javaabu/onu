# DateCalendar

The calendar inside every Onu date picker, for use inline. The days view is shadcn's `Calendar` (react-day-picker); clicking the header zooms out to **months**, **years** (12) and **ranges of years** (12 blocks of 12), which are accessible grids with the same keyboard model (REQUIREMENTS §25.1).

```tsx
import { DateCalendar } from "@javaabu/onu"

<DateCalendar selected={date} onSelect={setDate} />
<DateCalendar mode="multiple" selected={dates} onSelect={setDates} maxSelected={3} />
<DateCalendar mode="range" selected={range} onSelect={setRange} />
<DateCalendar minView="month" onPeriodSelect={setMonth} />   // a month grid
```

`mode="none"` turns off built-in selection so you can use `onDayClick` and `modifiers` (the week picker does this). It is not exported as `Calendar`, so shadcn's `Calendar` primitive stays available unchanged.

## Props

| Prop                                                               | Type                                          | Default           | Description                                           |
| ------------------------------------------------------------------ | --------------------------------------------- | ----------------- | ----------------------------------------------------- |
| `mode`                                                             | `"single" \| "multiple" \| "range" \| "none"` | `"single"`        |                                                       |
| `selected` / `onSelect`                                            | `Date \| null`, `Date[]`, or `{ from, to }`   |                   | Per mode                                              |
| `maxSelected`                                                      | `number`                                      |                   | `multiple` only; other days are disabled at the limit |
| `min` / `max` / `disabledDates`                                    | `Date`, `Matcher \| Matcher[]`                |                   | Disabled days, months and years                       |
| `month` / `defaultMonth` / `onMonthChange`                         | `Date`                                        | selected or today | Displayed month                                       |
| `view` / `defaultView` / `onViewChange`                            | `"day" \| "month" \| "year" \| "decade"`      | `minView`         | Zoom level                                            |
| `minView`                                                          | `"day" \| "month" \| "year"`                  | `"day"`           | Lowest zoom level                                     |
| `onPeriodSelect`                                                   | `(date: Date) => void`                        |                   | Called when a cell is picked at `minView`             |
| `weekStartsOn`, `weekendDays`, `showOutsideDays`, `showWeekNumber` |                                               |                   |                                                       |
| `modifiers`, `modifiersClassNames`, `onDayClick`                   |                                               |                   | Passed to react-day-picker                            |
| `today`                                                            | `Date`                                        | now               | Pins "today"                                          |
| `initialFocus`                                                     | `boolean`                                     |                   | Focus the active day when mounted                     |
| `className`                                                        | `string`                                      |                   | Root classes                                          |
| `classNames`                                                       | `{ header, caption, nav, grid, cell }`        |                   | Classes for each part                                 |
| `ref`                                                              | `Ref<HTMLDivElement>`                         |                   |                                                       |

`DEFAULT_WEEKEND_DAYS` (`[5, 6]`, Friday and Saturday) is exported.

## Accessibility

See the [DatePicker keyboard table](./date-picker.md#accessibility). The caption is a button ("March 2026: choose a month"); page changes are announced through a polite live region; the current month/year/range has `aria-current="date"`.

## RTL and Dhivehi

Arrow keys follow visual order in RTL; chevrons mirror; month and weekday names come from the locale.

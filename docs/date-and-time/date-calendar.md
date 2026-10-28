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

## Events and read-only

`events` puts a dot under each day that has events (up to `maxDots`, coloured by `tone`), and each day's accessible name says how many ("Thursday, March 12th, 2026, 2 events"). With `readOnly` the calendar is not a picker: for portal sidebars and dashboards ("Upcoming events"), clicking a day highlights it and lists its events underneath. `size="sm"` makes it compact. For a full scheduling calendar use `@javaabu/onu/calendar`.

```tsx
<DateCalendar
  readOnly
  size="sm"
  events={[
    { id: 1, date: "2026-03-12T10:00", title: "Council meeting", tone: "primary" },
    { id: 2, date: "2026-03-20", title: "Job fair", tone: "success", href: "/events/job-fair" },
  ]}
  onDayClick={(date, modifiers, events) => console.log(date, events)}
/>
```

`DateCalendarEvent`: `{ id?, date, title, tone?, href? }`; `date` is a `Date`, ISO string or timestamp, and events with an invalid date are skipped. `tone` is `primary` (default), `success`, `warning`, `destructive`, `info` or `muted`. `events` also works on a picking calendar: the dots show, and `onDayClick` gets the day's events.

## Props

| Prop                                                               | Type                                                   | Default           | Description                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------ | ----------------- | ----------------------------------------------------- |
| `mode`                                                             | `"single" \| "multiple" \| "range" \| "none"`          | `"single"`        |                                                       |
| `selected` / `onSelect`                                            | `Date \| null`, `Date[]`, or `{ from, to }`            |                   | Per mode                                              |
| `maxSelected`                                                      | `number`                                               |                   | `multiple` only; other days are disabled at the limit |
| `min` / `max` / `disabledDates`                                    | `Date`, `Matcher \| Matcher[]`                         |                   | Disabled days, months and years                       |
| `month` / `defaultMonth` / `onMonthChange`                         | `Date`                                                 | selected or today | Displayed month                                       |
| `view` / `defaultView` / `onViewChange`                            | `"day" \| "month" \| "year" \| "decade"`               | `minView`         | Zoom level                                            |
| `minView`                                                          | `"day" \| "month" \| "year"`                           | `"day"`           | Lowest zoom level                                     |
| `onPeriodSelect`                                                   | `(date: Date) => void`                                 |                   | Called when a cell is picked at `minView`             |
| `weekStartsOn`, `weekendDays`, `showOutsideDays`, `showWeekNumber` |                                                        |                   |                                                       |
| `modifiers`, `modifiersClassNames`                                 |                                                        |                   | Passed to react-day-picker                            |
| `onDayClick`                                                       | `(date, modifiers, events) => void`                    |                   | A day was clicked; `events` are that day's events     |
| `events`                                                           | `DateCalendarEvent[]`                                  |                   | `{ id?, date, title, tone?, href? }`, dots per day    |
| `maxDots`                                                          | `number`                                               | `3`               | Most dots per day                                     |
| `readOnly`                                                         | `boolean`                                              | `false`           | No selection; clicking a day lists its events         |
| `showEventList`                                                    | `boolean`                                              | `true`            | With `readOnly`, list the clicked day's events        |
| `size`                                                             | `"default" \| "sm"`                                    | `"default"`       | `sm`: smaller day cells (touch size on touch screens) |
| `today`                                                            | `Date`                                                 | now               | Pins "today"                                          |
| `initialFocus`                                                     | `boolean`                                              |                   | Focus the active day when mounted                     |
| `className`                                                        | `string`                                               |                   | Root classes                                          |
| `classNames`                                                       | `{ header, caption, nav, grid, cell, dot, eventList }` |                   | Classes for each part                                 |
| `ref`                                                              | `Ref<HTMLDivElement>`                                  |                   |                                                       |

`DEFAULT_WEEKEND_DAYS` (`[5, 6]`, Friday and Saturday) is exported.

## Accessibility

See the [DatePicker keyboard table](./date-picker.md#accessibility). The caption is a button ("March 2026: choose a month"); page changes are announced through a polite live region; the current month/year/range has `aria-current="date"`.

- With `events`, each day's accessible name includes its event count, so the dots (hidden from screen readers) aren't the only signal.
- With `readOnly`, the clicked day's event list is a polite live region, so it is read out when it changes. <kbd>Enter</kbd> or <kbd>Space</kbd> on a day lists its events.

## RTL and Dhivehi

Arrow keys follow visual order in RTL; chevrons mirror; month and weekday names come from the locale.

---
title: HijriDatePicker
sidebar_position: 7
---

Picks a date on the Umm al-Qura Hijri calendar. The panel shows the Hijri month (each day with its Gregorian day number underneath) and zooms out to Hijri months and years. The value stays a Gregorian `Date`, and the hidden input posts `yyyy-MM-dd`, so it stores like any other date.

```tsx
import { HijriDatePicker, HijriCalendar } from "@javaabu/onu"

<FormField label="Date of the event" name="event_date">
  <HijriDatePicker />
</FormField>

<HijriCalendar selected={date} onSelect={setDate} />
```

The field shows "23 Ramadan 1447 (12/03/2026)" by default.

## Props

### HijriDatePicker

| Prop                                         | Type                                             | Default      | Description                              |
| -------------------------------------------- | ------------------------------------------------ | ------------ | ---------------------------------------- |
| `value` / `defaultValue`                     | `Date \| null`                                   |              | Gregorian date                           |
| `onChange`                                   | `(value: Date \| null) => void`                  |              |                                          |
| `format`                                     | `"long" \| "short" \| "month-year" \| "numeric"` | `"short"`    | Hijri display format                     |
| `showGregorian`                              | `boolean`                                        | `true`       | Also show the Gregorian date             |
| `gregorianFormat`                            | `string`                                         | `dd/MM/yyyy` |                                          |
| `min` / `max`, `weekStartsOn`, `weekendDays` |                                                  |              | As for [DatePicker](./date-picker#props) |

Plus the shared picker field props.

### HijriCalendar

`selected`, `onSelect`, `min`, `max`, `weekStartsOn`, `weekendDays`, `showGregorian` (default `true`), `today`, `initialFocus`, `className`, `ref`.

## Accessibility

The days view is an in-house APG grid (react-day-picker has no Hijri support). Day buttons are named with both calendars ("Today, 23 Ramadan 1447 AH, Thursday, March 12th, 2026"); today has `aria-current="date"`; days outside `min`/`max` are `aria-disabled`.

| Key                                       | Action                               |
| ----------------------------------------- | ------------------------------------ |
| <kbd>←</kbd> <kbd>→</kbd>                 | Previous / next day (swapped in RTL) |
| <kbd>↑</kbd> <kbd>↓</kbd>                 | Previous / next week                 |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Previous / next Hijri month          |
| <kbd>Home</kbd> / <kbd>End</kbd>          | Start / end of the week              |
| <kbd>Enter</kbd> / <kbd>Space</kbd>       | Select                               |
| <kbd>Escape</kbd>                         | Close; focus returns to the field    |

## RTL and Dhivehi

Hijri month names are translated (ރަމަޟާން 1447), weekdays use the Dhivehi date-fns locale, and the grid mirrors in RTL.

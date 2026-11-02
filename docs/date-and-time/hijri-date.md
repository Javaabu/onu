# HijriDate

Shows a date in the Umm al-Qura Hijri calendar, e.g. "23 Ramadan 1447 AH" (R12.5). Maths come from `@internationalized/date` (`IslamicUmalquraCalendar`); month names are translated, including Dhivehi (ރަމަޟާން).

```tsx
import { HijriDate } from "@javaabu/onu"

<HijriDate date={new Date()} />                       // 23 Ramadan 1447 AH
<HijriDate date={date} format="short" showGregorian /> // 23 Ramadan 1447 (12/03/2026)
<HijriDate date={date} format="numeric" />             // 23/09/1447
```

Helpers: `toHijri(date)` → `{ year, month, day }`, `fromHijri(parts)` → `Date`, `addHijriMonths`, `hijriDaysInMonth`, `hijriMonthName(t, month)`, `formatHijriParts(parts, t, format)` and the `useHijriFormatter()` hook (`(date, format?) => string` in the active locale). To pick a Hijri date, use [HijriDatePicker](./hijri-date-picker.md).

## Props

| Prop              | Type                                             | Default      | Description                |
| ----------------- | ------------------------------------------------ | ------------ | -------------------------- |
| `date`            | `Date`                                           |              | The Gregorian date to show |
| `format`          | `"long" \| "short" \| "month-year" \| "numeric"` | `"long"`     |                            |
| `showGregorian`   | `boolean`                                        | `false`      | Append the Gregorian date  |
| `gregorianFormat` | `string`                                         | `dd/MM/yyyy` | date-fns format            |
| `classNames`      | `{ hijri, gregorian }`                           |              | Classes for each part      |

Other `<time>` props pass through.

## Accessibility

Renders a `<time>` element whose `datetime` is the ISO Gregorian date, so machines and assistive tech get an unambiguous value.

## RTL and Dhivehi

In `dv`: "23 ރަމަޟާން 1447 ހ". Digits stay Western (R12.6).

# ReportingPeriodPicker

Picks a **monthly**, **quarterly**, **yearly** or **custom** reporting period, with a configurable financial-year start. Built in-house from the calendar, period grids and shadcn's `ToggleGroup`.

```tsx
import { ReportingPeriodPicker, type ReportingPeriod } from "@javaabu/onu"

const [period, setPeriod] = React.useState<ReportingPeriod | null>(null)
<FormField label="Period" name="period">
  <ReportingPeriodPicker value={period} onChange={setPeriod} fiscalYearStartMonth={6} />
</FormField>
```

The value is `{ type, from, to }` where `from` is the first day and `to` the end of the last day. Hidden inputs post `name[type]`, `name[from]` and `name[to]` (`yyyy-MM-dd`).

- **Monthly**: a 12-month grid (zooms out to years).
- **Quarterly**: Q1–Q4 of the financial year, each showing its months (e.g. "Q1 Jul – Sep" when the year starts in July).
- **Yearly**: 12 financial years ("2025/26"); plain years when the year starts in January.
- **Custom**: a range calendar; closing with only a start picked keeps a one-day range.

`fiscalYear(startMonth)` is exported for the same maths elsewhere (`yearOf`, `label`, `quarter`, `quarterOf`, `range`).

## Props

| Prop                     | Type                                       | Default       | Description                       |
| ------------------------ | ------------------------------------------ | ------------- | --------------------------------- |
| `value` / `defaultValue` | `ReportingPeriod \| null`                  |               |                                   |
| `onChange`               | `(value: ReportingPeriod \| null) => void` |               |                                   |
| `types`                  | `ReportingPeriodType[]`                    | all four      | Kinds offered, in order           |
| `defaultType`            | `ReportingPeriodType`                      | first type    | Kind shown first when empty       |
| `fiscalYearStartMonth`   | `0–11`                                     | `0` (January) | First month of the financial year |
| `format`                 | `string`                                   | `dd/MM/yyyy`  | Format of custom ranges           |
| `min` / `max`            | `Date`                                     |               | Periods outside are greyed out    |

Plus the shared picker field props; see [DatePicker](./date-picker.md#props).

## Accessibility

The kind switch is a labelled radio group (Radix `ToggleGroup`, arrow keys). Quarters and years are APG grids: arrows move, <kbd>Page Up</kbd>/<kbd>Page Down</kbd> change the year (12 years in the yearly view), <kbd>Enter</kbd> picks; the current period has `aria-current="date"`. The custom range uses the [DatePicker keyboard model](./date-picker.md#accessibility).

## RTL and Dhivehi

All labels are translated ("2025/26 ގެ 3 ވަނަ ކުއާޓަރ"); grids and arrows mirror in RTL.

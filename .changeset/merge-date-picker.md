---
"@javaabu/onu": minor
---

`DatePicker` takes a `mode`: `"single"` (default), `"multiple"`, `"week"`, `"month"` or `"year"`, with `value` and `onChange` typed for each. `MultipleDatePicker`, `WeekPicker`, `MonthPicker` and `YearPicker` are removed: use `<DatePicker mode="multiple">`, `mode="week"`, `mode="month"` or `mode="year"`. Week mode now accepts `disabledDates`. `DatePickerProps` is now a union of `DatePickerSingleProps`, `DatePickerMultipleProps`, `DatePickerWeekProps` and `DatePickerPeriodProps` (month and year).

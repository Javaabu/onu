---
title: Dhivehi & locales
sidebar_position: 6
---

Onu ships with English (`en`) and Dhivehi (`dv`). Every built-in string — button labels, placeholders, screen-reader text, pagination, date pickers — comes from the active locale.

```tsx
<OnuProvider locale="dv">…</OnuProvider>
```

# Overriding strings

```tsx
<OnuProvider
    locale="dv"
    messages={{ common: { save: 'ރައްކާކުރޭ' }, listing: { selected: '{count} ޚިޔާރުކުރެވިފައި' } }}
>
```

Use `useTranslation()` for your own components:

```tsx
const { t } = useTranslation();
t('common.save');
t('listing.showing', { from: 26, to: 50, total: 312 });
```

Messages support `{param}` interpolation and plural forms (`{ one: '…', other: '…' }` chosen from the `count` param).

# Adding a locale

A locale is an object:

```ts
import { en, type OnuLocale } from '@javaabu/onu';
import { ar } from 'date-fns/locale/ar';

const arabic: OnuLocale = {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    messages: { ...en.messages /* translated */ },
    dateFns: ar,
    weekStartsOn: 6,
    numberLocale: 'ar',
    hourCycle: 12,
};
```

# Dates and numbers

- Dhivehi month and weekday names, AM/PM (މކ / މފ) and relative times ("2 ދުވަސް ކުރިން") come from Onu's Dhivehi date-fns locale (`dvDateFns`), since date-fns and browsers have no Dhivehi data.
- Numbers use Western digits, as is standard in the Maldives.
- Hijri dates use the Umm al-Qura calendar (see the Hijri date component).
- Sorting and search use `Intl.Collator`, so Thaana sorts correctly.

## Formatting dates, numbers and amounts yourself

Three hooks format values the way Onu's components do, with the active locale. Use them for your own text (table cells, cards, summaries) so it matches the components and switches with the locale.

```tsx
import { useFormatCurrency, useFormatDate, useFormatNumber } from "@javaabu/onu"

function ApplicationSummary({ application }) {
  const formatDate = useFormatDate()
  const formatNumber = useFormatNumber()
  const formatCurrency = useFormatCurrency()
  return (
    <p>
      {formatDate(application.submitted_at)} {/* "Mar 12, 2026" · "12 މާރޗް 2026" */}
      {formatDate(application.submitted_at, "EEEE d MMMM")} {/* any date-fns pattern */}
      {formatNumber(application.pages)} {/* "1,234" (Western digits in Dhivehi too) */}
      {formatCurrency(application.fee)} {/* "MVR 1,250.00" · "ރ. 1,250.00" */}
    </p>
  )
}
```

| Hook                  | Returns                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `useFormatDate()`     | `(date, pattern = "PP") => string`. `date` is a `Date`, timestamp or ISO string; invalid or empty gives `""`. Uses the locale's date-fns locale (`dvDateFns` for Dhivehi) and week start. |
| `useFormatNumber()`   | `(value, options?) => string` with `Intl.NumberFormat` options and the locale's `numberLocale`.            |
| `useFormatCurrency()` | `(value, { decimals = 2, compact = false }?) => string` in Maldivian Rufiyaa, worded by the `common.currency` string (`"MVR {amount}"`, `"ރ. {amount}"`). The amount is wrapped in Unicode isolates so it keeps its order next to Thaana. |

Charts have their own `useChartFormat` in `@javaabu/onu/charts`, with axis and percentage helpers.

# Fonts

Dhivehi text uses MV Waheed by default. See [Fonts](./fonts).

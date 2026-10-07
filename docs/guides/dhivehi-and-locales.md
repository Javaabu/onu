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

# Fonts

Dhivehi text uses MV Waheed by default. See [Fonts](./fonts).

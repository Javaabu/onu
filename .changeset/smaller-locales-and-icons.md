---
"@javaabu/onu": minor
---

Smaller bundles: components bring only the English text they use, `OnuProvider` no longer bundles Dhivehi or the Lucide icon map, and every entry point has a size budget.

Measured with all dependencies except React, minified and brotli-compressed (gzip in brackets):

| Import                                                | Before           | After          |
| ----------------------------------------------------- | ---------------- | -------------- |
| `Button`                                              | 12.0 kB (13.5)   | 12.1 kB (13.6) |
| `FormField` + `TextInput`                             | 28.4 kB (32.7)   | 16.0 kB (18.2) |
| `Modal`                                               | 36.6 kB (41.7)   | 24.3 kB (27.5) |
| `Select`                                              | 50.8 kB (57.7)   | 38.5 kB (43.3) |
| `DataTable`                                           | 81.7 kB (93.9)   | 73.0 kB (83.6) |
| `OnuProvider`                                         | 36.6 kB (45.5)   | 1.3 kB (1.4)   |
| `OnuProvider` + 8 form components (with `DatePicker`) | 111.3 kB (132.9) | 81.4 kB (95.0) |

- **English text per component.** Each component registers the English namespaces it uses (`common`, `form`, `listing`, …), so a text field no longer carries the strings of the data table, map and editor. `t("namespace.key")`, `OnuProvider messages` overrides and custom locales work as before; missing strings still fall back to English.
- **Dhivehi on demand.** Import it from the new `@javaabu/onu/locales/dv` entry and pass the object, `<OnuProvider locale={dv}>`, to bundle it with your app. `locale="dv"` still works: it now loads Dhivehi as a separate chunk the first time it is needed (direction and `lang` switch at once; strings show in English until the chunk arrives). `import { dv } from "@javaabu/onu"` keeps working.
- **Default icon set on demand.** `OnuProvider` loads the Lucide map (~250 icons) as a separate chunk the first time an icon is chosen by name at runtime (e.g. `<Button startIcon="add">`), rendering a same-sized empty placeholder until then. Apps that only use fixed glyphs never download it. Pass `icons={lucideIconMap}` to bundle it up front.
- **No date-fns in components without dates.** `OnuProvider`'s default English locale no longer includes date-fns's `en-US` locale (date-fns formats in English by default), so text fields and dialogs stay free of date-fns.
- **Size budgets.** `size-limit` now checks every `package.json` export (core scenarios, primitives, thaana, locales/dv, charts, maps, editor, calendar, media, query-builder, export, the icon adapters and the CSS files), and CI runs it.

Type changes for apps: `OnuLocale.messages` may be partial and `OnuLocale.dateFns` is optional (`undefined` means English). Code that reads `useOnu().locale.dateFns` should handle `undefined`, which date-fns treats as `en-US`. The exported `en` locale still has every string and `dateFns: enUS`; `OnuProvider`'s default English no longer does, so if your own code calls `t()` with a key from a namespace none of your components use, pass `locale={en}` or add the string with `messages`.

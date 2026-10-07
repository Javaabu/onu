---
title: Searchable select
sidebar_position: 2
---

A select with a search field: a field that opens a searchable list (shadcn Popover + Command; a bottom sheet on phones). Matching uses `Intl.Collator`, so "male" finds "Malé", and Thaana vowel signs are respected. The search field accepts [`thaana`](../guides/thaana-input).

```tsx
import { SearchableSelect } from '@javaabu/onu';

<SearchableSelect options={islands} placeholder="Select an island" clearable />
<SearchableSelect options={dhivehiIslands} thaana />
<SearchableSelect options={islands} multiple defaultValue={['male']} />
```

## Options

```ts
interface ChoiceOption {
  value: string
  label: string // shown and searched
  description?: ReactNode // second line
  icon?: ReactNode
  disabled?: boolean
  group?: string // heading
  keywords?: string[] // extra search terms
}
```

## Props

| Prop                                    | Type                                                                                      | Default            | Description                                               |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------- |
| `options`                               | `(ChoiceOption \| string)[]`                                                              |                    | Options                                                   |
| `multiple`                              | `boolean`                                                                                 | `false`            | Several values (see [Multi-select](./multi-select))       |
| `value` / `defaultValue`                | `string \| null` (`string[]` when multiple)                                               |                    | Selected value(s)                                         |
| `onValueChange`                         | `(value, option) => void`                                                                 |                    | Called with the value(s) and option(s)                    |
| `placeholder` / `searchPlaceholder`     | `string`                                                                                  | from locale        |                                                           |
| `thaana`                                | `boolean \| ThaanaOptions`                                                                |                    | Thaana keyboard in the search field                       |
| `clearable`                             | `boolean`                                                                                 | `false`            | Clear button; hidden on required fields                   |
| `filter`                                | `(option, query) => boolean`                                                              |                    | Replace the collator matching                             |
| `emptyText`                             | `string`                                                                                  | "No results for …" |                                                           |
| `renderOption` / `renderValue`          | functions                                                                                 |                    | Custom rendering                                          |
| `size`                                  | `"sm" \| "default" \| "lg"`                                                               | `"default"`        |                                                           |
| `sheet`                                 | `boolean`                                                                                 | `true`             | Bottom sheet on phones                                    |
| `name`, `required`, `disabled`          |                                                                                           |                    | `name` renders hidden input(s); multiple submits `name[]` |
| `open` / `defaultOpen` / `onOpenChange` |                                                                                           |                    | Controlled open state                                     |
| `classNames`                            | `{ root, trigger, value, placeholder, chip, clear, content, search, list, item, status }` |                    |                                                           |

Other button props and `ref` go to the trigger. `choiceFieldVariants` (the field box) is exported. The `matchesQuery` and `filterOptions` helpers are exported too.

## Accessibility

The trigger is a `combobox` button; the popup holds a search `combobox` and a `listbox` (cmdk). The number of results, "No results" and loading/error states are announced in a polite live region.

| Key                 | Action                                                     |
| ------------------- | ---------------------------------------------------------- |
| ↓ / ↑ on the field  | Open                                                       |
| Typing on the field | Open and start searching with that character               |
| ↓ / ↑, Home / End   | Move through options (wraps)                               |
| Enter               | Choose; single selects close and return focus to the field |
| Escape              | Close and return focus to the field                        |
| Backspace / Delete  | On a clearable field: clear the value                      |

## RTL and touch

Everything mirrors in RTL. On phones the list opens as a bottom sheet with 44px rows (R3.28).

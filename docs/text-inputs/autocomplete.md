---
title: Autocomplete
sidebar_position: 17
---

A free-text input with suggestions. The typed text is the value; suggestions only help fill it in (for a fixed list of choices, use a select). Follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with list autocomplete, and supports Thaana typing.

```tsx
import { Autocomplete } from "@javaabu/onu"

<Autocomplete suggestions={["Malé", "Hulhumalé", "Addu City"]} />

<Autocomplete thaana suggestions={["މާލެ", "ހުޅުމާލެ", "ވިލިމާލެ"]} />
```

## Async suggestions

Pass a function to search a server. It is called with the query and an `AbortSignal`; requests are debounced (300 ms by default) and older requests are cancelled, so a slow response never overwrites a newer one. Loading and error states (with **Retry**) are shown and announced.

```tsx
<Autocomplete
  suggestions={async (query, { signal }) => {
    const res = await fetch(`/api/jobs?search=${encodeURIComponent(query)}`, { signal })
    const { data } = await res.json()
    return data.map((job) => ({ value: job.title, description: job.department }))
  }}
  minChars={2}
/>
```

Options are strings or `{ value, label?, description?, disabled? }`.

## Props

| Prop             | Type                                                                       | Default                  | Description                            |
| ---------------- | -------------------------------------------------------------------------- | ------------------------ | -------------------------------------- |
| `suggestions`    | `SuggestionOption[] \| (query, { signal }) => Promise<SuggestionOption[]>` |                          | Static list or async search (required) |
| `value`          | `string`                                                                   |                          | Controlled text                        |
| `defaultValue`   | `string`                                                                   | `""`                     | Initial text                           |
| `onValueChange`  | `(value: string) => void`                                                  |                          | Called on every change                 |
| `onSelect`       | `(option) => void`                                                         |                          | Called when a suggestion is picked     |
| `debounce`       | `number`                                                                   | `300`                    | Async debounce in ms                   |
| `minChars`       | `number`                                                                   | `0` (list) / `1` (async) | Characters before suggestions show     |
| `maxSuggestions` | `number`                                                                   | `50`                     | Most suggestions shown                 |
| `openOnFocus`    | `boolean`                                                                  | `false`                  | Show suggestions on focus              |
| `renderOption`   | `(option, { active }) => ReactNode`                                        |                          | Custom option content                  |
| `thaana`         | `boolean \| ThaanaOptions`                                                 | `false`                  | Type Thaana from a Latin keyboard      |
| `thaanaToggle`   | `boolean`                                                                  | `false`                  | Show the Thaana/Latin toggle           |
| `classNames`     | `{ root, input, startAddon, endAddon, list, option }`                      |                          | Classes for each part                  |

Other [`TextInput`](./text-input) props (addons, `name`, `disabled`, …) are passed through.

## RTL and Thaana

With `thaana`, the input and the suggestion list are `dir="rtl"` and `lang="dv"`. Matching is case-insensitive and works for Thaana and Latin.

## Accessibility

- The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`; the highlighted option is set with `aria-activedescendant`, so focus stays in the input.
- The number of suggestions ("3 suggestions available"), loading and errors are announced in a polite live region.

| Key                         | Action                                           |
| --------------------------- | ------------------------------------------------ |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Open the list / move through suggestions (wraps) |
| <kbd>Enter</kbd>            | Use the highlighted suggestion                   |
| <kbd>Esc</kbd>              | Close the list; press again to clear the text    |
| <kbd>Tab</kbd>              | Close the list and move on, keeping the text     |

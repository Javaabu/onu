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

Options are strings or `{ value, label?, description?, disabled?, keywords? }`, so `ChoiceOption`s fit too. Picking an option sets the text to its `value`.

## Editable select

`showToggleButton` adds a chevron button that opens the full list (not just the matches for the current text). `showCustomOption` puts "Use “…”" first when the typed text matches no suggestion exactly, and `autoHighlight` highlights the first row as the list opens or filters, so Enter picks it (or keeps the typed text). `emptyMessage` is shown when nothing matches, instead of closing the list.

Together they make a field where people pick from a list or type their own value. Picking an option writes its `value`; to write the label of `ChoiceOption`s instead, map it into `value`.

```tsx
<Autocomplete suggestions={["Director", "Deputy Director"]} showToggleButton showCustomOption autoHighlight placeholder="Job title" />
<Autocomplete suggestions={dhivehiTitles} showToggleButton showCustomOption autoHighlight thaana thaanaToggle />

// ChoiceOptions: write the label
<Autocomplete suggestions={titles.map((o) => ({ ...o, value: o.label }))} showToggleButton showCustomOption autoHighlight />
```

The toggle button is named "Show options", is skipped by Tab (`tabIndex={-1}`) and does not take focus, so focus stays in the input.

## Props

| Prop               | Type                                                                       | Default                  | Description                                               |
| ------------------ | -------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| `suggestions`      | `SuggestionOption[] \| (query, { signal }) => Promise<SuggestionOption[]>` |                          | Static list or async search (required)                    |
| `value`            | `string`                                                                   |                          | Controlled text                                           |
| `defaultValue`     | `string`                                                                   | `""`                     | Initial text                                              |
| `onValueChange`    | `(value: string, option \| null) => void`                                  |                          | Called on every change; `option` is the picked suggestion |
| `onSelect`         | `(option) => void`                                                         |                          | Called when a suggestion is picked                        |
| `debounce`         | `number`                                                                   | `300`                    | Async debounce in ms                                      |
| `minChars`         | `number`                                                                   | `0` (list) / `1` (async) | Characters before suggestions show                        |
| `maxSuggestions`   | `number`                                                                   | `50`                     | Most suggestions shown                                    |
| `openOnFocus`      | `boolean`                                                                  | `false`                  | Show suggestions on focus                                 |
| `showToggleButton` | `boolean`                                                                  | `false`                  | Chevron button that opens the full list                   |
| `showCustomOption` | `boolean`                                                                  | `false`                  | Offer "Use “…”" for unmatched text                        |
| `autoHighlight`    | `boolean`                                                                  | `false`                  | Highlight the first row so Enter picks it                 |
| `emptyMessage`     | `ReactNode \| (query) => ReactNode`                                        |                          | Shown when nothing matches                                |
| `open`             | `boolean`                                                                  |                          | Controlled list state                                     |
| `defaultOpen`      | `boolean`                                                                  | `false`                  | Initial list state                                        |
| `onOpenChange`     | `(open: boolean) => void`                                                  |                          | Called when the list opens or closes                      |
| `renderOption`     | `(option, { active, selected }) => ReactNode`                              |                          | Custom option content                                     |
| `thaana`           | `boolean \| ThaanaOptions`                                                 | `false`                  | Type Thaana from a Latin keyboard                         |
| `thaanaToggle`     | `boolean`                                                                  | `false`                  | Show the Thaana/Latin toggle                              |
| `classNames`       | `{ root, input, startAddon, endAddon, list, option }`                      |                          | Classes for each part                                     |

Other [`TextInput`](./text-input) props (addons, `name`, `disabled`, …) are passed through.

## RTL and Thaana

With `thaana`, the input and the suggestion list are `dir="rtl"` and `lang="dv"`. Static lists are matched on the value, a text label and `keywords` with `Intl.Collator` in the active locale: case- and accent-insensitive for Latin ("male" finds "Malé"), while Thaana vowel signs (fili) still count. The toggle button sits at the inline end, so it flips in RTL.

## Accessibility

- The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`; the highlighted option is set with `aria-activedescendant`, so focus stays in the input.
- The number of suggestions ("3 suggestions available"), loading and errors are announced in a polite live region.
- The "Use “…”" row is an option like the others (`data-custom`); the toggle button is named "Show options" and exposes `aria-expanded`.

| Key                         | Action                                           |
| --------------------------- | ------------------------------------------------ |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Open the list / move through suggestions (wraps) |
| <kbd>Enter</kbd>            | Use the highlighted suggestion                   |
| <kbd>Esc</kbd>              | Close the list; press again to clear the text    |
| <kbd>Tab</kbd>              | Close the list and move on, keeping the text     |

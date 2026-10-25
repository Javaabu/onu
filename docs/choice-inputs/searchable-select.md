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
<SearchableSelect options={categories} onCreate={createCategory} />
<SearchableSelect options={islandsByAtoll} parentValue={atoll} parentLabel="an atoll" />
```

The same component covers several values (`multiple`), creating missing options (`onCreate`) and dependent fields (`parentValue`); see the sections below. `MultiSelect`, `QuickCreateSelect` and `DependentSelect` are presets of it.

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
| `options`                               | `(ChoiceOption \| string)[]`, or per parent (see below)                                   |                    | Options                                                   |
| `multiple`                              | `boolean`                                                                                 | `false`            | Several values (see [below](#several-values))             |
| `value` / `defaultValue`                | `string \| null` (`string[]` when multiple)                                               |                    | Selected value(s)                                         |
| `onValueChange`                         | `(value, option) => void`                                                                 |                    | Called with the value(s) and option(s)                    |
| `placeholder` / `searchPlaceholder`     | `string`                                                                                  | from locale        |                                                           |
| `thaana`                                | `boolean \| ThaanaOptions`                                                                |                    | Thaana keyboard in the search field                       |
| `clearable`                             | `boolean`                                                                                 | `multiple`         | Clear button; hidden on required fields                   |
| `filter`                                | `(option, query) => boolean`                                                              |                    | Replace the collator matching                             |
| `emptyText`                             | `string`                                                                                  | "No results for …" |                                                           |
| `renderOption` / `renderValue`          | functions                                                                                 |                    | Custom rendering                                          |
| `size`                                  | `"sm" \| "default" \| "lg"`                                                               | `"default"`        |                                                           |
| `sheet`                                 | `boolean`                                                                                 | `true`             | Bottom sheet on phones                                    |
| `name`, `required`, `disabled`          |                                                                                           |                    | `name` renders hidden input(s); multiple submits `name[]` |
| `open` / `defaultOpen` / `onOpenChange` |                                                                                           |                    | Controlled open state                                     |
| `classNames`                            | `{ root, trigger, value, placeholder, chip, clear, content, search, list, item, status }` |                    |                                                           |

[Several values](#several-values), [creating options](#creating-options) and [dependent fields](#dependent-fields) add more props below. Other button props and `ref` go to the trigger. `choiceFieldVariants` (the field box) is exported. The `matchesQuery` and `filterOptions` helpers are exported too.

## Several values

With `multiple`, selected values show as chips in the field (each with a remove button), the list has a "Select all" row for the visible options, and `max` caps the number of values. `MultiSelect` is the same component with `multiple` fixed on.

```tsx
import { MultiSelect, SearchableSelect } from '@javaabu/onu';

<SearchableSelect multiple name="islands" options={islands} defaultValue={['male']} />
<MultiSelect options={ministries} max={3} maxVisibleChips={2} />
```

| Prop                     | Type                        | Default | Description                                                |
| ------------------------ | --------------------------- | ------- | ---------------------------------------------------------- |
| `value` / `defaultValue` | `string[]`                  |         |                                                            |
| `onValueChange`          | `(values, options) => void` |         |                                                            |
| `selectAll`              | `boolean`                   | `true`  | "Select all" / "Deselect all" row                          |
| `max`                    | `number`                    |         | Maximum values; other options disable, a note explains why |
| `maxVisibleChips`        | `number`                    |         | Collapse the rest into "+N more"                           |
| `clearable`              | `boolean`                   | `true`  | Clear all button                                           |

With `name="islands"` it submits `islands[]` (Laravel arrays). Options carry `aria-checked` and the field announces "N selected". Each chip's remove button is labelled "Remove …". **Backspace** on an empty search removes the last value. The list stays open while picking.

## Creating options

When nothing matches the search exactly, a "Create “…”" row appears. Create inline with `onCreate`, or open your own dialog with `renderCreateDialog`. The new option is added, selected and announced. Works with `multiple`; [API select](./api-select) accepts the same props (and refreshes its cache afterwards). `QuickCreateSelect` is an alias of `SearchableSelect`, kept for discoverability.

```tsx
// Inline
<SearchableSelect
  options={categories}
  onCreate={async (label) => {
    const { data } = await api.post('/categories', { name: label });
    return { value: String(data.id), label: data.name };
  }}
/>

// Through a dialog
<SearchableSelect
  options={vendors}
  renderCreateDialog={({ query, open, onOpenChange, onCreated }) => (
    <NewVendorDialog name={query} open={open} onOpenChange={onOpenChange} onSaved={(v) => onCreated({ value: v.id, label: v.name })} />
  )}
/>
```

| Prop                 | Type                                                       | Description                                      |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `onCreate`           | `(label) => ChoiceOption \| Promise<ChoiceOption \| null>` | Create inline; return the new option             |
| `renderCreateDialog` | `({ query, open, onOpenChange, onCreated }) => ReactNode`  | Render your own dialog; call `onCreated(option)` |
| `onCreated`          | `(option) => void`                                         | After any create                                 |

While `onCreate` runs the row shows "Creating…"; if it throws, the row shows "Couldn’t create “…”" and can be tried again. The create row is a normal option (Enter selects it), and "“…” created and selected" is announced. With a dialog, the popover closes first, so focus returns to the field when the dialog closes.

## Dependent fields

A field whose options depend on another (atoll → island): pass `parentValue`. The field is disabled until the parent has a value (the placeholder says which field to fill first) and **clears itself whenever the parent changes**: `onValueChange(null)` (or `[]` for multiple) is called. `options` can then be a map keyed by the parent value or a function of it. For options from an API, [API select](./api-select) takes the same props and sends the parent value with each request.

`DependentSelect` picks between the two: `SearchableSelect` for local options, `ApiSelect` when you pass a `url` or `loadOptions`.

```tsx
import { DependentSelect, SearchableSelect, Select } from '@javaabu/onu';

<Select options={atolls} value={atoll} onValueChange={setAtoll} />

// Static map
<SearchableSelect parentValue={atoll} parentLabel="an atoll" options={{ K: kaafuIslands, S: seenuIslands }} />

// Loaded and cached per parent
<DependentSelect parentValue={atoll} loadOptions={(atoll, { query, signal }) => api.islands(atoll, query, signal)} />

// From an API: GET /api/islands?atoll_id=K&search=…
<DependentSelect parentValue={atoll} url="/api/islands" parentParam="atoll_id" />
```

| Prop                              | Type                                                           | Default       | Description                                         |
| --------------------------------- | -------------------------------------------------------------- | ------------- | --------------------------------------------------- |
| `parentValue`                     | `string \| number \| null`                                     |               | The value this field depends on                     |
| `parentLabel`                     | `string`                                                       |               | Shown as "Select {parentLabel} first" while waiting |
| `options`                         | `Record<string, ChoiceOption[]> \| (parent) => ChoiceOption[]` |               | Local options per parent                            |
| `loadOptions` (`DependentSelect`) | `(parent, { query, page, signal }) => Promise<response>`       |               | Async options (cached per parent and search)        |
| `url` (`DependentSelect`)         | `string`                                                       |               | API endpoint                                        |
| `parentParam` (`DependentSelect`) | `string`                                                       | `"parent_id"` | Request param carrying the parent value             |

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

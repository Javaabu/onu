---
title: SearchBox
sidebar_position: 6
---

The search box of an index page. Typing does nothing until the user presses <kbd>Enter</kbd> or leaves the box after changing the text (REQUIREMENTS §25.6), so a request isn't sent for every keystroke. Clearing the box and pressing Enter shows everything again.

```tsx
import { SearchBox } from "@javaabu/onu"

;<SearchBox value={state.search} onSearch={state.setSearch} placeholder="Search users…" />
<SearchBox thaana onSearch={setQuery} />
```

## Props

| Prop            | Type                           | Default | Description                                |
| --------------- | ------------------------------ | ------- | ------------------------------------------ |
| `value`         | `string`                       |         | The applied search; the box resets to it   |
| `defaultValue`  | `string`                       | `""`    | Uncontrolled start value                   |
| `onSearch`      | `(value) => void`              |         | Enter, blur after a change, or ✕           |
| `onValueChange` | `(value) => void`              |         | Every keystroke (draft)                    |
| `submitOnBlur`  | `boolean`                      | `true`  | Submit when leaving the box after a change |
| `clearable`     | `boolean`                      | `true`  | ✕ button that clears and submits           |
| `thaana`        | `boolean \| ThaanaOptions`     |         | Type Thaana from a Latin keyboard          |
| `landmark`      | `boolean`                      | `true`  | Wrap in `<form role="search">`             |
| `classNames`    | `{ root, input, icon, clear }` |         | Classes for each part                      |

Other `<input>` props are passed through; inside a [`FormField`](../form-scaffolding/form-field) it is wired automatically. `ref` points at the input.

## Accessibility

A `searchbox` named "Search" (or your label) inside a `search` landmark.

| Key               | Action                      |
| ----------------- | --------------------------- |
| <kbd>Enter</kbd>  | Search                      |
| <kbd>Escape</kbd> | Put back the applied search |

## RTL and Thaana

The icon and ✕ swap sides in RTL. With `thaana` the box types Thaana and sets `dir="rtl"` and `lang="dv"`.

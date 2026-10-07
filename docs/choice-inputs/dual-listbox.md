---
title: Dual listbox
sidebar_position: 7
---

Two lists, "Available" and "Selected", with buttons to move items between them. Useful for permissions and assignments. Each list has its own filter field (with `thaana` support) and stacks vertically in narrow containers (container query).

```tsx
import { DualListbox } from "@javaabu/onu"

;<DualListbox
  options={permissions}
  value={granted}
  onValueChange={setGranted}
  selectedLabel="Granted"
  name="permissions"
/>
```

## Props

| Prop                               | Type                                             | Default                  | Description                 |
| ---------------------------------- | ------------------------------------------------ | ------------------------ | --------------------------- |
| `options`                          | `(ChoiceOption \| string)[]`                     |                          | All items                   |
| `value` / `defaultValue`           | `string[]`                                       | `[]`                     | Items in the Selected list  |
| `onValueChange`                    | `(values, options) => void`                      |                          |                             |
| `availableLabel` / `selectedLabel` | `string`                                         | "Available" / "Selected" | List headings               |
| `searchable`                       | `boolean`                                        | `true`                   | Filter fields               |
| `thaana`                           | `ThaanaProp`                                     |                          | Thaana in the filter fields |
| `name`                             | `string`                                         |                          | Submits `name[]`            |
| `disabled`                         | `boolean`                                        |                          |                             |
| `classNames`                       | `{ pane, heading, search, list, item, actions }` |                          |                             |

Items keep the order of `options` in both lists. Disabled options cannot move.

## Accessibility

Each list is a multi-select `listbox` (`aria-multiselectable`) with `aria-activedescendant`. Moves are announced ("2 items moved to Selected").

| Key                        | Action                                 |
| -------------------------- | -------------------------------------- |
| ↓ / ↑, Home / End          | Move the highlight                     |
| Space                      | Mark / unmark the highlighted item     |
| Shift + ↓ / ↑, Shift+click | Extend the marked range                |
| Ctrl/⌘ + A                 | Mark everything in the list            |
| Enter, double click        | Move the marked (or highlighted) items |

The move buttons are labelled ("Move selected to Selected", "Move all to Available"); their arrows mirror in RTL and point down/up when stacked.

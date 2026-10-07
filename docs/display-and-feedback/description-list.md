---
title: DescriptionList
sidebar_position: 1
---

Label–value pairs for record views ("Email: jane@example.com"). Missing values show "—" (REQUIREMENTS §25.8). Built in-house on a semantic `<dl>`: shadcn has no description list.

```tsx
import { DescriptionList, DescriptionListItem } from "@javaabu/onu"
;<DescriptionList
  items={[
    { label: "Full name", value: "Aishath Shiuna" },
    { label: "ID card", value: "A123456", copyable: true },
    { label: "Phone", value: null }, // shows "—"
  ]}
/>
```

Compose items yourself when values are rich:

```tsx
<DescriptionList layout="inline" striped>
  <DescriptionListItem label="Status">
    <StatusBadge status="success">Active</StatusBadge>
  </DescriptionListItem>
  <DescriptionListItem label="Account" copyable copyValue="7730000123456">
    7730 0001 23456
  </DescriptionListItem>
  <DescriptionListItem label="Remarks" fullWidth>
    Long text spans both columns.
  </DescriptionListItem>
</DescriptionList>
```

## Layout

- `auto` (default): stacked (label above value) in narrow containers, and side by side once the **container** is at least 28rem wide (container query), so it works in sidebars and cards.
- `inline`: always side by side. `stacked`: always stacked.
- The label column width comes from `--onu-dl-label-width` (default `12rem`).

## Props

### DescriptionList

| Prop        | Type                              | Default  | Description                       |
| ----------- | --------------------------------- | -------- | --------------------------------- |
| `items`     | `DescriptionListItemData[]`       |          | Items to render (or use children) |
| `layout`    | `'auto' \| 'stacked' \| 'inline'` | `'auto'` | Label placement                   |
| `striped`   | `boolean`                         | `false`  | Alternate row backgrounds         |
| `divided`   | `boolean`                         | `true`   | Lines between items               |
| `className` | `string`                          |          | Classes for the `<dl>`            |

`DescriptionListItemData`: `{ id?, label, value?, copyable?, copyValue?, fullWidth? }`.

### DescriptionListItem

| Prop         | Type                     | Description                                                         |
| ------------ | ------------------------ | ------------------------------------------------------------------- |
| `label`      | `ReactNode`              | The term                                                            |
| `children`   | `ReactNode`              | The value; `null`, `undefined`, `""` or `[]` show "—"               |
| `copyable`   | `boolean`                | Show a copy button (copies `copyValue`, or the value if it is text) |
| `copyValue`  | `string`                 | Text to copy                                                        |
| `fullWidth`  | `boolean`                | Span both columns                                                   |
| `classNames` | `{ label, value, copy }` | Classes for each part                                               |

`isEmptyValue(value)` is exported for your own "—" checks.

## Accessibility

- Uses `<dl>`, `<dt>` and `<dd>`, so screen readers announce term/definition pairs.
- "—" is hidden from screen readers and replaced by "Not set" (translated).
- The copy button is labelled "Copy {label}" and "Copied" is announced in a polite live region.

| Key                                 | Action                |
| ----------------------------------- | --------------------- |
| <kbd>Tab</kbd>                      | Move to a copy button |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Copy the value        |

## RTL and Dhivehi

Labels sit on the right in RTL. Values follow the text direction of their content.

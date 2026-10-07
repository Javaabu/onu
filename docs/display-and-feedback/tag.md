---
title: Tag
sidebar_position: 3
---

A compact label (chip) for categories, keywords and filters. It can be static, clickable, a link, removable, or all of these.

```tsx
import { Tag } from "@javaabu/onu"

<Tag>Malé</Tag>
<Tag icon="map-pin" variant="outline">Addu</Tag>
<Tag onRemove={() => remove("laamu")}>Laamu</Tag>
<Tag onClick={toggle} selected={active}>Fuvahmulah</Tag>
<Tag href="/tags/news">News</Tag>
```

## Props

| Prop          | Type                                  | Default     | Description                                       |
| ------------- | ------------------------------------- | ----------- | ------------------------------------------------- |
| `variant`     | `'default' \| 'primary' \| 'outline'` | `'default'` | Look                                              |
| `size`        | `'sm' \| 'md' \| 'lg'`                | `'md'`      | Size                                              |
| `icon`        | `string \| ReactNode`                 |             | Icon before the label                             |
| `onClick`     | `(e) => void`                         |             | Makes the label a button                          |
| `href`        | `string`                              |             | Makes the label a link                            |
| `selected`    | `boolean`                             |             | Selected state (`aria-pressed` on clickable tags) |
| `onRemove`    | `() => void`                          |             | Shows a × button                                  |
| `removeLabel` | `string`                              |             | Accessible name for × (default "Remove {label}")  |
| `disabled`    | `boolean`                             |             | Disables the tag and its × button                 |
| `classNames`  | `{ label, remove, icon }`             |             | Classes for each part                             |

Variants are exported as `tagVariants`. Parts have `data-slot="tag"`, `tag-label` and `tag-remove`.

## Accessibility

- The remove button has its own accessible name ("Remove Malé").
- On touch screens the label and × get a 44px hit area without changing the layout.

| Key                                      | Action                                   |
| ---------------------------------------- | ---------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd>      | Activate a clickable tag or the × button |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Remove a focused clickable/link tag      |

## RTL and Dhivehi

The × button sits at the inline end, so it moves to the left in RTL. Dhivehi labels use the Thaana font automatically.

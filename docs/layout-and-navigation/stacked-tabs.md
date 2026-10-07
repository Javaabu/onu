---
title: StackedTabs
sidebar_position: 16
---

Vertical tabs for settings-style pages: the tab list sits at the inline start with the panel beside it. In narrow containers (below about 42rem, a container query) the list becomes a native **select** (`mobile="select"`, default) or a horizontally scrolling row (`mobile="scroll"`).

```tsx
import { StackedTabs } from "@javaabu/onu"

;<StackedTabs
  items={[
    { value: "general", label: "General", icon: "settings", description: "Name and logo", content: <General /> },
    { value: "members", label: "Members", icon: "users", badge: 3, content: <Members /> },
    { value: "billing", label: "Billing", icon: "credit-card", content: <Billing /> },
  ]}
/>
```

## Props

| Prop            | Type                                                                               | Default            | Description                                |
| --------------- | ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| `items`         | `{ value, label, textLabel?, description?, icon?, badge?, disabled?, content? }[]` |                    | Tabs                                       |
| `value`         | `string`                                                                           |                    | Controlled value                           |
| `defaultValue`  | `string`                                                                           | first enabled      | Initial value                              |
| `onValueChange` | `(value: string) => void`                                                          |                    | Called on change                           |
| `mobile`        | `'select' \| 'scroll'`                                                             | `'select'`         | What the list becomes in narrow containers |
| `listLabel`     | `string`                                                                           | "Choose a section" | Name of the tab list and the select        |
| `classNames`    | `{ list, trigger, content, select }`                                               |                    | Classes for each part                      |

Use `textLabel` when `label` is not plain text, so the select has an option label.

## Accessibility

- A WAI-ARIA `tablist` with `aria-orientation="vertical"`; the select is labelled for screen readers.
- Triggers and the select are 44px tall on touch screens.

| Key                              | Action              |
| -------------------------------- | ------------------- |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Previous / next tab |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last tab    |

In `scroll` mode the row is horizontal but keeps vertical arrow keys.

## RTL

The list sits on the right in RTL.

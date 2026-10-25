---
title: Tabs
sidebar_position: 14
---

shadcn's `Tabs` (Radix, WAI-ARIA tabs), extended with an `items` API, icons, counts, badges, a tab list that scrolls sideways on phones and a settings-style vertical layout. Without `items` it is the shadcn component, so `TabsList`, `TabsTrigger` and `TabsContent` compose as before. The original stays available from `@javaabu/onu/primitives`.

```tsx
import { Tabs } from "@javaabu/onu"

;<Tabs
  listLabel="Member"
  items={[
    { value: "details", label: "Details", icon: "info", content: <Details /> },
    { value: "documents", label: "Documents", count: 4, content: <Documents /> },
    { value: "history", label: "History", count: 128, content: <History /> },
  ]}
/>
```

Use [`NavTabs`](./nav-tabs) when each tab is its own page.

## Vertical tabs with a narrow fallback

For settings-style pages, `orientation="vertical"` with `narrow` puts the tab list at the inline start with the panel beside it. In narrow containers (below about 42rem, a container query) the list becomes a native **select** (`narrow="select"`) or a horizontally scrolling row (`narrow="scroll"`). Items can carry a `description` (shown beside the panel, hidden in the narrow row) and a `badge`. Without `narrow`, a vertical list stays as it is at every width.

`StackedTabs` is `Tabs` with `orientation="vertical"` and `narrow` (its `mobile` prop, default `"select"`).

```tsx
<Tabs
  orientation="vertical"
  narrow="select"
  items={[
    { value: "general", label: "General", icon: "settings", description: "Name and logo", content: <General /> },
    { value: "members", label: "Members", icon: "users", badge: 3, content: <Members /> },
    { value: "billing", label: "Billing", icon: "credit-card", content: <Billing /> },
  ]}
/>
```

Use `textLabel` when `label` is not plain text, so the select has an option label. The list and the select are named by `listLabel` (default "Choose a section"). `variant` and `scrollable` do not apply in this layout.

| `StackedTabs` prop | Type                                 | Default            | Description                                |
| ------------------ | ------------------------------------ | ------------------ | ------------------------------------------ |
| `items`            | `TabItem[]`                          |                    | Tabs                                       |
| `value`            | `string`                             |                    | Controlled value                           |
| `defaultValue`     | `string`                             | first enabled      | Initial value                              |
| `onValueChange`    | `(value: string) => void`            |                    | Called on change                           |
| `mobile`           | `'select' \| 'scroll'`               | `'select'`         | What the list becomes in narrow containers |
| `listLabel`        | `string`                             | "Choose a section" | Name of the tab list and the select        |
| `classNames`       | `{ list, trigger, content, select }` |                    | Classes for each part                      |

## Props

| Prop            | Type                                        | Default        | Description                                                                    |
| --------------- | ------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `items`         | `TabItem[]`                                 |                | Data-driven tabs                                                               |
| `value`         | `string`                                    |                | Controlled value                                                               |
| `defaultValue`  | `string`                                    | first enabled  | Initial value                                                                  |
| `onValueChange` | `(value: string) => void`                   |                | Called on change                                                               |
| `variant`       | `'default' \| 'line'`                       | `'default'`    | Tab list style                                                                 |
| `orientation`   | `'horizontal' \| 'vertical'`                | `'horizontal'` | Layout and arrow keys                                                          |
| `scrollable`    | `boolean`                                   | `true`         | Let the list scroll when it does not fit                                       |
| `narrow`        | `'select' \| 'scroll'`                      |                | Vertical only: settings layout, and what the list becomes in narrow containers |
| `listLabel`     | `string`                                    |                | Accessible name of the tab list                                                |
| `classNames`    | `{ list, trigger, content, count, select }` |                | Classes for each part                                                          |

`TabItem`: `{ value, label, textLabel?, description?, icon?, count?, badge?, disabled?, content? }`. `description` shows in vertical tabs; a numeric `badge` reads as "3 new".

Counts are formatted with the active locale ("Activity (12)"). Other Radix `Tabs.Root` props are passed through.

## Accessibility

| Key                              | Action                                |
| -------------------------------- | ------------------------------------- |
| <kbd>←</kbd> / <kbd>→</kbd>      | Previous / next tab (mirrored in RTL) |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Previous / next tab (vertical)        |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last tab                      |
| <kbd>Tab</kbd>                   | Into the panel                        |

Screen readers announce the selected tab (§25.10).

With `narrow`, the list is a `tablist` with `aria-orientation="vertical"`, and the narrow-screen select is labelled for screen readers. Triggers and the select are 44px tall on touch screens. In `narrow="scroll"` the row is horizontal but keeps vertical arrow keys.

## RTL

Direction comes from `OnuProvider`, so in RTL <kbd>←</kbd> moves to the next tab (R11.5). With `narrow`, the list sits on the right in RTL.

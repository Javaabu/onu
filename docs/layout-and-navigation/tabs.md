---
title: Tabs
sidebar_position: 14
---

shadcn's `Tabs` (Radix, WAI-ARIA tabs), extended with an `items` API, icons, counts and a tab list that scrolls sideways on phones. Without `items` it is the shadcn component, so `TabsList`, `TabsTrigger` and `TabsContent` compose as before. The original stays available from `@javaabu/onu/primitives`.

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

## Props

| Prop            | Type                                                     | Default        | Description                              |
| --------------- | -------------------------------------------------------- | -------------- | ---------------------------------------- |
| `items`         | `{ value, label, icon?, count?, disabled?, content? }[]` |                | Data-driven tabs                         |
| `value`         | `string`                                                 |                | Controlled value                         |
| `defaultValue`  | `string`                                                 | first enabled  | Initial value                            |
| `onValueChange` | `(value: string) => void`                                |                | Called on change                         |
| `variant`       | `'default' \| 'line'`                                    | `'default'`    | Tab list style                           |
| `orientation`   | `'horizontal' \| 'vertical'`                             | `'horizontal'` | Layout and arrow keys                    |
| `scrollable`    | `boolean`                                                | `true`         | Let the list scroll when it does not fit |
| `listLabel`     | `string`                                                 |                | Accessible name of the tab list          |
| `classNames`    | `{ list, trigger, content, count }`                      |                | Classes for each part                    |

Counts are formatted with the active locale ("Activity (12)"). Other Radix `Tabs.Root` props are passed through.

## Accessibility

| Key                              | Action                                |
| -------------------------------- | ------------------------------------- |
| <kbd>←</kbd> / <kbd>→</kbd>      | Previous / next tab (mirrored in RTL) |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Previous / next tab (vertical)        |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last tab                      |
| <kbd>Tab</kbd>                   | Into the panel                        |

Screen readers announce the selected tab (§25.10).

## RTL

Direction comes from `OnuProvider`, so in RTL <kbd>←</kbd> moves to the next tab (R11.5).

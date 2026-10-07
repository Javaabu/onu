---
title: RecordActionsMenu
sidebar_position: 11
---

Actions in a record page header (e.g. Logs, Approve, Delete — REQUIREMENTS §25.8). From 640px the first `maxVisible` actions are buttons and the rest go in a "More actions" menu; on phones every action is in the menu. Only permitted actions show, and risky ones confirm first.

```tsx
import { RecordActionsMenu } from "@javaabu/onu"

;<RecordActionsMenu
  name="Jane Doe"
  actions={[
    { id: "logs", label: "Logs", icon: "history", href: "/users/1/logs" },
    { id: "approve", label: "Approve", confirm: true, onSelect: approve },
    { id: "delete", label: "Delete", destructive: true, onSelect: remove, permitted: can.delete },
  ]}
/>
```

## Props

| Prop         | Type                           | Default     | Description                   |
| ------------ | ------------------------------ | ----------- | ----------------------------- |
| `name`       | `string`                       |             | Used in confirmations         |
| `actions`    | `RecordAction[]`               |             | See [RowActions](row-actions) |
| `maxVisible` | `number`                       | `2`         | Buttons before the menu       |
| `size`       | `"sm" \| "default"`            | `"default"` |                               |
| `classNames` | `{ button, trigger, content }` |             |                               |

## Accessibility

Buttons and menu items are reachable with <kbd>Tab</kbd> and the arrow keys; <kbd>Escape</kbd> closes the menu. Confirmations return focus to what opened them.

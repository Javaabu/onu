---
title: RowActions
sidebar_position: 10
---

The ⋯ menu at the end of a row (REQUIREMENTS §25.6), on shadcn's `DropdownMenu`. Only actions the user can do are listed; destructive ones close the menu and then ask "Delete Jane Doe?".

```tsx
import { RowActions, trashActions } from "@javaabu/onu"

<RowActions
  name={user.name}
  actions={[
    { id: "view", label: "View", icon: "eye", href: `/users/${user.id}` },
    { id: "edit", label: "Edit", icon: "edit", href: `/users/${user.id}/edit`, permitted: user.can.update },
    { id: "delete", label: "Delete", icon: "trash", destructive: true, separator: true, onSelect: () => api.delete(user.id) },
  ]}
/>

// Trash view: Restore, and Delete permanently (confirms first)
const { t } = useTranslation()
<RowActions name={user.name} actions={trashActions(t, { onRestore, onForceDelete })} />
```

## `RecordAction`

| Field                   | Type                                              | Description                                          |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `id`                    | `string`                                          | `delete` / `force-delete` get the built-in questions |
| `label`                 | `ReactNode`                                       |                                                      |
| `icon`                  | `string`                                          | Semantic icon name                                   |
| `href`                  | `string`                                          | Link (provider's link component)                     |
| `onSelect`              | `() => void \| Promise`                           | The confirmation shows a spinner until it settles    |
| `destructive`           | `boolean`                                         | Red; confirms unless `confirm: false`                |
| `confirm`               | `boolean \| { title, description, confirmLabel }` | Ask first                                            |
| `permitted`             | `boolean`                                         | `false` leaves it out                                |
| `disabled`, `separator` | `boolean`                                         |                                                      |

## Props

| Prop         | Type                           | Default | Description                                                   |
| ------------ | ------------------------------ | ------- | ------------------------------------------------------------- |
| `name`       | `string`                       |         | The record's name: "Actions for Jane Doe", "Delete Jane Doe?" |
| `actions`    | `RecordAction[]`               |         | See above                                                     |
| `align`      | `"start" \| "center" \| "end"` | `"end"` | Menu alignment                                                |
| `classNames` | `{ trigger, content }`         |         | Classes for the ⋯ button and the menu                         |
| `ref`        | `Ref<HTMLButtonElement>`       |         | The ⋯ button                                                  |

Other button props are passed to the ⋯ button. Renders nothing when no action is permitted.

## Accessibility

The button is named "Actions for Jane Doe". Arrow keys move through the menu, <kbd>Enter</kbd> chooses, <kbd>Escape</kbd> closes it and focus returns to ⋯. After a confirmation closes, focus also returns to ⋯.

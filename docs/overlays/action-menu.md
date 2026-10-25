---
title: ActionMenu
sidebar_position: 7
---

A **dropdown menu** of actions built from an `items` array, on shadcn's `DropdownMenu` (Radix). Items take semantic icons, shortcut hints, destructive styling, links, checkbox and radio items, submenus, and an optional confirmation step. The primitive parts (`DropdownMenu`, `DropdownMenuItem`, …) are also exported.

```tsx
import { ActionMenu, type MenuItem } from "@javaabu/onu"

const items: MenuItem[] = [
  { label: "View", icon: "eye", href: `/users/${user.id}` },
  { label: "Edit", icon: "edit", shortcut: "⌘E", onSelect: edit },
  { label: "Archive", icon: "archive", hidden: !can("archive") },
  { type: "separator" },
  {
    type: "sub",
    label: "Move to island",
    icon: "map-pin",
    items: islands.map((island) => ({ label: island.name, onSelect: () => move(island) })),
  },
  { type: "separator" },
  {
    label: "Delete",
    icon: "trash",
    variant: "destructive",
    confirm: { title: `Delete ${user.name}?`, variant: "destructive" },
    onSelect: remove,
  },
]

;<ActionMenu items={items} />
```

Without a `trigger`, a ⋯ icon button labelled "More actions" opens the menu (44px on touch screens). Pass `name` for a record's menu: the button becomes "Actions for Aishath Ali" and confirmations default to "Delete Aishath Ali?" (see [Row actions](#row-actions)), or `label` to name the button yourself. The menu renders nothing when no item is visible, e.g. when no action is `permitted`.

## Item types

| `type`           | Fields                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `item` (default) | `label`, `icon`, `shortcut`, `variant`, `href`, `confirm`, `onSelect`, `disabled`, `hidden`, and the [`RecordAction`](#recordaction) fields `destructive`, `permitted`, `separator` |
| `checkbox`       | `label`, `icon`, `shortcut`, `checked`, `onCheckedChange` (menu stays open)                 |
| `radio`          | `label` (heading), `value`, `onValueChange`, `options: { value, label, icon, disabled }[]`  |
| `sub`            | `label`, `icon`, `items`                                                                    |
| `group`          | `label`, `items`                                                                            |
| `label`          | `label`                                                                                     |
| `separator`      |                                                                                             |

`hidden` items are left out (list only what the user can do, §25.6), and separators left dangling are dropped. `href` items render through the `OnuProvider` link component (Inertia, Next). `confirm` (options, a title string, or `true` for the default question) closes the menu, then asks in a [`ConfirmDialog`](./confirm-dialog), and runs `onSelect` only when confirmed. If `onSelect` returns a promise, the dialog shows a spinner until it settles. The mounted `ConfirmProvider` asks (with its `defaults`); without one, the menu shows its own dialog.

## Props

| Prop                                           | Type                           | Default        | Description                               |
| ---------------------------------------------- | ------------------------------ | -------------- | ----------------------------------------- |
| `items`                                        | `MenuItem[]`                   |                | Menu entries (required)                   |
| `trigger`                                      | `ReactNode`                    | ⋯ button       | Element that opens the menu               |
| `label`                                        | `string`                       | "More actions" | Accessible name of the default trigger    |
| `name`                                         | `string`                       |                | Record name: trigger label, confirmations |
| `align`                                        | `'start' \| 'center' \| 'end'` | `'end'`        | Alignment to the trigger                  |
| `open`, `defaultOpen`, `onOpenChange`, `modal` |                                |                | Menu state                                |
| `className`                                    | `string`                       |                | Classes for the menu                      |
| `classNames`                                   | `{ trigger, item }`            |                | Classes for the default trigger and items |

Other props go to Radix `DropdownMenu.Content` (`side`, `sideOffset`, …).

## Row actions

The ⋯ menu at the end of a table row or list item (REQUIREMENTS §25.6). Give the menu the record's `name` and listing-style [`RecordAction`](#recordaction) items: only permitted actions are listed (with none, there is no ⋯ button), and destructive ones close the menu and then ask "Delete Jane Doe?". `DataTable` and `ListView` render one per row.

```tsx
import { ActionMenu, trashActions } from "@javaabu/onu"

<ActionMenu
  name={user.name}
  items={[
    { id: "view", label: "View", icon: "eye", href: `/users/${user.id}` },
    { id: "edit", label: "Edit", icon: "edit", href: `/users/${user.id}/edit`, permitted: user.can.update },
    { id: "delete", label: "Delete", icon: "trash", destructive: true, separator: true, onSelect: () => api.delete(user.id) },
  ]}
/>

// Trash view: Restore, and Delete permanently (confirms first)
const { t } = useTranslation()
<ActionMenu name={user.name} items={trashActions(t, { onRestore, onForceDelete })} />
```

A destructive action (or `confirm: true`) asks "Delete Jane Doe?" for `id: "delete"`, "Permanently delete Jane Doe?" for `id: "force-delete"`, and "{label} Jane Doe?" otherwise, with "This can't be undone." below; `confirm` options replace any part of that. The dialog is styled even without a `ConfirmProvider`.

### `RecordAction`

| Field                   | Type                                                           | Description                                          |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| `id`                    | `string`                                                       | `delete` / `force-delete` get the built-in questions |
| `label`                 | `ReactNode`                                                    |                                                      |
| `icon`                  | `string`                                                       | Semantic icon name                                   |
| `href`                  | `string`                                                       | Link (provider's link component)                     |
| `onSelect`              | `() => void \| Promise`                                        | The confirmation shows a spinner until it settles    |
| `destructive`           | `boolean`                                                      | Red; confirms unless `confirm: false`                |
| `confirm`               | `boolean \| { title, description, confirmLabel, destructive }` | Ask first                                            |
| `permitted`             | `boolean`                                                      | `false` leaves it out                                |
| `disabled`, `separator` | `boolean`                                                      | `separator` draws a line above the item              |

## Accessibility

Follows the WAI-ARIA menu button pattern. Focus returns to the trigger when the menu closes, and again when a confirmation closes. With `name`, the ⋯ button is named "Actions for Jane Doe" ("ޖަމީލާ އާ ގުޅޭ ކަންކަން" in Dhivehi). The ⋯ button and the items are at least 44px tall on touch screens.

| Key                                                | Action                              |
| -------------------------------------------------- | ----------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> | Open from the trigger               |
| <kbd>↑</kbd> / <kbd>↓</kbd>                        | Move between items                  |
| <kbd>→</kbd> (LTR) / <kbd>←</kbd> (RTL)            | Open a submenu                      |
| <kbd>←</kbd> (LTR) / <kbd>→</kbd> (RTL)            | Close a submenu                     |
| <kbd>Enter</kbd>                                   | Choose                              |
| <kbd>Escape</kbd>                                  | Close and return focus              |
| Letters                                            | Jump to an item by its first letter |

## RTL

Submenus open toward the inline end (left in RTL), the submenu chevron mirrors, and shortcut hints keep their Latin order.

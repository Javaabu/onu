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

Without a `trigger`, a ⋯ icon button labelled "More actions" opens the menu. Pass `label` to name it per row (e.g. "Actions for Aishath Ali").

## Item types

| `type`           | Fields                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `item` (default) | `label`, `icon`, `shortcut`, `variant`, `href`, `confirm`, `onSelect`, `disabled`, `hidden` |
| `checkbox`       | `label`, `icon`, `shortcut`, `checked`, `onCheckedChange` (menu stays open)                 |
| `radio`          | `label` (heading), `value`, `onValueChange`, `options: { value, label, icon, disabled }[]`  |
| `sub`            | `label`, `icon`, `items`                                                                    |
| `group`          | `label`, `items`                                                                            |
| `label`          | `label`                                                                                     |
| `separator`      |                                                                                             |

`hidden` items are left out (list only what the user can do, §25.6), and separators left dangling are dropped. `href` items render through the `OnuProvider` link component (Inertia, Next). `confirm` (options or a title string) closes the menu, asks with [`confirm()`](./confirm-dialog), and runs `onSelect` only when confirmed; mount a `ConfirmProvider` for the styled dialog.

## Props

| Prop                                           | Type                           | Default        | Description                               |
| ---------------------------------------------- | ------------------------------ | -------------- | ----------------------------------------- |
| `items`                                        | `MenuItem[]`                   |                | Menu entries (required)                   |
| `trigger`                                      | `ReactNode`                    | ⋯ button       | Element that opens the menu               |
| `label`                                        | `string`                       | "More actions" | Accessible name of the default trigger    |
| `align`                                        | `'start' \| 'center' \| 'end'` | `'end'`        | Alignment to the trigger                  |
| `open`, `defaultOpen`, `onOpenChange`, `modal` |                                |                | Menu state                                |
| `className`                                    | `string`                       |                | Classes for the menu                      |
| `classNames`                                   | `{ trigger, item }`            |                | Classes for the default trigger and items |

Other props go to Radix `DropdownMenu.Content` (`side`, `sideOffset`, …).

## Accessibility

Follows the WAI-ARIA menu button pattern. Focus returns to the trigger when the menu closes. Items are at least 44px tall on touch screens.

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

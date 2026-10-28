# ActionMenu

A **dropdown menu** of actions built from an `items` array, on shadcn's `DropdownMenu` (Radix). Items take semantic icons, shortcut hints, destructive styling, links, checkbox and radio items, submenus, and an optional confirmation step. With `openOn="context"` the same items open as a [context menu](#context-menu) (right-click or long press). The primitive parts (`DropdownMenu`, `DropdownMenuItem`, `ContextMenu`, `ContextMenuItem`, …) are also exported.

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

`hidden` items are left out (list only what the user can do, §25.6), and separators left dangling are dropped. `href` items render through the `OnuProvider` link component (Inertia, Next). `confirm` (options, a title string, or `true` for the default question) closes the menu, then asks in a [`ConfirmDialog`](./confirm-dialog.md), and runs `onSelect` only when confirmed. If `onSelect` returns a promise, the dialog shows a spinner until it settles. The mounted `ConfirmProvider` asks (with its `defaults`); without one, the menu shows its own dialog.

## Props

| Prop                                           | Type                           | Default        | Description                                                      |
| ---------------------------------------------- | ------------------------------ | -------------- | ---------------------------------------------------------------- |
| `items`                                        | `MenuItem[]`                   |                | Menu entries (required)                                          |
| `openOn`                                       | `'click' \| 'context'`         | `'click'`      | A trigger button, or a context menu on `children`                |
| `trigger`                                      | `ReactNode`                    | ⋯ button       | Element that opens the menu                                      |
| `label`                                        | `string`                       | "More actions" | Accessible name of the default trigger                           |
| `name`                                         | `string`                       |                | Record name: trigger label, confirmations                        |
| `children`                                     | `ReactNode`                    |                | `openOn="context"`: the area that opens the menu                 |
| `asChild`                                      | `boolean`                      | `false`        | `openOn="context"`: the child is the area (no wrapping `<span>`) |
| `disabled`                                     | `boolean`                      | `false`        | Turn the menu off (disables the trigger)                         |
| `align`                                        | `'start' \| 'center' \| 'end'` | `'end'`        | Alignment to the trigger                                         |
| `open`, `defaultOpen`, `onOpenChange`, `modal` |                                |                | Menu state (`open`, `defaultOpen`: dropdown only)                |
| `className`                                    | `string`                       |                | Classes for the menu                                             |
| `classNames`                                   | `{ trigger, item }`            |                | Classes for the default trigger (or the area) and items          |

Other props go to Radix `DropdownMenu.Content` (`side`, `sideOffset`, …), or `ContextMenu.Content` with `openOn="context"`, where the menu opens at the pointer and `align`, `side` and `sideOffset` do not apply.

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

## Context menu

`openOn="context"` opens the same items as a **context menu** (shadcn `ContextMenu`) on `children`: right-click, a long press on touch screens, or the <kbd>Menu</kbd> key / <kbd>Shift</kbd>+<kbd>F10</kbd> on the focused area. Confirmations, `name` and record actions work as in the dropdown.

```tsx
<ActionMenu openOn="context" items={fileActions} asChild>
  <div tabIndex={0} className="…">
    permit-2041.pdf
    <ActionMenu items={fileActions} label="Actions for permit-2041.pdf" />
  </div>
</ActionMenu>
```

Without `asChild`, `children` are wrapped in a `<span>`. When no item is visible, or with `disabled`, the area stays and right-click shows the browser's own menu.

:::caution
Context menus are hard to discover and need a mouse, a long press or a special key. Always offer the same actions somewhere visible too, such as a dropdown `ActionMenu` on the row.
:::

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

A context menu follows the WAI-ARIA menu pattern once open. To open it from the keyboard, make the area focusable (`tabIndex={0}`) and press <kbd>Menu</kbd> or <kbd>Shift</kbd>+<kbd>F10</kbd>; it opens at the focused area. On touch screens a long press (about 0.7s) opens it at the finger, and the area suppresses the iOS link callout so the press isn't hijacked.

## RTL

Submenus open toward the inline end (left in RTL), the submenu chevron mirrors, and shortcut hints keep their Latin order.

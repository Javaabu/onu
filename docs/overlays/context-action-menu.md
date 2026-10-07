---
title: ContextActionMenu
sidebar_position: 8
---

A **context menu** (right-click menu) built from the same `items` as [`ActionMenu`](./action-menu), on shadcn's `ContextMenu` (Radix). On touch screens it opens with a long press. The primitive parts (`ContextMenu`, `ContextMenuItem`, …) are also exported.

```tsx
import { ActionMenu, ContextActionMenu } from "@javaabu/onu"

;<ContextActionMenu items={fileActions} asChild>
  <div tabIndex={0} className="…">
    permit-2041.pdf
    <ActionMenu items={fileActions} label="Actions for permit-2041.pdf" />
  </div>
</ContextActionMenu>
```

:::caution
Context menus are hard to discover and need a mouse, a long press or a special key. Always offer the same actions somewhere visible too, such as an `ActionMenu` on the row.
:::

## Props

| Prop           | Type                      | Default | Description                                                    |
| -------------- | ------------------------- | ------- | -------------------------------------------------------------- |
| `items`        | `MenuItem[]`              |         | Menu entries, as for `ActionMenu` (required)                   |
| `children`     | `ReactNode`               |         | The area that opens the menu                                   |
| `asChild`      | `boolean`                 | `false` | Use the child as the area instead of wrapping it in a `<span>` |
| `disabled`     | `boolean`                 | `false` | Turn the menu off                                              |
| `onOpenChange` | `(open: boolean) => void` |         | Called when the menu opens or closes                           |
| `className`    | `string`                  |         | Classes for the menu                                           |
| `classNames`   | `{ trigger, item }`       |         | Classes for the area and items                                 |

## Accessibility

Follows the WAI-ARIA menu pattern once open. To open it from the keyboard, make the area focusable (`tabIndex={0}`) and press the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd>.

| Key                                               | Action                   |
| ------------------------------------------------- | ------------------------ |
| <kbd>Menu</kbd> / <kbd>Shift</kbd>+<kbd>F10</kbd> | Open at the focused area |
| <kbd>↑</kbd> / <kbd>↓</kbd>                       | Move between items       |
| <kbd>→</kbd> (LTR) / <kbd>←</kbd> (RTL)           | Open a submenu           |
| <kbd>Enter</kbd>                                  | Choose                   |
| <kbd>Escape</kbd>                                 | Close                    |

## Touch

A long press (about 0.7s) opens the menu at the finger. The area suppresses the iOS link callout so the press isn't hijacked.

## RTL

Submenus open toward the inline end and the chevron mirrors in RTL.

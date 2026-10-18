# MenuBar

A desktop-style application menu bar (File, Edit, View …) described as data. Built on shadcn's `Menubar` (Radix, WAI-ARIA menubar pattern). The bar scrolls sideways when it does not fit.

```tsx
import { MenuBar } from "@javaabu/onu"

;<MenuBar
  menus={[
    {
      label: "File",
      items: [
        { label: "New", icon: "add", shortcut: "⌘N", onSelect: create },
        { label: "Save", icon: "save", shortcut: "⌘S", onSelect: save },
        { type: "separator" },
        { type: "sub", label: "Export", items: [{ label: "PDF" }, { label: "CSV" }] },
      ],
    },
    {
      label: "View",
      items: [
        { type: "checkbox", label: "Word wrap", checked: wrap, onCheckedChange: setWrap },
        { type: "radio", value: zoom, onValueChange: setZoom, options: [{ value: "100", label: "100%" }] },
      ],
    },
  ]}
/>
```

## Entries

| `type`             | Fields                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| `"item"` (default) | `label`, `icon`, `shortcut`, `href`, `disabled`, `variant`, `onSelect` |
| `"separator"`      |                                                                        |
| `"label"`          | `label`                                                                |
| `"checkbox"`       | `label`, `checked`, `onCheckedChange`, `shortcut`, `disabled`          |
| `"radio"`          | `value`, `onValueChange`, `options: { value, label, disabled }[]`      |
| `"sub"`            | `label`, `icon`, `items`                                               |

## Props

| Prop         | Type                         | Description           |
| ------------ | ---------------------------- | --------------------- |
| `menus`      | `{ label, items }[]`         | The menus             |
| `classNames` | `{ trigger, content, item }` | Classes for each part |
| `className`  | `string`                     | Classes for the bar   |

Other Radix `Menubar.Root` props are passed through.

## Accessibility

| Key                             | Action                                |
| ------------------------------- | ------------------------------------- |
| <kbd>←</kbd> / <kbd>→</kbd>     | Move between menus (mirrored in RTL)  |
| <kbd>↓</kbd> / <kbd>Enter</kbd> | Open a menu                           |
| <kbd>↑</kbd> / <kbd>↓</kbd>     | Move between items                    |
| <kbd>→</kbd>                    | Open a submenu (<kbd>←</kbd> in RTL)  |
| <kbd>Escape</kbd>               | Close and return focus to the trigger |

Shortcut hints are visual only; register the shortcuts yourself.

## RTL

Direction comes from `OnuProvider`, so arrow keys follow the visual order and submenus open to the left.

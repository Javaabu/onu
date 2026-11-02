# BottomNav

Phone bottom navigation: three to five destinations with icons and short labels, badges and the active state. Targets are at least 56px tall, and the bar is padded for the home indicator (`env(safe-area-inset-bottom)`, R3.30). Hidden from 768px by default.

```tsx
import { BottomNav } from "@javaabu/onu"

;<BottomNav
  currentHref={url}
  items={[
    { label: "Home", href: "/", icon: "home" },
    { label: "Applications", href: "/applications", icon: "file-text", badge: 2 },
    { label: "Inbox", href: "/inbox", icon: "mail", badge: 128 },
    { label: "Profile", href: "/profile", icon: "user" },
  ]}
/>
```

Pass it to [`AppLayout`](./app-layout.md)'s `bottomNav` so the content is padded above it.

## Props

| Prop          | Type                                 | Default            | Description                                                   |
| ------------- | ------------------------------------ | ------------------ | ------------------------------------------------------------- |
| `items`       | `NavItem[]`                          |                    | Destinations (`label`, `href` or `onSelect`, `icon`, `badge`) |
| `currentHref` | `string`                             |                    | Current URL (path and query)                              |
| `match`       | `'prefix' \| 'exact'`                | `'prefix'`         | How `currentHref` matches                                     |
| `position`    | `'fixed' \| 'static'`                | `'fixed'`          | Fixed to the viewport bottom, or in place                     |
| `hideFrom`    | `'sm' \| 'md' \| 'lg' \| 'never'`    | `'md'`             | Breakpoint from which it hides                                |
| `aria-label`  | `string`                             | "Quick navigation" | Landmark name                                                 |
| `classNames`  | `{ list, item, icon, label, badge }` |                    | Classes for each part                                         |

Numeric badges show "99+" above 99 and read as "3 new" to screen readers.

## Accessibility

- A `navigation` landmark; the current item has `aria-current="page"`.
- The accessible name of each item is its label plus the badge text ("Inbox, 3 new").

| Key              | Action             |
| ---------------- | ------------------ |
| <kbd>Tab</kbd>   | Move between items |
| <kbd>Enter</kbd> | Follow the link    |

## RTL

Items run right to left in RTL; badges sit on the inline end of the icon.

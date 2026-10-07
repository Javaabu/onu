---
title: SideNav
sidebar_position: 7
---

A vertical navigation list that works on its own (settings pages, documentation, account pages) and inside drawers: groups, icons, badges, descriptions and collapsible nested items. [`TopNav`](./top-nav) and [`OverlayMenu`](./overlay-menu) use it for their phone/overlay menus.

```tsx
import { SideNav } from "@javaabu/onu"

;<SideNav
  aria-label="Settings"
  currentHref={url}
  groups={[
    {
      label: "Organisation",
      items: [
        { label: "General", href: "/settings", icon: "settings" },
        {
          label: "Members",
          href: "/settings/members",
          icon: "users",
          badge: 24,
          items: [{ label: "Invitations", href: "/settings/members/invitations", badge: 3 }],
        },
      ],
    },
  ]}
/>
```

The current page gets `aria-current="page"` and its parents start expanded. Links render through `OnuProvider linkComponent`.

## Props

| Prop          | Type                                            | Default     | Description                                   |
| ------------- | ----------------------------------------------- | ----------- | --------------------------------------------- |
| `items`       | `NavItem[]`                                     |             | Flat list (or use `groups`)                   |
| `groups`      | `{ label?, items }[]`                           |             | Labelled groups (each list is labelled by it) |
| `currentHref` | `string`                                        |             | Current URL path                              |
| `match`       | `'prefix' \| 'exact'`                           | `'prefix'`  | How `currentHref` matches                     |
| `size`        | `'sm' \| 'default' \| 'lg'`                     | `'default'` | `lg` gives 48px rows for kiosks and overlays  |
| `onNavigate`  | `(item) => void`                                |             | Called after an item is activated             |
| `aria-label`  | `string`                                        | "Main"      | Name of the navigation landmark               |
| `classNames`  | `{ group, groupLabel, list, item, sub, badge }` |             | Classes for each part                         |

`sideNavItemVariants` is exported. Items without `href` render as buttons (use `onSelect`).

## Accessibility

- A `navigation` landmark; each group's list is labelled by the group label.
- Expand buttons expose `aria-expanded` and are named "Show or hide …".
- Rows are at least 44px tall on touch screens.

| Key                                 | Action                  |
| ----------------------------------- | ----------------------- |
| <kbd>Tab</kbd>                      | Move between items      |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Follow a link or expand |

## RTL

Nested lists indent from the inline start and the guide line sits on the right in RTL.

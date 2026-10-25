---
title: TopNav
sidebar_position: 3
---

Horizontal main navigation for headers, built on shadcn's `navigation-menu`. Items with `items` open a dropdown panel; items with `columns` open a wide [mega menu](#mega-menu) panel. Below the `md` breakpoint (768px) it collapses to a **menu button** that opens a drawer with the same items as a [`SideNav`](./side-nav).

```tsx
import { TopNav } from "@javaabu/onu"

;<TopNav
  currentHref={url}
  items={[
    { label: "Home", href: "/" },
    {
      label: "Services",
      items: [
        { label: "ID cards", href: "/services/id", description: "Apply or renew", icon: "user" },
        { label: "Passports", href: "/services/passports" },
      ],
    },
    { label: "News", href: "/news", badge: 2 },
  ]}
  logo={<Logo src="/logo.svg" alt="gov.mv" />}
/>
```

Items use the shared `NavItem` shape: `{ label, href?, icon?, badge?, description?, isActive?, disabled?, external?, items?, onSelect? }`, plus `columns?` and `featured?` (a `TopNavItem`). Links render through `OnuProvider linkComponent` (R16.2).

## Active state

The item whose `href` matches `currentHref` gets `aria-current="page"`. With the default `match="prefix"`, `/news/123` keeps **News** active (the longest matching parent wins). A parent of the active item is highlighted too.

## Mega menu

An item with `columns` opens a wide panel with several columns of links (each with an optional icon, description and badge) and an optional `featured` area (a promo card, an image). Up to four columns sit side by side from `md`; the featured area shows from `lg`. `columns` take the place of `items`. Panel links take part in the active state like any other item.

```tsx
import { Card, TopNav } from "@javaabu/onu"

;<TopNav
  currentHref={url}
  items={[
    {
      label: "Citizens",
      columns: [
        {
          title: "ID and documents",
          links: [
            { label: "National ID card", href: "/id", icon: "user", description: "Apply or renew" },
            { label: "Passport", href: "/passport", icon: "globe" },
          ],
        },
        { title: "Housing", links: [{ label: "Hulhumalé flats", href: "/flats" }] },
      ],
      featured: <Card size="sm" title="eFaas" description="One login for every service." href="/efaas" />,
    },
    { label: "News", href: "/news" },
  ]}
/>
```

`TopNavColumn`: `{ title?, links: TopNavLink[] }`. `TopNavLink`: `{ label, href, description?, icon?, badge?, isActive?, external?, onSelect? }`. `classNames.panel` and `classNames.column` style the panel and its columns.

In the phone drawer, an item with `columns` is a collapsible section: a titled column becomes a labelled sub-section, and an untitled column's links sit directly in the item's section. The sections holding the current page start open. The featured area is not shown on phones.

## Props

| Prop           | Type                                                                | Default    | Description                               |
| -------------- | ------------------------------------------------------------------- | ---------- | ----------------------------------------- |
| `items`        | `TopNavItem[]`                                                      |            | Navigation items                          |
| `currentHref`  | `string`                                                            |            | Current URL path                          |
| `match`        | `'prefix' \| 'exact'`                                               | `'prefix'` | How `currentHref` matches                 |
| `logo`         | `ReactNode`                                                         |            | Top of the phone drawer                   |
| `mobileFooter` | `ReactNode`                                                         |            | Bottom of the phone drawer (e.g. Sign in) |
| `mobileSide`   | `'start' \| 'end'`                                                  | `'end'`    | Side the drawer slides in from            |
| `navLabel`     | `string`                                                            | "Main"     | Accessible name of the navigation         |
| `classNames`   | `{ list, link, content, trigger, sheet, panel, column, panelLink }` |            | Classes for each part                     |

`TopNavItem` adds `columns?: TopNavColumn[]` (a mega menu panel) and `featured?: ReactNode` to `NavItem`. `classNames.link` styles top-level links; `panelLink` styles links in dropdowns and panels.

## Accessibility

- A `navigation` landmark; dropdown and panel triggers expose `aria-expanded`.
- The phone drawer is a dialog: focus is trapped, <kbd>Escape</kbd> closes it and focus returns to the menu button. It closes after a link is chosen.

| Key                                 | Action                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| <kbd>Tab</kbd>                      | Move between top-level items, and through the links in an open panel |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open a dropdown or panel                                             |
| <kbd>↓</kbd>                        | Move into an open dropdown                                           |
| <kbd>Escape</kbd>                   | Close the dropdown, panel or drawer                                  |

## RTL

The list, dropdowns and panel columns mirror; panels open from the inline start; the drawer opens from the inline end (the left in RTL).

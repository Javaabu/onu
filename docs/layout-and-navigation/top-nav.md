# TopNav

Horizontal main navigation for headers, built on shadcn's `navigation-menu`. Items with `items` open a dropdown panel. Below the `md` breakpoint (768px) it collapses to a **menu button** that opens a drawer with the same items as a [`SideNav`](./side-nav.md).

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

Items use the shared `NavItem` shape: `{ label, href?, icon?, badge?, description?, isActive?, disabled?, external?, items?, onSelect? }`. Links render through `OnuProvider linkComponent` (R16.2).

## Active state

The item whose `href` matches `currentHref` gets `aria-current="page"`. With the default `match="prefix"`, `/news/123` keeps **News** active (the longest matching parent wins). A parent of the active item is highlighted too.

## Props

| Prop           | Type                                      | Default    | Description                               |
| -------------- | ----------------------------------------- | ---------- | ----------------------------------------- |
| `items`        | `NavItem[]`                               |            | Navigation items                          |
| `currentHref`  | `string`                                  |            | Current URL path                          |
| `match`        | `'prefix' \| 'exact'`                     | `'prefix'` | How `currentHref` matches                 |
| `logo`         | `ReactNode`                               |            | Top of the phone drawer                   |
| `mobileFooter` | `ReactNode`                               |            | Bottom of the phone drawer (e.g. Sign in) |
| `mobileSide`   | `'start' \| 'end'`                        | `'end'`    | Side the drawer slides in from            |
| `navLabel`     | `string`                                  | "Main"     | Accessible name of the navigation         |
| `classNames`   | `{ list, link, content, trigger, sheet }` |            | Classes for each part                     |

## Accessibility

- A `navigation` landmark; dropdown triggers expose `aria-expanded`.
- The phone drawer is a dialog: focus is trapped, <kbd>Escape</kbd> closes it and focus returns to the menu button. It closes after a link is chosen.

| Key                                 | Action                       |
| ----------------------------------- | ---------------------------- |
| <kbd>Tab</kbd>                      | Move between top-level items |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open a dropdown              |
| <kbd>↓</kbd>                        | Move into an open dropdown   |
| <kbd>Escape</kbd>                   | Close the dropdown or drawer |

## RTL

The list and dropdowns mirror; the drawer opens from the inline end (the left in RTL).

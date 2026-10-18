# MegaMenu

Header navigation whose items open wide panels with several columns of links (each with an optional icon and description) and an optional featured area. Built on shadcn's `navigation-menu`. On phones it collapses to a menu button and a drawer with one accordion section per item.

```tsx
import { Card, MegaMenu } from "@javaabu/onu"

;<MegaMenu
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

## Props

| Prop         | Type                                      | Default | Description                    |
| ------------ | ----------------------------------------- | ------- | ------------------------------ |
| `items`      | `MegaMenuItem[]`                          |         | Top-level items                |
| `logo`       | `ReactNode`                               |         | Top of the phone drawer        |
| `mobileSide` | `'start' \| 'end'`                        | `'end'` | Side the drawer slides in from |
| `navLabel`   | `string`                                  | "Main"  | Accessible name                |
| `classNames` | `{ trigger, panel, column, link, sheet }` |         | Classes for each part          |

`MegaMenuItem`: `{ label, href?, columns?: { title?, links: { label, href, description?, icon?, external? }[] }[], featured? }`. Up to four columns sit side by side from `md`; the featured area shows from `lg`.

## Accessibility

| Key                                 | Action                              |
| ----------------------------------- | ----------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open a panel                        |
| <kbd>Tab</kbd>                      | Move through the links in a panel   |
| <kbd>Escape</kbd>                   | Close the panel or the phone drawer |

The phone drawer traps focus and returns it to the menu button when closed.

## RTL

Panels open from the inline start and columns mirror; the drawer opens from the inline end.

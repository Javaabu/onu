---
title: AppSidebar
sidebar_position: 6
---

The app's main sidebar with a simple `items` / `groups` API: icons, badges, nested items and the active state from the current URL. It renders shadcn's `Sidebar`, so every shadcn sidebar feature still works: collapse to icons (`collapsible="icon"`, the default), off-canvas, the rail, the <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd> shortcut, the cookie-persisted state and the phone drawer.

```tsx
import { AppSidebar, Logo, UserProfile } from "@javaabu/onu"

;<AppSidebar
  currentHref={url}
  header={<Logo src="/logo.svg" alt="Onu" text="Onu" />}
  footer={<UserProfile name="Aishath Shifa" subtitle="Admin" onSignOut={signOut} side="top" />}
  groups={[
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/", icon: "home" },
        { label: "Applications", href: "/applications", icon: "file-text", badge: 12 },
        {
          label: "Users",
          href: "/users",
          icon: "users",
          items: [
            { label: "All users", href: "/users/all" },
            { label: "Invitations", href: "/users/invitations", badge: 3 },
          ],
        },
      ],
    },
  ]}
/>
```

Use it inside [`AppLayout`](./app-layout) or your own `SidebarProvider`.

## Items

Items use the shared `NavItem` shape: `{ label, href?, icon?, badge?, isActive?, disabled?, external?, items?, onSelect? }`.

- `icon`: a semantic icon name (`"home"`) or any node.
- `badge`: a number (shown as a count, "99+" above 99, with "3 new" for screen readers) or any node.
- `items`: nested items. A parent with an `href` gets a separate expand button; without one, the whole row toggles.
- **Active state**: the item matching `currentHref` gets `aria-current="page"`; its parent starts expanded. `match="prefix"` (default) keeps `/users` active on `/users/12/edit`; set `isActive` to override. Items whose `href` has a query string (`/users?status=active`) also match on its parameters.
- **Collapsed to icons**: labels become tooltips and nested items open in a flyout menu.
- On phones the drawer closes after an item is chosen.

## Props

| Prop          | Type                                                          | Default     | Description                       |
| ------------- | ------------------------------------------------------------- | ----------- | --------------------------------- |
| `items`       | `NavItem[]`                                                   |             | Flat list (or use `groups`)       |
| `groups`      | `{ label?, items }[]`                                         |             | Labelled groups                   |
| `currentHref` | `string`                                                      |             | Current URL (path and query)  |
| `match`       | `'prefix' \| 'exact'`                                         | `'prefix'`  | How `currentHref` matches         |
| `header`      | `ReactNode`                                                   |             | Top area (logo, team switcher)    |
| `footer`      | `ReactNode`                                                   |             | Bottom area (user profile)        |
| `children`    | `ReactNode`                                                   |             | Extra content after the groups    |
| `rail`        | `boolean`                                                     | `true`      | Show the toggle rail              |
| `onNavigate`  | `(item) => void`                                              |             | Called after an item is activated |
| `navLabel`    | `string`                                                      | "Main"      | Accessible name of the navigation |
| `collapsible` | `'icon' \| 'offcanvas' \| 'none'`                             | `'icon'`    | Desktop collapse mode             |
| `side`        | `'start' \| 'end'`                                            | `'start'`   | Logical side                      |
| `variant`     | `'sidebar' \| 'floating' \| 'inset'`                          | `'sidebar'` | shadcn variant                    |
| `classNames`  | `{ header, content, footer, group, groupLabel, item, badge }` |             | Classes for each part             |

The theme tokens are `--onu-sidebar`, `--onu-sidebar-foreground`, `--onu-sidebar-primary`, `--onu-sidebar-accent` and `--onu-sidebar-border`.

## Accessibility

| Key                                       | Action                           |
| ----------------------------------------- | -------------------------------- |
| <kbd>Tab</kbd>                            | Move between items               |
| <kbd>Enter</kbd> / <kbd>Space</kbd>       | Follow a link or expand a group  |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd> | Toggle the sidebar               |
| <kbd>Escape</kbd>                         | Close the phone drawer or flyout |

## RTL

`side="start"` puts the sidebar on the right in RTL; chevrons mirror and flyouts open towards the content.

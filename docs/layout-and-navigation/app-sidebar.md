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

## Proton shell (the default)

Inside a panel `AppLayout` (the default) the sidebar uses `surface="shell"`: Proton Mail's look on the app shell colour, the same surface as the header and the frame around the content panel.

- **Items** are 36px rows with 8px corners, a grey hover and a grey active state with a semibold label and a brand icon (no edge line, no brand tint).
- **`action`**: the main call to action under the header, as a full-width 44px button (Proton's "New message"). Collapsed to icons, only its icon shows; the label stays its accessible name.
- **Count pills**: numeric badges are brand-coloured pills for unread-like counts, read as "12 new" by screen readers. Set `badgeTone: "neutral"` on an item for a plain muted total, read as the number alone.
- **Folders and labels**: give an item a `color`. With a semantic icon (`icon: "folder"`) the icon is tinted; with no icon it shows a coloured dot. The colour is decorative; the label carries the meaning.
- **Header and footer**: put a `Logo` in `header`, with an [`ActionMenu`](../overlays/action-menu) of the suite's apps next to it if there is one, and a quota bar ([`ProgressBar`](../loading/progress-bar) with a link) or a `UserProfile` in `footer`.

```tsx
<AppSidebar
  currentHref={url}
  header={
    <div className="flex items-center justify-between gap-2">
      <Logo src="/logo.svg" alt="" text="Atoll Records" />
      <ActionMenu
        align="start"
        trigger={
          <Button variant="ghost" size="icon" aria-label="Switch app">
            <Icon name="grid" />
          </Button>
        }
        items={[
          { type: "label", label: "Atoll apps" },
          { label: "Records", href: "/records", icon: "file-text" },
          { label: "Calendar", href: "/calendar", icon: "calendar" },
        ]}
      />
    </div>
  }
  action={
    <LinkButton href="/applications/new" startIcon="add">
      New application
    </LinkButton>
  }
  groups={[
    {
      items: [
        { label: "Inbox", href: "/inbox", icon: "home", badge: 12 },
        { label: "In review", href: "/review", icon: "clock", badge: 34, badgeTone: "neutral" },
      ],
    },
    { label: "Folders", items: [{ label: "Building permits", href: "/f/building", icon: "folder", color: "#8080ff" }] },
    { label: "Labels", items: [{ label: "Malé", href: "/l/male", color: "#1da583" }] },
  ]}
  footer={
    <div className="gap-2 pt-3 grid border-t border-shell-border">
      <ProgressBar size="sm" label="Storage" value={1284} max={2000} showValue classNames={{ track: "bg-shell-weak" }} />
      <a href="/billing" className="text-xs text-primary hover:underline">
        Get more space
      </a>
    </div>
  }
/>
```

`surface="sidebar"` (the default inside a `variant="flat"` layout or a plain `SidebarProvider`) keeps the sidebar colour, its edge line and brand-tinted active items.

## Items

Items use the shared `NavItem` shape: `{ label, href?, icon?, badge?, badgeTone?, color?, isActive?, disabled?, external?, items?, onSelect? }`.

- `icon`: a semantic icon name (`"home"`) or any node.
- `badge`: a number (shown as a count, "99+" above 99, with "3 new" for screen readers) or any node. On an item with nested items the badge sits inside the button, before the chevron or the submenu toggle, so the two never overlap (LTR and RTL).
- `items`: nested items. A parent with an `href` gets a separate expand button; without one, the whole row toggles.
- **Active state**: the item matching `currentHref` gets `aria-current="page"`; its parent starts expanded, and expands when `currentHref` moves into it later. `match="prefix"` (default) keeps `/users` active on `/users/12/edit`; set `isActive` to override. Items whose `href` has a query string (`/users?status=active`) also match on its parameters.
- **Collapsed to icons**: labels become tooltips and nested items open in a flyout menu.
- On phones the drawer takes focus itself when it opens (so a filter or search field at the top doesn't bring up the keyboard; <kbd>Tab</kbd> moves into it) and closes after an item is chosen.

## Props

| Prop          | Type                                                          | Default     | Description                       |
| ------------- | ------------------------------------------------------------- | ----------- | --------------------------------- |
| `items`       | `NavItem[]`                                                   |             | Flat list (or use `groups`)       |
| `groups`      | `{ label?, items }[]`                                         |             | Labelled groups                   |
| `currentHref` | `string`                                                      |             | Current URL (path and query)  |
| `match`       | `'prefix' \| 'exact'`                                         | `'prefix'`  | How `currentHref` matches         |
| `header`      | `ReactNode`                                                   |             | Top area (logo, app switcher)     |
| `action`      | `ReactNode`                                                   |             | Full-width call to action under the header |
| `surface`     | `'shell' \| 'sidebar'`                                        | `'shell'` in a panel `AppLayout` | Proton shell or sidebar colour |
| `footer`      | `ReactNode`                                                   |             | Bottom area (user profile)        |
| `children`    | `ReactNode`                                                   |             | Extra content after the groups    |
| `rail`        | `boolean`                                                     | `true`      | Show the toggle rail              |
| `onNavigate`  | `(item) => void`                                              |             | Called after an item is activated |
| `navLabel`    | `string`                                                      | "Main"      | Accessible name of the navigation |
| `collapsible` | `'icon' \| 'offcanvas' \| 'none'`                             | `'icon'`    | Desktop collapse mode             |
| `side`        | `'start' \| 'end'`                                            | `'start'`   | Logical side                      |
| `variant`     | `'sidebar' \| 'floating' \| 'inset'`                          | `'sidebar'` | shadcn variant                    |
| `classNames`  | `{ header, action, content, footer, group, groupLabel, item, badge }` |             | Classes for each part             |

On the shell the sidebar reads the shell tokens (`--shell`, `--shell-foreground`, `--shell-hover`, `--shell-active`), falling back to Proton's warm greys (`#f5f4f2` light, `#16141c` dark). With `surface="sidebar"` the theme tokens are `--onu-sidebar`, `--onu-sidebar-foreground`, `--onu-sidebar-primary`, `--onu-sidebar-accent` and `--onu-sidebar-border`.

## Accessibility

| Key                                       | Action                           |
| ----------------------------------------- | -------------------------------- |
| <kbd>Tab</kbd>                            | Move between items               |
| <kbd>Enter</kbd> / <kbd>Space</kbd>       | Follow a link or expand a group  |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd> | Toggle the sidebar               |
| <kbd>Escape</kbd>                         | Close the phone drawer or flyout |

## RTL

`side="start"` puts the sidebar on the right in RTL; chevrons mirror and flyouts open towards the content.

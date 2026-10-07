---
title: AppLayout
sidebar_position: 1
---

The application shell: a **Skip to content** link, the sidebar, a header, the main content, an optional footer and an optional phone **bottom navigation**. It wraps shadcn's `SidebarProvider`, so the sidebar collapses to icons (or off-canvas) on desktop, becomes an off-canvas drawer below 768px, and sits on the inline start in RTL.

```tsx
import { AppHeader, AppLayout, AppSidebar, BottomNav, Logo, UserProfile } from "@javaabu/onu"

;<AppLayout
  sidebar={
    <AppSidebar
      groups={groups}
      currentHref={url}
      header={<Logo src="/logo.svg" alt="Onu" text="Onu" />}
      footer={<UserProfile name="Aishath Shifa" subtitle="Admin" onSignOut={signOut} />}
    />
  }
  header={<AppHeader sidebarTrigger actions={<NotificationCenter notifications={items} />} />}
  bottomNav={<BottomNav items={quickLinks} currentHref={url} />}
>
  {children}
</AppLayout>
```

With Inertia, pass `usePage().url` as `currentHref` and set `OnuProvider linkComponent={Link}` once.

## Layout

- `<main id="main-content" tabindex="-1">` holds the page. The skip link targets it, so keyboard users can jump past the navigation.
- With `bottomNav`, the main area gets extra bottom padding (plus the safe-area inset) on phones so nothing hides behind the bar.
- The sidebar state is stored in a cookie by shadcn (`sidebar_state`); read it on the server and pass `defaultSidebarOpen` to avoid a flash.

## Props

| Prop                  | Type                                        | Default          | Description                                          |
| --------------------- | ------------------------------------------- | ---------------- | ---------------------------------------------------- |
| `sidebar`             | `ReactNode`                                 |                  | Usually an `AppSidebar`                              |
| `header`              | `ReactNode`                                 |                  | Usually an `AppHeader` with `sidebarTrigger`         |
| `footer`              | `ReactNode`                                 |                  | Footer inside the content column                     |
| `bottomNav`           | `ReactNode`                                 |                  | Phone bottom navigation, usually a `BottomNav`       |
| `defaultSidebarOpen`  | `boolean`                                   | `true`           | Initial desktop sidebar state                        |
| `sidebarOpen`         | `boolean`                                   |                  | Controlled desktop sidebar state                     |
| `onSidebarOpenChange` | `(open: boolean) => void`                   |                  | Called when the sidebar opens or closes              |
| `skipLink`            | `boolean`                                   | `true`           | Render a skip link first                             |
| `mainId`              | `string`                                    | `"main-content"` | Id of `<main>` (the skip link target)                |
| `contentWidth`        | `'full' \| 'wide' \| 'default' \| 'narrow'` | `'full'`         | Maximum width of the content                         |
| `classNames`          | `{ body, main, content }`                   |                  | Classes for the content column, `<main>` and wrapper |
| `className`           | `string`                                    |                  | Classes for the root (`SidebarProvider` wrapper)     |

Other `<div>` props go to the root.

## Accessibility

- Landmarks: `banner` (header), `navigation` (sidebar, bottom nav), `main`, `contentinfo` (footer).
- The skip link is the first tab stop and moves focus to `<main>`.
- On phones the sidebar drawer traps focus, closes with <kbd>Escape</kbd> and returns focus to the toggle.

| Key                                       | Action                           |
| ----------------------------------------- | -------------------------------- |
| <kbd>Tab</kbd> (first)                    | Shows the "Skip to content" link |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd> | Toggle the sidebar               |
| <kbd>Escape</kbd>                         | Close the phone drawer           |

## RTL

Everything uses logical properties: the sidebar is on the right in RTL, and the sidebar toggle icon mirrors.

---
title: AppHeader
sidebar_position: 2
---

The top bar of an app or portal: an optional sidebar toggle, a logo, the main content (page title, breadcrumbs, navigation or search) and actions at the inline end. Sticky by default, with padding for the notch (`env(safe-area-inset-top)`).

```tsx
import { AppHeader, Logo, NotificationCenter, ThemeToggle, UserProfile } from "@javaabu/onu"

;<AppHeader
  sidebarTrigger
  logo={<Logo src="/logo.svg" alt="Onu" />}
  actions={
    <>
      <ThemeToggle />
      <NotificationCenter notifications={items} />
      <UserProfile compact name="Ahmed Ali" onSignOut={signOut} />
    </>
  }
>
  <Breadcrumbs items={crumbs} />
</AppHeader>
```

`sidebarTrigger` needs `AppLayout` (or a `SidebarProvider`) above it. On phones the toggle opens the sidebar drawer.

## Props

| Prop             | Type                                | Default     | Description                               |
| ---------------- | ----------------------------------- | ----------- | ----------------------------------------- |
| `logo`           | `ReactNode`                         |             | Start of the header                       |
| `children`       | `ReactNode`                         |             | Middle area (fills the remaining space)   |
| `actions`        | `ReactNode`                         |             | End of the header                         |
| `sidebarTrigger` | `boolean`                           | `false`     | Show the sidebar toggle                   |
| `variant`        | `'default' \| 'plain' \| 'primary'` | `'default'` | Bordered, borderless, or primary-coloured |
| `sticky`         | `boolean`                           | `true`      | Stick to the top while scrolling          |
| `classNames`     | `{ start, center, end, trigger }`   |             | Classes for each area                     |

`appHeaderVariants` is exported. The height is `--onu-header-height` (3.5rem). Other `<header>` props are passed through, including `ref`.

## Accessibility

- Rendered as `<header>`, the `banner` landmark when it is not inside `<main>`.
- The sidebar toggle has the translated label "Toggle sidebar" and is 44px on touch screens.

| Key                                       | Action             |
| ----------------------------------------- | ------------------ |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>B</kbd> | Toggle the sidebar |

## RTL

Start and end swap in RTL; the toggle icon mirrors.

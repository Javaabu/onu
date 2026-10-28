# AppLayout

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

## Panel (the default)

`variant="panel"` is Proton Mail's shell: the sidebar and the header sit on the **app shell colour** (a warm grey, `#f5f4f2` light and `#16141c` dark), and the page is a **white panel** with a 12px rounded top-start corner and a 1px shell line on its top and start edges (logical properties, so it mirrors in RTL; below 768px the panel fills the screen). Inside it, `AppHeader`, `AppSidebar`, `PageTitle` and `ListingPage` pick their shell looks by default: the header on the shell colour with a wide rounded search, Proton's sidebar, Ant's PageHeader band and the ProTable card.

- `background="layout"` gives the panel Ant's light layout grey (`#f5f5f5`, `#141414` dark) for dashboards made of cards.
- `breadcrumbs` (a `BreadcrumbsItem[]`) is the page's trail. A page header band shows it; pages without one show it above the content.
- `variant="flat"` is the previous look: the content fills the body, the header is bordered and the sidebar keeps its edge line.

The shell colours come from the semantic shell tokens (`--shell`, `--shell-foreground`, `--shell-border`, `--shell-field`, `--shell-hover`, `--shell-active`, `--shell-weak`) with Proton's values as fallbacks, so they follow a theme that defines them. See [Theming](../guides/theming.md).

## Layout

- `<main id="main-content" tabindex="-1">` holds the page (inside the panel, with the footer). The skip link targets it, so keyboard users can jump past the navigation.
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
| `variant`             | `'panel' \| 'flat'`                         | `'panel'`        | Content on a white panel against the shell, or flat  |
| `background`          | `'default' \| 'layout'`                     | `'default'`      | Panel background: the page colour or the layout grey |
| `breadcrumbs`         | `BreadcrumbsItem[]`                         |                  | The page's trail (shown by the page header band)     |
| `classNames`          | `{ body, panel, main, content, breadcrumbs }` |                | Classes for the content column, panel, `<main>`, wrapper and trail |
| `className`           | `string`                                    |                  | Classes for the root (`SidebarProvider` wrapper)     |

Other `<div>` props go to the root. `useAppLayout()` returns the surrounding layout's `variant` and `breadcrumbs` (or `null`), for components that adapt to the shell.

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

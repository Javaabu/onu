---
title: OverlayMenu
sidebar_position: 29
---

A full-screen overlay menu for portals, learning sites and kiosks. It renders in a portal (Radix Dialog), traps focus, closes with <kbd>Escape</kbd> or the close button and returns focus to the trigger. Items use [`SideNav`](./side-nav) at the large size (48px rows), and the content respects safe-area insets.

```tsx
import { Button, LanguageSwitcher, Logo, OverlayMenu } from "@javaabu/onu"

;<OverlayMenu
  currentHref={url}
  logo={<Logo src="/logo.svg" alt="Academy" />}
  items={[
    { label: "Home", href: "/", icon: "home" },
    { label: "Courses", href: "/courses", description: "48 courses" },
    { label: "Programmes", items: [{ label: "Diplomas", href: "/programmes/diplomas" }] },
  ]}
  footer={<LanguageSwitcher variant="toggle" />}
/>
```

## Props

| Prop                                    | Type                                         | Default     | Description                         |
| --------------------------------------- | -------------------------------------------- | ----------- | ----------------------------------- |
| `items` / `groups`                      | `NavItem[]` / `NavGroup[]`                   |             | Navigation                          |
| `currentHref`                           | `string`                                     |             | Current URL path                    |
| `match`                                 | `'prefix' \| 'exact'`                        | `'prefix'`  | How `currentHref` matches           |
| `open` / `defaultOpen` / `onOpenChange` | `boolean` / callback                         |             | Controlled or uncontrolled          |
| `trigger`                               | `ReactNode`                                  | menu button | Custom trigger (rendered `asChild`) |
| `logo`                                  | `ReactNode`                                  |             | Top start of the overlay            |
| `footer`                                | `ReactNode`                                  |             | Under the navigation                |
| `title`                                 | `string`                                     | "Menu"      | Accessible dialog title             |
| `classNames`                            | `{ trigger, overlay, content, nav, footer }` |             | Classes for each part               |

The overlay closes after an item is chosen.

## Accessibility

- A modal dialog named "Menu" with the navigation inside; focus is trapped and restored.
- The close button is named "Close menu" and is 44px.

| Key               | Action                          |
| ----------------- | ------------------------------- |
| <kbd>Tab</kbd>    | Move between items (wraps)      |
| <kbd>Escape</kbd> | Close and return to the trigger |

Animations are disabled under `prefers-reduced-motion`.

## RTL

The close button sits at the inline end; nested items indent from the inline start.

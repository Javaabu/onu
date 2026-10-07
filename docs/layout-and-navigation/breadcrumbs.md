---
title: Breadcrumbs
sidebar_position: 11
---

A breadcrumb trail built on shadcn's `breadcrumb` ([§25.8](../requirements)): every part is a link except the last, which is the current page. On phones the middle parts collapse into a "…" menu, keeping the first and last; `maxItems` collapses on wider screens too. The chevron separators mirror in RTL.

```tsx
import { Breadcrumbs } from "@javaabu/onu"

;<Breadcrumbs
  items={[{ label: "Home", href: "/", icon: "home" }, { label: "Users", href: "/users" }, { label: "Jane Doe" }]}
/>
```

Links render through `OnuProvider linkComponent` (R16.2).

## Props

| Prop               | Type                                          | Default | Description                                  |
| ------------------ | --------------------------------------------- | ------- | -------------------------------------------- |
| `items`            | `{ label, href?, icon? }[]`                   |         | Trail; the last item is the current page     |
| `maxItems`         | `number`                                      |         | Collapse when there are more items than this |
| `collapseOnMobile` | `boolean`                                     | `true`  | Collapse to first › … › last below 768px     |
| `separator`        | `ReactNode`                                   | chevron | Custom separator                             |
| `classNames`       | `{ list, item, link, page, separator, menu }` |         | Classes for each part                        |

Other `<nav>` props are passed through.

## Behaviour (§25.8)

- Every part is a link except the last, which has `aria-current="page"`.
- Hidden parts are links in the "…" menu.
- Separators are directional icons, so they point left in RTL.

## Accessibility

- A `navigation` landmark named "Breadcrumb"; separators are hidden from screen readers.
- The "…" button is named "Show hidden pages"; the menu returns focus to it when closed.

| Key                         | Action             |
| --------------------------- | ------------------ |
| <kbd>Tab</kbd>              | Move between links |
| <kbd>Enter</kbd>            | Open the "…" menu  |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move in the menu   |
| <kbd>Escape</kbd>           | Close the menu     |

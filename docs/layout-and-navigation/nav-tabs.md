# NavTabs

Link-based tabs for record pages ([§25.8](../requirements.md)): "Profile", "Edit", "Activity (12)". Each tab opens its own page, the current one is highlighted, and the row scrolls sideways on phones (the current tab is scrolled into view). Links render through `OnuProvider linkComponent` (R16.2).

```tsx
import { NavTabs } from "@javaabu/onu"

;<NavTabs
  currentHref={url}
  items={[
    { label: "Profile", href: `/users/${id}` },
    { label: "Edit", href: `/users/${id}/edit` },
    { label: "Activity", href: `/users/${id}/activity`, count: 12 },
  ]}
/>
```

On a **create** page ([§25.9](../requirements.md)) mark the tabs that need a saved record as `disabled`: they are greyed out and not links.

## Props

| Prop          | Type                                                             | Default    | Description                                  |
| ------------- | ---------------------------------------------------------------- | ---------- | -------------------------------------------- |
| `items`       | `{ label, href, count?, icon?, badge?, disabled?, isActive? }[]` |            | Tabs                                         |
| `currentHref` | `string`                                                         |            | Current URL (path and query)             |
| `match`       | `'exact' \| 'prefix'`                                            | `'exact'`  | `prefix` keeps a tab active on its sub-pages |
| `variant`     | `'line' \| 'pill'`                                               | `'line'`   | Ant line tabs (brand colour and a 2px ink bar on the current tab, 32px apart) or pills |
| `aria-label`  | `string`                                                         | "Sections" | Landmark name                                |
| `classNames`  | `{ list, item, count }`                                          |            | Classes for each part                        |

`navTabsVariants` is exported.

## Behaviour (§25.8)

- Each tab is a link to its own page.
- The tab matching `currentHref` is highlighted and has `aria-current="page"`.
- Matching uses the path, and the query string when a tab's `href` has one, so tabs that differ only by a parameter (`?tab=documents`, `?tab=history`) highlight one at a time. The tab sharing the most parameters with `currentHref` wins (extra parameters such as `page` are ignored); on a bare URL with none of the tabs' parameters, the first such tab is the default. Hash-router hrefs (`#/records/7?tab=history`) work too.
- Counts show as "Activity (12)", formatted with the active locale.

## Accessibility

NavTabs is a `nav` with links and `aria-current`, not an ARIA `tablist`: each tab navigates to a new page, so the links pattern is the correct one. Tabs are 44px tall on touch screens.

| Key              | Action            |
| ---------------- | ----------------- |
| <kbd>Tab</kbd>   | Move between tabs |
| <kbd>Enter</kbd> | Open the tab      |

## RTL

Tabs run right to left in RTL and the row scrolls in the reading direction.

---
title: Tabs
sidebar_position: 14
---

shadcn's `Tabs` (Radix, WAI-ARIA tabs), extended with an `items` API, icons, counts, badges, a tab list that scrolls sideways on phones and a settings-style vertical layout. Without `items` it is the shadcn component, so `TabsList`, `TabsTrigger` and `TabsContent` compose as before. The original stays available from `@javaabu/onu/primitives`.

```tsx
import { Tabs } from "@javaabu/onu"

;<Tabs
  listLabel="Member"
  items={[
    { value: "details", label: "Details", icon: "info", content: <Details /> },
    { value: "documents", label: "Documents", count: 4, content: <Documents /> },
    { value: "history", label: "History", count: 128, content: <History /> },
  ]}
/>
```

Use [`NavTabs`](./nav-tabs) when each tab is its own page.

## Filter tabs above a listing

Status tabs that filter a list rather than show panels: "All 312 · Active 280 · Banned 32". Leave out `content`, so the tabs have no panels, and pass the listing's id as `controls`: each tab points `aria-controls` at the listing instead of a panel. `countAppearance="pill"` shows counts as grey pills that turn to the brand colour on the active tab, and `variant="line"` gives Ant Design's line tabs: 32px apart over a hairline that spans the row, brand-coloured text and a 2px ink bar on the active tab. On narrow screens the row scrolls sideways.

```tsx
<Tabs
  variant="line"
  countAppearance="pill"
  listLabel="Filter by status"
  controls="users-table"
  value={(state.filters.status as string) ?? "all"}
  onValueChange={(v) => state.setFilter("status", v === "all" ? undefined : v)}
  items={[
    { value: "all", label: "All", count: 312 },
    { value: "active", label: "Active", count: 280 },
    { value: "banned", label: "Banned", count: 32 },
    { value: "pending", label: "Pending", disabled: true },
  ]}
/>
<UsersTable id="users-table" />
```

[`ListingPage`](../listing-pages/listing-page) does this for you with its `tabs` prop (the list is named "Filter by status", translated). In a [`PageTitle`](./page-title) `tabs` row, the tabs sit on the band's bottom edge.

## Vertical tabs with a narrow fallback

For settings-style pages, `orientation="vertical"` with `narrow` puts the tab list at the inline start with the panel beside it. In narrow containers (below about 42rem, a container query) the list becomes a native **select** (`narrow="select"`) or a horizontally scrolling row (`narrow="scroll"`). Items can carry a `description` (shown beside the panel, hidden in the narrow row) and a `badge`. Without `narrow`, a vertical list stays as it is at every width.

```tsx
<Tabs
  orientation="vertical"
  narrow="select"
  items={[
    { value: "general", label: "General", icon: "settings", description: "Name and logo", content: <General /> },
    { value: "members", label: "Members", icon: "users", badge: 3, content: <Members /> },
    { value: "billing", label: "Billing", icon: "credit-card", content: <Billing /> },
  ]}
/>
```

Use `textLabel` when `label` is not plain text, so the select has an option label. The list and the select are named by `listLabel` (default "Choose a section"). `variant` and `scrollable` do not apply in this layout.

## Props

| Prop              | Type                                        | Default        | Description                                                                    |
| ----------------- | ------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `items`           | `TabItem[]`                                 |                | Data-driven tabs                                                               |
| `value`           | `string`                                    |                | Controlled value                                                               |
| `defaultValue`    | `string`                                    | first enabled  | Initial value                                                                  |
| `onValueChange`   | `(value: string) => void`                   |                | Called on change                                                               |
| `variant`         | `'default' \| 'line'`                       | `'default'`    | Tab list style                                                                 |
| `orientation`     | `'horizontal' \| 'vertical'`                | `'horizontal'` | Layout and arrow keys                                                          |
| `scrollable`      | `boolean`                                   | `true`         | Let the list scroll when it does not fit                                       |
| `narrow`          | `'select' \| 'scroll'`                      |                | Vertical only: settings layout, and what the list becomes in narrow containers |
| `listLabel`       | `string`                                    |                | Accessible name of the tab list                                                |
| `controls`        | `string`                                    |                | Id of what the tabs filter: tabs without `content` set it as `aria-controls`   |
| `countAppearance` | `'text' \| 'pill'`                          | `'text'`       | Counts as "(12)" or as a pill                                                  |
| `classNames`      | `{ list, trigger, content, count, select }` |                | Classes for each part                                                          |

`TabItem`: `{ value, label, textLabel?, description?, icon?, count?, badge?, disabled?, content? }`. `description` shows in vertical tabs; a numeric `badge` reads as "3 new". An item without `content` has no panel.

Counts are formatted with the active locale ("Activity (12)"). Other Radix `Tabs.Root` props are passed through.

## Accessibility

| Key                              | Action                                |
| -------------------------------- | ------------------------------------- |
| <kbd>←</kbd> / <kbd>→</kbd>      | Previous / next tab (mirrored in RTL) |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Previous / next tab (vertical)        |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last tab                      |
| <kbd>Tab</kbd>                   | Into the panel                        |

Screen readers announce the selected tab (§25.10). Counts are part of each tab's name ("Active (280)"), pills included.

Filter tabs (items without `content`) render no `tabpanel`, so no tab points at a panel that does not exist: with `controls`, `aria-controls` names the listing they filter, and without it the attribute is left out. Give filter tabs a `listLabel` such as "Filter by status".

With `narrow`, the list is a `tablist` with `aria-orientation="vertical"`, and the narrow-screen select is labelled for screen readers. Triggers and the select are 44px tall on touch screens. In `narrow="scroll"` the row is horizontal but keeps vertical arrow keys.

## RTL

Direction comes from `OnuProvider`, so in RTL <kbd>←</kbd> moves to the next tab (R11.5). With `narrow`, the list sits on the right in RTL.

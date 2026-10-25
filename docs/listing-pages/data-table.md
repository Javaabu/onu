---
title: DataTable
sidebar_position: 3
---

The listing table, built on [TanStack Table](https://tanstack.com/table) v9 (column model, visibility and selection) and shadcn's `Table`. It implements the table parts of REQUIREMENTS §25.6: sortable headers, row checkboxes with a select-all-on-this-page box, the [bulk action bar](bulk-actions), [⋯ row menus](../overlays/action-menu#row-actions), [empty states](empty-state), the trash view, labelled cards on phones and the [pagination](pagination) footer.

```tsx
import { DataTable, useListingState, type DataTableColumn } from "@javaabu/onu"

const columns: DataTableColumn<User>[] = [
  { id: "name", header: "Name", sortable: true, primary: true },
  { id: "email", header: "Email", sortable: true },
  { id: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} /> },
  { id: "balance", header: "Balance", numeric: true, sortable: true, cell: (u) => mvr.format(u.balance) },
]

const state = useListingState()
;<DataTable
  columns={columns}
  data={page.data}
  total={page.meta.total}
  state={state}
  noun={{ one: "user", other: "users" }}
/>
```

The table always shows the rows it is given (it never sorts or pages by itself): fetch the page from your server with `state.toSearchParams()`, or use `applyListingState` for in-memory data.

## Behaviour

- **Sorting**: clicking a sortable header sorts ascending and shows an arrow; clicking again reverses; another header starts ascending. Headers expose `aria-sort` and the change is announced ("Sorted by Name, ascending").
- **Selection**: row checkboxes; the header checkbox selects or clears every row on this page and shows a dash when only some are selected. As soon as a row is selected the bulk bar appears.
- **Row actions**: `rowActions(row)` lists the ⋯ menu; only `permitted` actions show; destructive ones confirm ("Delete Jane Doe?").
- **Opening a record**: `getRowHref` makes the primary column a link (through `OnuProvider linkComponent`) and clicking the row follows it; or use `onRowClick`.
- **Empty states**: "No users yet" with `emptyAction`, or "No users match your search" naming the search and filters with Clear search / Clear filters.
- **Trash**: `trash` removes checkboxes and the bulk bar; use `trashActions(t, { onRestore, onForceDelete })` for the ⋯ menu.
- **Look**: Ant Design's table: a grey (`--muted`, #fafafa) header with semibold labels and short split lines between header cells, 12px 16px cells (`density="compact"` gives 8px, `comfortable` 16px), hairline row dividers, a #fafafa hover and selected rows in the brand's lightest step (`--primary-1`). The table has no outer frame; put it in a [Card](../layout-and-navigation/card) for one. Sort arrows are grey, and brand-coloured on the sorted column.
- **Phones**: below 768px (or `layout="cards"`) each row becomes a card with every value labelled by its column; a Sort by menu replaces the headers and a Select all checkbox sits above the cards.

## Props

| Prop                                 | Type                                                            | Default               | Description                                           |
| ------------------------------------ | --------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| `columns`                            | `DataTableColumn<T>[]`                                          |                       | Column definitions (below)                            |
| `data`                               | `T[]`                                                           |                       | Rows of the current page                              |
| `getRowId`                           | `(row) => string`                                               | `row.id`              | Stable id                                             |
| `getRowName`                         | `(row) => string`                                               | primary column        | Name used in "Select …" and "Delete …?"               |
| `state`                              | `ListingController`                                             | internal (no URL)     | From `useListingState()`                              |
| `total`                              | `number`                                                        |                       | Total rows; shows the pagination footer               |
| `pagination`                         | `boolean`                                                       | `total !== undefined` | Show the footer                                       |
| `perPageOptions`                     | `number[]`                                                      | `[10, 25, 50, 100]`   | Rows-per-page choices                                 |
| `noun`                               | `{ one, other }`                                                | records               | What is listed                                        |
| `selectable`                         | `boolean`                                                       | with bulk actions     | Show checkboxes                                       |
| `bulkActions`                        | `BulkAction[]`                                                  |                       | See [Bulk actions](bulk-actions)                      |
| `onBulkSuccess`                      | `(message) => void`                                             |                       | After a bulk action succeeds                          |
| `rowActions`                         | `(row) => RecordAction[]`                                       |                       | ⋯ menu items                                          |
| `getRowHref`                         | `(row) => string \| undefined`                                  |                       | Record URL                                            |
| `onRowClick`                         | `(row) => void`                                                 |                       | Called when a row is clicked                          |
| `loading`                            | `boolean`                                                       |                       | Skeleton rows, `aria-busy`                            |
| `trash`                              | `boolean`                                                       |                       | Trash view                                            |
| `emptyAction`/`empty`                | `ReactNode`                                                     |                       | Main action for, or a replacement of, the empty state |
| `filters`                            | `FilterDefinition[]`                                            |                       | To name active filters in the no-results state        |
| `layout`                             | `"auto" \| "table" \| "cards"`                                  | `"auto"`              | Cards below 768px                                     |
| `caption`                            | `string`                                                        |                       | Accessible name                                       |
| `striped`, `stickyHeader`, `density` | `boolean`, `boolean`, `"compact" \| "default" \| "comfortable"` |                       | Variants (`dataTableVariants`)                        |
| `classNames`                         | `{ table, header, row, cell, cards, card, footer, toolbar }`    |                       | Classes for each part                                 |

`DataTableColumn<T>`: `id`, `header` (text), `headerContent?`, `accessor?` (key or function), `cell?`, `sortable?`, `hideable?`, `primary?`, `align?`, `numeric?` (tabular figures, end-aligned), `hideOnCards?`, `className?`, `headerClassName?`.

## Accessibility

| Key                                 | Action                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| <kbd>Tab</kbd>                      | Moves through header buttons, checkboxes, links and ⋯ menus |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Sorts by a header, ticks a checkbox, opens a menu           |
| <kbd>Escape</kbd>                   | Closes a ⋯ menu and returns focus to it                     |

The header checkbox reports `aria-checked="mixed"` when some rows are selected. Selected rows have `aria-selected`. Sort changes and the selected count are announced. Each checkbox is a 24×24px target (WCAG 2.5.8) with the 16px box drawn inside, so it never crowds a sortable first column; on touch screens the hit area grows to 44px.

## RTL

Columns, checkboxes and menus mirror in RTL; numeric columns stay end-aligned. Pass a Dhivehi `noun` for the built-in sentences.

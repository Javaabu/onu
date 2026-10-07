---
title: ListingPage
sidebar_position: 1
---

A complete index page, laid out as REQUIREMENTS §25.6 describes: a header with the title, the main action and secondary links (Trash, with a dot when it isn't empty), status tabs, a toolbar with the [search box](search-box), [Filters](filter-panel), [Columns](column-visibility) and [Export](export-menu), the [filter pills](active-filter-chips), the [table](data-table) with bulk actions and row menus, and [pagination](pagination).

```tsx
import { applyListingState, Button, ListingPage, useListingState } from "@javaabu/onu"

function Users({ users }: { users: User[] }) {
  const state = useListingState() // search, filters, sort and page live in the URL
  const { rows, total } = applyListingState(users, state) // or fetch from your API

  return (
    <ListingPage
      title="Users"
      state={state}
      columns={columns}
      data={rows}
      total={total}
      noun={{ one: "user", other: "users" }}
      filters={filters}
      primaryAction={<Button>New user</Button>}
      trashHref="/users/trash"
      trashHasItems
      bulkActions={[{ id: "delete", label: "Delete", destructive: true, run: (ids) => api.delete(ids) }]}
      rowActions={(user) => [
        { id: "view", label: "View", href: `/users/${user.id}` },
        { id: "edit", label: "Edit", href: `/users/${user.id}/edit`, permitted: user.can.update },
        { id: "delete", label: "Delete", destructive: true, onSelect: () => api.delete([user.id]) },
      ]}
      getRowHref={(user) => `/users/${user.id}`}
      onExport={(format) => download(`/users/export?format=${format}&${state.toSearchParams()}`)}
    />
  )
}
```

With a server, call your API with `state.toSearchParams()` (Laravel / spatie-query-builder names: `search`, `sort=-created_at`, `page`, `per_page`, `filter[status][]=active`) and pass the page of rows and the total. The table, pills and empty states follow the same state.

## Other views

Pass `children` to replace the table, e.g. with a [`ListView`](list-view) or [`GridView`](grid-view) chosen by a [`ViewSwitcher`](view-switcher) in `toolbarEnd`. The page keeps the pagination footer (from `total`, `pagination`, `perPageOptions` and `noun`) below your view, and adds a **Sort by** menu to the toolbar for the `columns` marked `sortable`, since a list or grid has no sortable headers:

```tsx
<ListingPage {...props} toolbarEnd={<ViewSwitcher value={state.view ?? "table"} onValueChange={state.setView} />}>
  {state.view === "grid" ? <GridView items={rows} title={(u) => u.name} /> : undefined}
</ListingPage>
```

## Props

All [`DataTable`](data-table) props, plus:

| Prop                          | Type                                             | Default             | Description                                                |
| ----------------------------- | ------------------------------------------------ | ------------------- | ---------------------------------------------------------- |
| `title`                       | `ReactNode`                                      |                     | Page heading (`h1`)                                        |
| `description`                 | `ReactNode`                                      |                     | Text under the title                                       |
| `primaryAction`               | `ReactNode`                                      |                     | Main action; also shown in the "no records" empty state    |
| `links`                       | `{ label, href, icon?, dot?, dotLabel? }[]`      |                     | Secondary links next to the title                          |
| `trashHref` / `trashHasItems` | `string` / `boolean`                             |                     | Adds a Trash link, with a dot when it isn't empty          |
| `state`                       | `ListingController`                              | `useListingState()` | Listing state (see [`useListingState`](use-listing-state)) |
| `filters`                     | `FilterDefinition[]`                             | `[]`                | Filters for the panel and pills                            |
| `searchable`                  | `boolean`                                        | `true`              | Show the search box                                        |
| `searchPlaceholder`           | `string`                                         |                     | Placeholder of the search box                              |
| `searchThaana`                | `boolean \| ThaanaOptions`                       |                     | Type Thaana in the search box                              |
| `onExport` / `exportOptions`  | `(format) => void \| Promise` / `ExportOption[]` |                     | Show the Export menu                                       |
| `columnToggle`                | `boolean`                                        | `false`             | Show the Columns menu                                      |
| `tabs` / `tabsFilterKey`      | `FilterTab[]` / `string`                         | – / `"status"`      | Status tabs that set one filter                            |
| `toolbarEnd`                  | `ReactNode`                                      |                     | Extra toolbar content                                      |
| `children`                    | `ReactNode`                                      |                     | Replaces the table; pagination and Sort by stay            |

## Accessibility

- The page is a `section` named by its `h1`. The search box is a `search` landmark.
- The Trash dot has screen reader text ("Trash has items").
- Everything below follows the components it is built from; see their pages for keyboard support.

## RTL and Dhivehi

Everything mirrors in RTL. Pass `searchThaana` for Thaana search, and Dhivehi nouns (`{ one: "މީހާ", other: "މީހުން" }`) for the built-in sentences.

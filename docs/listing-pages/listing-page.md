---
title: ListingPage
sidebar_position: 1
---

A complete index page, laid out as REQUIREMENTS §25.6 describes: a header with the title, the main action and secondary links (Trash, with a dot when it isn't empty), [status tabs](../layout-and-navigation/tabs#filter-tabs-above-a-listing), a toolbar with the [search box](search-box), [Filters](filter-panel), [Columns](column-visibility) and [Export](export-menu), the [filter pills](active-filter-chips), the [table](data-table) with bulk actions and row menus, and [pagination](pagination).

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

Without a server export, `onExport={(format) => exportRows({ format, rows, columns, filename: "users" })}` builds CSV, Excel or PDF in the browser; see [`exportRows`](export-rows).

With a server, call your API with `state.toSearchParams()` (Laravel / spatie-query-builder names: `search`, `sort=-created_at`, `page`, `per_page`, `filter[status][]=active`) and pass the page of rows and the total. The table, pills and empty states follow the same state.

## Card layout (Ant ProTable)

`variant="card"` (the default inside a panel [`AppLayout`](../layout-and-navigation/app-layout)) lays the page out like Ant Design Pro's ProTable:

- the header is [`PageTitle`](../layout-and-navigation/page-title)'s **PageHeader band**: breadcrumbs (`breadcrumbs`, or the layout's), the title with `tags`, the links as outlined buttons and the main action at the end, the description with key `figures`, and the status `tabs` as line tabs with an ink bar;
- an optional **query form** card: `queryFilters` shows those filters inline ([`FilterPanel variant="form"`](filter-panel#query-form)), labelled fields in a grid with **Reset**, **Filter** and **Expand**, while the Filters button keeps the rest of `filters`; or pass your own `queryForm`;
- the list in a **table card**: a toolbar row with the `tableTitle` and the search at the start and Filters, Columns, Sort by, Export and `toolbarEnd` at the end, the filter pills, then the table (flush in the card) or your view, and the pagination.

```tsx
<ListingPage
  title="Applications"
  tableTitle="Application list"
  filters={filters}
  queryFilters={filters.filter((f) => ["service", "island", "assignee", "email"].includes(f.key))}
  figures={[{ label: "In review", value: 34 }]}
  tabs={tabs}
  {...tableProps}
/>
```

`variant="default"` (the default elsewhere) keeps the header, toolbar and table stacked on the page. Every other prop works the same in both.

## Other views

Pass `children` to replace the table, e.g. with a [`ListView`](list-view) (as a list or a [grid](list-view#grid-layout)) chosen by a [view switcher](../choice-inputs/segmented-control#view-switcher) (a `SegmentedControl` of `useListingViewOptions()`) in `toolbarEnd`. The page keeps the pagination footer (from `total`, `pagination`, `perPageOptions` and `noun`) below your view, and adds a **Sort by** menu to the toolbar for the `columns` marked `sortable`, since a list or grid has no sortable headers:

```tsx
const { t } = useTranslation()
const views = useListingViewOptions(["table", "list", "grid"])

<ListingPage
  {...props}
  toolbarEnd={
    <SegmentedControl
      iconOnly
      size="sm"
      aria-label={t("listing.view")}
      options={views}
      value={state.view ?? "table"}
      onValueChange={state.setView}
    />
  }
>
  {state.view === "grid" ? <ListView layout="grid" items={rows} title={(u) => u.name} /> : undefined}
</ListingPage>
```

## Props

All [`DataTable`](data-table) props, plus:

| Prop                          | Type                                             | Default                         | Description                                                                                  |
| ----------------------------- | ------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `title`                       | `ReactNode`                                      |                                 | Page heading (`h1`)                                                                          |
| `description`                 | `ReactNode`                                      |                                 | Text under the title                                                                         |
| `primaryAction`               | `ReactNode`                                      |                                 | Main action; also shown in the "no records" empty state                                      |
| `links`                       | `{ label, href, icon?, dot?, dotLabel? }[]`      |                                 | Secondary links next to the title                                                            |
| `trashHref` / `trashHasItems` | `string` / `boolean`                             |                                 | Adds a Trash link, with a dot when it isn't empty                                            |
| `state`                       | `ListingController`                              | `useListingState()`             | Listing state (see [`useListingState`](use-listing-state))                                   |
| `filters`                     | `FilterDefinition[]`                             | `[]`                            | Filters for the panel and pills                                                              |
| `searchable`                  | `boolean`                                        | `true`                          | Show the search box                                                                          |
| `searchPlaceholder`           | `string`                                         |                                 | Placeholder of the search box                                                                |
| `searchThaana`                | `boolean \| ThaanaOptions`                       |                                 | Type Thaana in the search box                                                                |
| `onExport` / `exportOptions`  | `(format) => void \| Promise` / `ExportOption[]` |                                 | Show the Export menu                                                                         |
| `columnToggle`                | `boolean`                                        | `false`                         | Show the Columns menu                                                                        |
| `tabs` / `tabsFilterKey`      | `TabItem[]` / `string`                           | – / `"status"`                  | [Status tabs](../layout-and-navigation/tabs#filter-tabs-above-a-listing) that set one filter |
| `toolbarEnd`                  | `ReactNode`                                      |                                 | Extra toolbar content                                                                        |
| `variant`                     | `"card" \| "default"`                            | `"card"` in a panel `AppLayout` | ProTable card layout or stacked                                                              |
| `tableTitle`                  | `ReactNode`                                      |                                 | Card layout: title at the start of the table card                                            |
| `queryFilters`                | `FilterDefinition[]`                             |                                 | Card layout: filters in an inline query form                                                 |
| `queryForm`                   | `ReactNode`                                      |                                 | Card layout: a custom form above the table card                                              |
| `breadcrumbs`                 | `BreadcrumbsItem[]`                              | the layout's                    | Card layout: breadcrumbs in the header band                                                  |
| `tags` / `figures`            | `ReactNode` / `{ label, value }[]`               |                                 | Card layout: tags after the title, key figures                                               |
| `children`                    | `ReactNode`                                      |                                 | Replaces the table; pagination and Sort by stay                                              |

## Accessibility

- The page is a `section` named by its `h1`. The search box is a `search` landmark.
- The Trash dot has screen reader text ("Trash has items").
- Everything below follows the components it is built from; see their pages for keyboard support.

## RTL and Dhivehi

Everything mirrors in RTL. Pass `searchThaana` for Thaana search, and Dhivehi nouns (`{ one: "މީހާ", other: "މީހުން" }`) for the built-in sentences.

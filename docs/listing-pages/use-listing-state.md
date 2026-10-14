---
title: useListingState
sidebar_position: 2
reference: hook
---

State for an index page — search, sort, page, rows per page, filters, view, selection and column visibility — with the rules from REQUIREMENTS §25.6 built in:

- searching, filtering, sorting and changing rows-per-page go back to page 1;
- paging, searching, filtering and sorting clear the selection;
- sorting a column starts ascending, the same column flips the direction, another column starts ascending again;
- search, filters, sort, page, rows-per-page and view are kept in the address bar with `history.replaceState`, so reloading or sharing the link shows the same view, and Back leaves the page instead of undoing each change.

```tsx
import { useListingState } from "@javaabu/onu"

const state = useListingState({ defaultState: { perPage: 25, sort: { id: "created_at", desc: true } } })

const { data } = useQuery({
  queryKey: ["users", state.toSearchParams().toString()],
  queryFn: () => fetch(`/api/users?${state.toSearchParams()}`).then((r) => r.json()),
})
```

## URL format

Laravel / spatie-query-builder style: `?search=jane&sort=-name&page=2&per_page=50&filter[status][]=active&filter[created][from]=2026-03-01&view=grid`. Defaults are left out: page 1, and any search, sort, rows-per-page, view or filters equal to `defaultState` (so a default `sort: { id: "submitted", desc: true }` never shows as `?sort=-submitted`). Clearing a non-empty default writes an empty parameter (`sort=`, `filter[status]=`) so a reload keeps it cleared. `toSearchParams()` is for your API, so it always includes the sort, filters and `per_page`. Use `paramPrefix` when a page has more than one listing, `paramNames` to rename parameters, and `url: false` to keep the state out of the URL.

## Options

| Option                    | Type                         | Default | Description                                                  |
| ------------------------- | ---------------------------- | ------- | ------------------------------------------------------------ |
| `defaultState`            | `Partial<ListingState>`      |         | Starting state; URL values win                               |
| `url`                     | `boolean`                    | `true`  | Mirror the state in the URL with `replaceState`              |
| `paramPrefix`             | `string`                     | `""`    | Prefix for every URL parameter                               |
| `paramNames`              | `Partial<ListingParamNames>` |         | Rename `search`, `sort`, `page`, `perPage`, `filter`, `view` |
| `onChange`                | `(state) => void`            |         | Called after each change (not on mount)                      |
| `defaultSelection`        | `string[]`                   | `[]`    | Selected row ids (never in the URL)                          |
| `defaultColumnVisibility` | `Record<string, boolean>`    | `{}`    | `{ email: false }` hides a column                            |

## Returned controller

| Field                                                     | Type                                                       | Description                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `search`, `page`, `perPage`                               | `string`, `number`, `number`                               | `page` is 1-based                                                |
| `sort`                                                    | `{ id, desc? } \| null`                                    |                                                                  |
| `filters`                                                 | `FilterValues`                                             | Applied filters, by key                                          |
| `view`                                                    | `string \| undefined`                                      | `table`, `list`, `grid`, `kanban`, …                             |
| `selection` / `columnVisibility`                          | `string[]` / `Record<string, boolean>`                     |                                                                  |
| `activeFilterCount` / `isFiltered`                        | `number` / `boolean`                                       | Badge count; whether a search or filter is applied               |
| `setSearch`, `clearSearch`                                | `(search) => void`, `() => void`                           | Back to page 1, clears the selection                             |
| `toggleSort` / `setSort`                                  | `(id) => void` / `(sort \| null) => void`                  | Same column flips; a new column starts ascending; back to page 1 |
| `setPage`, `setPerPage`                                   | `(n) => void`                                              | Paging clears the selection; `setPerPage` goes back to page 1    |
| `setFilters`, `setFilter`, `removeFilter`, `clearFilters` | replace all / `(key, value \| undefined)` / `(key)` / `()` | Back to page 1, clears the selection                             |
| `setView`                                                 | `(view) => void`                                           |                                                                  |
| `setSelection`, `toggleSelected`, `clearSelection`        | `(ids)` / `(id, selected?)` / `()`                         |                                                                  |
| `setColumnVisibility`                                     | `(visibility) => void`                                     |                                                                  |
| `reset`                                                   | `() => void`                                               | Back to `defaultState`                                           |
| `toSearchParams`                                          | `() => URLSearchParams`                                    | For your API: always includes sort, filters and `per_page`       |

## Helpers

- `applyListingState(rows, state, { searchFields?, filterFns?, sortValue?, locale? })` searches, filters, sorts (with `Intl.Collator`, so Thaana sorts correctly) and pages an in-memory array. Returns `{ rows, total }`.
- `listingStateToSearchParams(state)` / `parseListingSearchParams(params)` convert to and from URL parameters.
- `isFilterValueEmpty(value)` and `cleanFilters(filters)`.

Filter values are strings, string arrays (multi-select) or `{ field?, from?, to? }` date ranges with `yyyy-MM-dd` dates. Yes/No filters use `"1"` / `"0"`; the deleted-records filter uses `"with"` / `"only"` (absent means hide), like Laravel's `withTrashed` / `onlyTrashed`.

## Accessibility

The hook renders nothing; the listing components you pass it to announce its changes. [`DataTable`](./data-table) announces a new sort ("Sorted by Name, ascending") and [`Pagination`](./pagination)'s "Showing 26–50 of 312" summary is a polite live region, so paging, searching and filtering are heard without moving focus. State changes never move focus themselves.

Because the URL is updated with `history.replaceState`, Back leaves the listing instead of stepping through every keystroke and filter change, which is what keyboard and screen-reader users expect from Back. Reloading or sharing the link restores the same view.

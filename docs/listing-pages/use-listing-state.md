---
title: useListingState
sidebar_position: 2
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

Laravel / spatie-query-builder style: `?search=jane&sort=-name&page=2&per_page=50&filter[status][]=active&filter[created][from]=2026-03-01&view=grid`. Defaults (page 1, the default rows-per-page and view) are left out. Use `paramPrefix` when a page has more than one listing, `paramNames` to rename parameters, and `url: false` to keep the state out of the URL.

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

The state (`search`, `sort`, `page`, `perPage`, `filters`, `view`, `selection`, `columnVisibility`, `activeFilterCount`, `isFiltered`) and these actions: `setSearch`, `clearSearch`, `toggleSort`, `setSort`, `setPage`, `setPerPage`, `setFilters`, `setFilter`, `removeFilter`, `clearFilters`, `setView`, `setSelection`, `toggleSelected`, `clearSelection`, `setColumnVisibility`, `reset` and `toSearchParams()`.

## Helpers

- `applyListingState(rows, state, { searchFields?, filterFns?, sortValue?, locale? })` searches, filters, sorts (with `Intl.Collator`, so Thaana sorts correctly) and pages an in-memory array. Returns `{ rows, total }`.
- `listingStateToSearchParams(state)` / `parseListingSearchParams(params)` convert to and from URL parameters.
- `isFilterValueEmpty(value)` and `cleanFilters(filters)`.

Filter values are strings, string arrays (multi-select) or `{ field?, from?, to? }` date ranges with `yyyy-MM-dd` dates. Yes/No filters use `"1"` / `"0"`; the deleted-records filter uses `"with"` / `"only"` (absent means hide), like Laravel's `withTrashed` / `onlyTrashed`.

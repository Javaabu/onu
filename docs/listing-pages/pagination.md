---
title: Pagination
sidebar_position: 7
---

Pagination for listings: "Showing 26–50 of 312 users", a rows-per-page select (10 / 25 / 50 / 100) and **Previous / Next**, with optional numbered pages that collapse to "Page 2 of 13" in narrow containers. It reads Laravel paginators and API resource collections directly (R16.4).

```tsx
import { Pagination } from "@javaabu/onu"

<Pagination page={state.page} perPage={state.perPage} total={312} noun={{ one: "user", other: "users" }}
  onPageChange={state.setPage} onPerPageChange={state.setPerPage} />

// Laravel: `UserResource::collection($users->paginate())` or `$users->paginate()` as JSON
<Pagination paginator={response} numbered />
```

`Pagination` is exported from `@javaabu/onu` (it replaces the shadcn primitive of the same name there; the primitive stays in `@javaabu/onu/primitives`).

## Behaviour

- Previous is disabled on the first page and Next on the last (or when a simple paginator has no `next_page_url`).
- With `getPageHref`, or a paginator with a `path` / `links`, pages are links rendered with `OnuProvider linkComponent` (Inertia, Next). Plain clicks still call `onPageChange` when given.

## Props

| Prop              | Type                                                 | Default             | Description                           |
| ----------------- | ---------------------------------------------------- | ------------------- | ------------------------------------- |
| `page`            | `number`                                             | `1`                 | Current page                          |
| `perPage`         | `number`                                             | `25`                | Rows per page                         |
| `total`           | `number`                                             |                     | Total rows                            |
| `hasNextPage`     | `boolean`                                            |                     | When the total is unknown             |
| `paginator`       | `LaravelResourceCollection \| LaravelPaginationMeta` |                     | Laravel response; overrides the above |
| `onPageChange`    | `(page) => void`                                     |                     |                                       |
| `onPerPageChange` | `(perPage) => void`                                  |                     | Shows the rows-per-page select        |
| `perPageOptions`  | `number[]`                                           | `[10, 25, 50, 100]` |                                       |
| `getPageHref`     | `(page) => string`                                   |                     | Render pages as links                 |
| `numbered`        | `boolean`                                            | `false`             | Numbered pages                        |
| `showSummary`     | `boolean`                                            | `true`              | The "Showing …" text                  |
| `noun`            | `{ one, other }`                                     | records             |                                       |
| `size`            | `"default" \| "sm"`                                  |                     | `paginationVariants`                  |
| `classNames`      | `{ summary, controls, perPage, pages, button }`      |                     |                                       |

Helpers: `normalizePagination(response)` and `getPageItems(page, lastPage)`.

## Accessibility

A `navigation` landmark named "Pagination". The current page has `aria-current="page"`; buttons are named "Go to page 3", "Go to next page". The summary is a polite live region, so page changes are announced. Targets are 44px on touch screens.

## RTL

The arrows and the order mirror in RTL. Numbers use Western digits in Dhivehi (R12.6).

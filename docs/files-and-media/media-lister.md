---
title: MediaLister
sidebar_position: 10
---

A media library: grid or list view, search, single or multiple selection, type icons and lazy thumbnails, with infinite or paged loading driven by props (fetch the data however you like).

```tsx
import { MediaLister } from "@javaabu/onu"

const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(...)

<MediaLister
  items={data.pages.flatMap((p) => p.data)}
  selectionMode="multiple"
  selected={selected}
  onSelectedChange={setSelected}
  search={search}
  onSearchChange={setSearch}
  hasMore={hasNextPage}
  loading={isFetching}
  onLoadMore={fetchNextPage}
/>
```

Without `onSearchChange`, `items` are filtered by name locally. For paged APIs pass `page`, `pageCount` and `onPageChange` instead of `hasMore`/`onLoadMore` (Laravel paginator `meta.current_page` / `meta.last_page`).

## Props

| Prop                                                | Type                                               | Default          | Description                                                |
| --------------------------------------------------- | -------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `items`                                             | `MediaItem[]`                                      |                  | `{ id, name, url?, thumbnailUrl?, alt?, type?, size? }`    |
| `view` / `defaultView` / `onViewChange`             | `"grid" \| "list"`                                 | `"grid"`         | View mode                                                  |
| `search` / `defaultSearch` / `onSearchChange`       | `string`                                           |                  | Search text; pass `onSearchChange` to search on the server |
| `hideSearch`                                        | `boolean`                                          | `false`          | Hide the search box                                        |
| `searchThaana`                                      | `boolean \| ThaanaOptions`                         |                  | Thaana typing in the search box                            |
| `selectionMode`                                     | `"none" \| "single" \| "multiple"`                 | `"none"`         | Selection behaviour                                        |
| `selected` / `defaultSelected` / `onSelectedChange` | `MediaId[]`                                        |                  | Selected ids                                               |
| `onItemOpen`                                        | `(item) => void`                                   |                  | Item activated (in `none` mode)                            |
| `renderActions`                                     | `(item) => ReactNode`                              |                  | Extra buttons per item (always visible)                    |
| `loading`                                           | `boolean`                                          |                  | Show skeletons and disable "Load more"                     |
| `hasMore` / `onLoadMore` / `infinite`               |                                                    | `infinite: true` | Infinite loading (scroll + button)                         |
| `page` / `pageCount` / `onPageChange`               | `number`                                           |                  | Paged loading                                              |
| `emptyMessage`                                      | `ReactNode`                                        |                  | Empty state text                                           |
| `toolbar`                                           | `ReactNode`                                        |                  | Extra toolbar content                                      |
| `label`                                             | `string`                                           | "Media library"  | Accessible name of the list                                |
| `classNames`                                        | `{ toolbar, list, item, thumbnail, name, footer }` |                  | Classes for each part                                      |

## Accessibility

- Items are buttons; in selection modes they are toggle buttons with `aria-pressed`, and the selected state is also shown with a check mark.
- The selection count ("3 selected") and loading are announced in a polite status region.
- Infinite loading always has a "Load more" button as well, so it works without scrolling.

| Key                                 | Action                         |
| ----------------------------------- | ------------------------------ |
| <kbd>Tab</kbd>                      | Move between items and actions |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open or (de)select an item     |

## RTL and Dhivehi

The grid uses container queries (2 → 6 columns). Thaana search works with `searchThaana`; local filtering uses the active locale.
File names take their own direction (`dir="auto"`), so a Latin name in an RTL page is cut at its own end; sizes such as "248 KB" are forced left-to-right. AttachmentPreview, DocumentDownload, FileInput and the upload lists do the same.

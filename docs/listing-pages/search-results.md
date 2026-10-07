---
title: SearchResults
sidebar_position: 25
---

Search results grouped by type (Services, News, Pages), with a count per group and the search words highlighted. `Highlight` marks words in any text.

```tsx
import { Highlight, SearchResults } from "@javaabu/onu"

<SearchResults
  query="passport renewal"
  loading={isFetching}
  groups={[
    { id: "services", label: "Services", total: 12, moreHref: "/search?type=services", items: [{ id: "1", title: "Passport renewal", description: "…", href: "/services/passport" }] },
    { id: "news", label: "News", items: news },
  ]}
/>

<Highlight text="Renew your passport online" query="passport" />
```

## Props

| Prop          | Type                                                    | Description                                        |
| ------------- | ------------------------------------------------------- | -------------------------------------------------- |
| `query`       | `string`                                                | Words to highlight                                 |
| `groups`      | `{ id, label, items, total?, moreHref?, moreLabel? }[]` | Empty groups are hidden                            |
| `loading`     | `boolean`                                               | Skeletons                                          |
| `onSelect`    | `(item, group) => void`                                 | For items without `href`                           |
| `hideSummary` | `boolean`                                               | Hide "12 results for …" (stays for screen readers) |
| `classNames`  | `{ summary, group, heading, item, mark }`               |                                                    |

Items: `id`, `title`, `description?`, `href?`, `meta?`, `icon?`.

## Accessibility

The results are a section labelled by the summary heading, which is a live region ("12 results for “passport”"). Each group is a labelled section with an `h3`. Matches use `<mark>`. Highlighting is case-insensitive and works for Thaana.

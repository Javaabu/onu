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

## Show more on the same page

Without `onShowMore`, a group's `moreHref` is a "View all" link to another page. With `onShowMore(groupId, group)`, groups with more results than shown (`total` greater than the items, or `hasMore`) get a **Show more** button instead: append the next results to that group's `items`. Return a promise (or set the group's `loadingMore`) to show a spinner on the button meanwhile.

```tsx
const [news, setNews] = useState(firstNews)

<SearchResults
  query={query}
  groups={[{ id: "news", label: "News", total: 48, items: news }]}
  onShowMore={async (groupId) => {
    const next = await api.search(query, { type: groupId, offset: news.length })
    setNews((items) => [...items, ...next])
  }}
/>
```

When the new results arrive, focus moves to the first of them and "3 more News results shown" is announced. If the promise rejects, "Couldn't load more results" is announced and focus stays on the button.

## Props

| Prop          | Type                                                    | Description                                        |
| ------------- | ------------------------------------------------------- | -------------------------------------------------- |
| `query`       | `string`                                                | Words to highlight                                 |
| `groups`      | `{ id, label, items, total?, moreHref?, moreLabel?, hasMore?, loadingMore? }[]` | Empty groups are hidden                            |
| `loading`     | `boolean`                                               | Skeletons                                          |
| `onSelect`    | `(item, group) => void`                                 | For items without `href`                           |
| `onShowMore`  | `(groupId, group) => void \| Promise`                   | Show more of a group in place (replaces the link)  |
| `hideSummary` | `boolean`                                               | Hide "12 results for …" (stays for screen readers) |
| `classNames`  | `{ summary, group, heading, item, mark, more }`         | `more`: the "View all" link or "Show more" button  |

Items: `id`, `title`, `description?`, `href?`, `meta?`, `icon?`.

## Accessibility

The results are a section labelled by the summary heading, which is a live region ("12 results for “passport”"). Each group is a labelled section with an `h3`. Matches use `<mark>`. Highlighting is case-insensitive and works for Thaana.

The **Show more** button has `aria-busy` and `aria-disabled` while loading (it keeps focus). When results arrive, focus moves to the first new result, so keyboard and screen reader users continue where the list grew; the loading, loaded and failed states are announced through a polite live region.

| Key                                 | Action                          |
| ----------------------------------- | ------------------------------- |
| <kbd>Tab</kbd>                      | Move between results and the Show more button |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open a result or show more      |

## RTL and Dhivehi

All text comes from the `listing` namespace ("އިތުރު ޚިދުމަތްތައް ދައްކާ"). Results use logical spacing, so icons sit at the inline start in both directions.

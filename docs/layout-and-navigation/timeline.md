# Timeline

A vertical timeline for status trackers, activity histories and who-did-what feeds. Each entry has a status marker (icon and colour) or the actor's avatar, a title, a timestamp formatted for the active locale, a description and optional extra content. Entries can be grouped by day (Today, Yesterday, 3 October 2026), with a "Load more" button.

```tsx
import { Timeline } from "@javaabu/onu"

;<Timeline
  items={[
    { title: "Application submitted", time: submittedAt, status: "success" },
    { title: "Documents under review", time: reviewAt, status: "current" },
    { title: "Additional document requested", status: "warning", content: <Button size="sm">Upload</Button> },
    { title: "Final approval", status: "pending" },
  ]}
/>
```

## Activity feed

Give entries an `actor` and the marker becomes their avatar and the title follows their name ("**Aishath Shiuna** approved the application"); entries without an actor (system events) can take an `icon`. `groupByDay` puts the entries under day headings, `timeFormat="relative"` shows "5 minutes ago" with the exact time on hover and focus, and `hasMore` with `onLoadMore` adds a "Load more" button that shows a spinner while the promise runs.

```tsx
<Timeline
  title="Activity"
  groupByDay
  timeFormat="relative"
  items={[
    { id: 1, actor: { name: "Aishath Shiuna" }, title: "approved the application", time: "2026-03-12T09:12:00Z" },
    { id: 2, icon: "settings", title: "Status changed to Pending", time: "2026-03-11T14:00:00Z" },
  ]}
  hasMore={page < lastPage}
  onLoadMore={() => fetchNextPage()}
/>
```

Day groups follow the order of the items (pass them newest first for a feed); entries without a valid `time` are left out when grouping. `groupTimelineByDay(items)` is exported. With no items the timeline shows `emptyText` ("No activity yet").

## Statuses

| `status`  | Marker                    | Screen-reader text |
| --------- | ------------------------- | ------------------ |
| `default` | muted dot                 | —                  |
| `success` | check, success colour     | Completed          |
| `error`   | cross, destructive colour | Failed             |
| `warning` | warning, warning colour   | Needs attention    |
| `info`    | info, info colour         | Information        |
| `pending` | clock, dashed outline     | Pending            |
| `current` | dot, primary colour       | In progress        |

## Props

| Prop          | Type                                                                          | Default           | Description                                                             |
| ------------- | ----------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------- |
| `items`       | `TimelineItem[]`                                                              |                   | `{ id?, title, description?, time?, status?, icon?, actor?, content? }` |
| `timeFormat`  | `'absolute' \| 'relative'`                                                    | `'absolute'`      | "Oct 1, 2026, 9:30 AM" or "3 days ago" (exact time on hover and focus)  |
| `datePattern` | `string`                                                                      | `'PPp'`           | date-fns pattern for absolute times                                     |
| `now`         | `Date \| string \| number`                                                    | live              | Reference time for relative times and day headings                      |
| `size`        | `'sm' \| 'default'`                                                           | `'default'`       | Marker size                                                             |
| `groupByDay`  | `boolean`                                                                     | `false`           | Day headings (Today, Yesterday, date)                                   |
| `dayFormat`   | `string`                                                                      | `'PPP'`           | date-fns format for older day headings                                  |
| `title`       | `ReactNode`                                                                   |                   | An `h2` heading that names the timeline                                 |
| `emptyText`   | `ReactNode`                                                                   | "No activity yet" | Shown with no items                                                     |
| `hasMore`     | `boolean`                                                                     | `false`           | Show "Load more"                                                        |
| `onLoadMore`  | `() => void \| Promise`                                                       |                   | Load the next page (spinner while the promise runs)                     |
| `loadingMore` | `boolean`                                                                     | automatic         | Force the loading state                                                 |
| `aria-label`  | `string`                                                                      | "Timeline"        | Name, when there is no `title`                                          |
| `classNames`  | `{ item, marker, title, time, description, group, heading, empty, loadMore }` |                   | Classes for each part                                                   |

`actor` is `{ name, avatar? }`.

`timelineMarkerVariants` is exported. Times use the locale's date-fns locale, so Dhivehi shows Dhivehi month names.

## Accessibility

- An ordered list; the `current` entry has `aria-current="step"`.
- Status is given as text, not only colour (R14.6). Times are `<time datetime>`; relative times can be focused to show the exact time.
- With `title`, `groupByDay`, `hasMore` or no items, the timeline is a `<section>` named by its heading (or `aria-label`), and each day is an ordered list named by its `h3`.
- `aria-busy` is set while loading more; the button is disabled to prevent double loads.
- Avatars are decorative: the actor's name is in the text.

| Key                                 | Action    |
| ----------------------------------- | --------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Load more |

## RTL

The line, markers and avatars sit on the inline start (the right in RTL).

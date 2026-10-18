# Timeline

A vertical timeline for status trackers and activity histories. Each entry has a status marker (icon and colour), a title, a timestamp formatted for the active locale, a description and optional extra content.

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

| Prop          | Type                                                         | Default      | Description                            |
| ------------- | ------------------------------------------------------------ | ------------ | -------------------------------------- |
| `items`       | `{ title, description?, time?, status?, icon?, content? }[]` |              | Entries                                |
| `timeFormat`  | `'absolute' \| 'relative'`                                   | `'absolute'` | "Oct 1, 2026, 9:30 AM" or "3 days ago" |
| `datePattern` | `string`                                                     | `'PPp'`      | date-fns pattern for absolute times    |
| `now`         | `Date`                                                       |              | Reference time for relative times      |
| `size`        | `'sm' \| 'default'`                                          | `'default'`  | Marker size                            |
| `aria-label`  | `string`                                                     | "Timeline"   | List name                              |
| `classNames`  | `{ item, marker, title, time, description }`                 |              | Classes for each part                  |

`timelineMarkerVariants` is exported. Times use the locale's date-fns locale, so Dhivehi shows Dhivehi month names.

## Accessibility

- An ordered list; the `current` entry has `aria-current="step"`.
- Status is given as text, not only colour (R14.6). Times are `<time datetime>`.

## RTL

The line and markers sit on the inline start (the right in RTL).

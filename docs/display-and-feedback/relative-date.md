---
title: RelativeDate
sidebar_position: 16
---

A date shown relative to now ("just now", "5 minutes ago", "3 days ago", "in 2 hours"), as specified in REQUIREMENTS §25.5. Uses the active locale's date-fns `formatDistance`, so Dhivehi reads "5 މިނެޓު ކުރިން".

```tsx
import { RelativeDate } from "@javaabu/onu"

<RelativeDate value={comment.created_at} />
<RelativeDate value={null} /> // —
```

## Behaviour (§25.5)

- Shows "just now" (under 45 seconds either way), "5 minutes ago", "3 days ago" or "in 2 hours".
- **Hovering or focusing** it shows the exact date and time in a tooltip.
- On **touch screens** (`(hover: none)`), the exact date and time is shown in smaller text underneath instead.
- With no value (or an invalid one) it shows "—" ("Not set" for screen readers).
- It keeps itself up to date: every 10 s for the first minute, 30 s for the first hour, 5 min for the first day, then hourly.
- Renders `<time dateTime="…ISO…">`.

## Props

| Prop             | Type                               | Default   | Description                                         |
| ---------------- | ---------------------------------- | --------- | --------------------------------------------------- |
| `value`          | `Date \| string \| number \| null` |           | The date                                            |
| `now`            | `Date \| string \| number`         | live      | Fixed reference time (tests, SSR); disables updates |
| `updateInterval` | `number \| false`                  | automatic | Refresh interval in ms, or never                    |
| `format`         | `string`                           | `'PPPp'`  | date-fns format of the exact date                   |
| `showExact`      | `boolean`                          | `true`    | Tooltip / touch line; `false` uses a `title` only   |
| `tooltipDelay`   | `number`                           | `300`     | Hover delay in ms                                   |
| `classNames`     | `{ exact, tooltip, empty }`        |           | Classes for each part                               |

`formatRelativeDate(date, now, locale, t)` and `autoUpdateInterval(date, now)` are exported.

## Accessibility

- The `<time>` is focusable (when the tooltip is used) so keyboard users can reveal the exact date; the tooltip also opens on focus, and closes with <kbd>Escape</kbd>.
- A dotted underline hints that more detail is available.

| Key               | Action                     |
| ----------------- | -------------------------- |
| <kbd>Tab</kbd>    | Focus and show the tooltip |
| <kbd>Escape</kbd> | Hide the tooltip           |

## SSR

The first render uses the server's time; pass `now` if you need identical server and client output.

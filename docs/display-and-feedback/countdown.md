# Countdown

Counts down to a date in days, hours, minutes and seconds, with tabular numbers (R7.5). The visible clock ticks every second, but screen reader announcements are throttled so they aren't flooded.

```tsx
import { Countdown } from "@javaabu/onu"

<Countdown to="2026-06-30T23:59:59+05:00" onComplete={() => setClosed(true)} />
<Countdown to={deadline} variant="inline" completeText="Registration closed" />
```

## Props

| Prop            | Type                               | Default   | Description                                                           |
| --------------- | ---------------------------------- | --------- | --------------------------------------------------------------------- |
| `to`            | `Date \| string \| number`         |           | Target date and time                                                  |
| `onComplete`    | `() => void`                       |           | Called once at zero (straight away if `to` is already past)           |
| `variant`       | `'boxes' \| 'inline'`              | `'boxes'` | Boxes with labels, or `00:00:00`                                      |
| `size`          | `'sm' \| 'md' \| 'lg'`             | `'md'`    | Number size (boxes)                                                   |
| `showDays`      | `boolean \| 'auto'`                | `'auto'`  | `auto` hides days when there are none left (hours then count past 24) |
| `showSeconds`   | `boolean`                          | `true`    | Show seconds                                                          |
| `announceEvery` | `number`                           | `60`      | Seconds between screen reader announcements                           |
| `completeText`  | `ReactNode`                        |           | Shown instead of zeros when finished                                  |
| `classNames`    | `{ unit, value, label, complete }` |           | Classes for each part                                                 |

`getCountdownParts(target, now)` and `describeDuration(seconds, t)` are exported. The root has `data-state="running|complete"`.

## Accessibility

- The clock has `role="timer"` (not announced on every tick).
- A separate polite live region announces "2 days, 3 hours, 5 minutes remaining" once per `announceEvery` seconds, and "Time's up" at the end.

## RTL and Dhivehi

Unit labels are translated. Boxes follow the page direction (days first, at the inline start); the inline `00:00:00` clock always reads left to right.

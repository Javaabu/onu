# MiniCalendar

A compact, **read-only** month calendar with event dots, for portal sidebars and dashboards ("Upcoming events"). Built on shadcn's `Calendar` (react-day-picker). It is not a date picker: clicking a day lists that day's events. For the full scheduling calendar use `@javaabu/onu/calendar`.

```tsx
import { MiniCalendar } from "@javaabu/onu"
;<MiniCalendar
  events={[
    { id: 1, date: "2026-03-12T10:00", title: "Council meeting", tone: "primary" },
    { id: 2, date: "2026-03-20", title: "Job fair", tone: "success", href: "/events/job-fair" },
  ]}
  onDayClick={(date, events) => console.log(date, events)}
/>
```

## Props

| Prop            | Type                      | Default       | Description                              |
| --------------- | ------------------------- | ------------- | ---------------------------------------- |
| `events`        | `MiniCalendarEvent[]`     | `[]`          | `{ id?, date, title, tone?, href? }`     |
| `month`         | `Date`                    |               | Controlled month                         |
| `defaultMonth`  | `Date`                    | current month | Initial month                            |
| `onMonthChange` | `(month) => void`         |               | Month navigation                         |
| `onDayClick`    | `(date, events) => void`  |               | Day clicked                              |
| `showEventList` | `boolean`                 | `true`        | List the clicked day's events underneath |
| `maxDots`       | `number`                  | `3`           | Dots per day                             |
| `classNames`    | `{ calendar, list, dot }` |               | Classes for each part                    |

Event `tone`: `primary`, `success`, `warning`, `destructive`, `info` or `muted`.

## Accessibility

- Each day's accessible name includes its event count ("Thursday, March 12th, 2026, 2 events"), so the dots aren't the only signal.
- The event list updates in a polite live region.
- Keyboard navigation is react-day-picker's grid pattern.

| Key                                                 | Action                              |
| --------------------------------------------------- | ----------------------------------- |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Move between days (mirrored in RTL) |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd>           | Previous / next month               |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | List the day's events               |

## RTL and Dhivehi

Month and weekday names, and the first day of the week, come from the active locale. The grid and navigation mirror in RTL.

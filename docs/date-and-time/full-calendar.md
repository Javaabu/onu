---
title: FullCalendar
sidebar_position: 13
---

A full calendar with **month**, **week**, **day** and **agenda** views, built on [FullCalendar](https://fullcalendar.io) v6 using only its MIT "standard" plugins (`daygrid`, `timegrid`, `list`, `interaction`; R4.3). It has Onu's own responsive toolbar, a theme made from Onu tokens (light and dark), RTL and a Dhivehi locale. It lives in a separate entry so the main bundle stays small.

```bash
pnpm add @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction
```

```tsx
import { FullCalendar, type CalendarEvent } from "@javaabu/onu/calendar"

const events: CalendarEvent[] = [
  { id: "1", title: "Council meeting", start: new Date(2026, 2, 12, 10), end: new Date(2026, 2, 12, 11) },
  { id: "2", title: "Independence Day", start: "2026-07-26", allDay: true, color: "success" },
]

;<FullCalendar
  events={events}
  editable
  selectable
  onDateClick={({ date }) => openCreateDialog(date)}
  onSelect={({ start, end }) => openCreateDialog(start, end)}
  onEventClick={({ event }) => openEvent(event.id)}
  onEventDrop={(arg) => save(arg.event).catch(() => arg.revert())}
  onEventResize={(arg) => save(arg.event).catch(() => arg.revert())}
/>
```

- `color` takes a theme colour (`primary`, `success`, `warning`, `destructive`, `info`, `secondary`, `chart-1`…`chart-8`), so events follow dark mode and `--onu-primary`. Any other FullCalendar event field (`backgroundColor`, `extendedProps`, `url`, …) passes through.
- The toolbar (‹ Today › · title · view switch) wraps on narrow containers; on phones the calendar opens on the agenda.
- Weekend days (Friday and Saturday by default) are shaded; today is marked.
- `apiRef` gives FullCalendar's `CalendarApi`; `options` passes any other FullCalendar option (Onu's props win); `hideToolbar` lets you build your own.

## Locales

`fullCalendarLocale(onuLocale, { weekStartsOn, hourCycle })` builds a FullCalendar locale from an Onu locale (texts, direction, week start, and date formats through date-fns, since browsers have no Dhivehi date data). `dvFullCalendarLocale` is the ready-made Dhivehi one. `FullCalendar` applies the active locale automatically.

## Props

| Prop                                       | Type                                     | Default                      | Description                              |
| ------------------------------------------ | ---------------------------------------- | ---------------------------- | ---------------------------------------- |
| `events`                                   | `CalendarEvent[]`                        |                              |                                          |
| `view` / `defaultView` / `onViewChange`    | `"month" \| "week" \| "day" \| "agenda"` | `month` (`agenda` on phones) |                                          |
| `views`                                    | `FullCalendarView[]`                     | all four                     | Views in the switcher                    |
| `initialDate`                              | `Date`                                   | today                        |                                          |
| `onRangeChange`                            | `({ start, end, view }) => void`         |                              | Visible range changed (load events here) |
| `editable` / `selectable`                  | `boolean`                                | `false`                      | Drag/resize events; select ranges        |
| `onDateClick`                              | `({ date, allDay }) => void`             |                              |                                          |
| `onSelect`                                 | `({ start, end, allDay }) => void`       |                              |                                          |
| `onEventClick`                             | `(arg: EventClickArg) => void`           |                              | Also makes events keyboard-focusable     |
| `onEventDrop` / `onEventResize`            | `(arg) => void`                          |                              | Call `arg.revert()` to undo              |
| `weekStartsOn`, `weekendDays`, `hourCycle` |                                          | locale / `[5, 6]`            |                                          |
| `height`                                   | `"auto" \| string \| number`             | `"auto"`                     |                                          |
| `hideToolbar`                              | `boolean`                                | `false`                      |                                          |
| `options`                                  | `CalendarOptions`                        |                              | Any other FullCalendar option            |
| `apiRef`                                   | `Ref<CalendarApi \| null>`               |                              |                                          |
| `className` / `classNames`                 | `{ toolbar, title, calendar }`           |                              |                                          |

## Accessibility

- The toolbar buttons are labelled ("Previous", "Today", "Next"); the view switch is a labelled radio group; the title is a heading announced politely when the range changes.
- With `onEventClick`, events are focusable and open with <kbd>Enter</kbd>. Day numbers are links to the day view.
- Drag and resize are pointer gestures; offer an edit form as the keyboard alternative (R3.27). Creating by clicking a day also needs a button alternative in your page (e.g. "New event").

## RTL and Dhivehi

With `locale="dv"` the calendar runs right to left with Dhivehi buttons, month and weekday names, and މކ/މފ times.

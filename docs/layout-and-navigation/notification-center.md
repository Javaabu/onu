# NotificationCenter

A bell button with the unread count that opens the notification list: a popover on desktop and a bottom sheet (vaul drawer) on phones. Items can be marked read one by one or all at once, there is an empty state, and new unread items are announced in a live region.

```tsx
import { NotificationCenter } from "@javaabu/onu"

;<NotificationCenter
  notifications={notifications}
  onMarkRead={(id) => markRead(id)}
  onMarkAllRead={markAllRead}
  viewAllHref="/notifications"
/>
```

Notifications are data you own (from Laravel's database notifications, a websocket, polling …). Update the array and the bell, list and announcement follow.

## Items

`{ id, title, description?, time?, read?, href?, icon?, variant? }`

- `time` (`Date`, ISO string or timestamp) is shown as relative time in the active locale ("about 1 hour ago", Dhivehi in `dv`).
- `href` makes the row a link (through `OnuProvider linkComponent`); following it closes the list.
- `variant`: `default | success | warning | error | info` tints the icon.
- Clicking an unread item calls `onMarkRead` (turn off with `markReadOnClick={false}`).

## Props

| Prop                                    | Type                                      | Default   | Description                                    |
| --------------------------------------- | ----------------------------------------- | --------- | ---------------------------------------------- |
| `notifications`                         | `NotificationItem[]`                      |           | The list                                       |
| `onMarkRead`                            | `(id) => void`                            |           | Shows per-item "Mark as read" buttons          |
| `onMarkAllRead`                         | `() => void`                              |           | Shows "Mark all as read" when there are unread |
| `onItemClick`                           | `(item) => void`                          |           | Called when an item is clicked                 |
| `viewAllHref`                           | `string`                                  |           | Footer link to the full page                   |
| `open` / `defaultOpen` / `onOpenChange` | `boolean` / callback                      |           | Controlled or uncontrolled                     |
| `empty`                                 | `ReactNode`                               |           | Custom empty state                             |
| `mobile`                                | `'sheet' \| 'popover'`                    | `'sheet'` | Presentation below 768px                       |
| `markReadOnClick`                       | `boolean`                                 | `true`    | Mark read when clicked                         |
| `now`                                   | `Date`                                    |           | Reference time (tests, SSR)                    |
| `classNames`                            | `{ trigger, count, content, list, item }` |           | Classes for each part                          |

## Accessibility

- The bell's name includes the count: "Notifications, 3 unread". The visual badge is hidden from screen readers; counts above 99 show "99+".
- The list is labelled "Notifications"; unread items include an "Unread" note.
- New unread items are announced politely: "2 new notifications".
- Focus returns to the bell when the popover or sheet closes.

| Key                                 | Action                         |
| ----------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the list                  |
| <kbd>Tab</kbd>                      | Move through items and buttons |
| <kbd>Escape</kbd>                   | Close                          |

## RTL

The popover aligns to the inline end; the count badge sits on the inline end of the bell.

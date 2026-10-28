# AnnouncementBar

A full-width bar at the top of the page for site-wide news. Dismissible, and when you give it an `id` the dismissal is remembered in `localStorage`.

```tsx
import { AnnouncementBar } from "@javaabu/onu"
;<AnnouncementBar id="housing-2026" icon="megaphone" href="/housing" linkText="Apply now">
  Housing scheme applications close on 30 June.
</AnnouncementBar>
```

Change the `id` to show a new announcement to people who dismissed the old one.

## Props

| Prop            | Type                                            | Default               | Description                         |
| --------------- | ----------------------------------------------- | --------------------- | ----------------------------------- |
| `id`            | `string`                                        |                       | Persist the dismissal under this id |
| `variant`       | `'primary' \| 'neutral' \| 'info' \| 'warning'` | `'primary'`           | Colours                             |
| `href`          | `string`                                        |                       | Link after the message              |
| `linkText`      | `ReactNode`                                     |                       | Link text                           |
| `icon`          | `string \| ReactNode`                           |                       | Icon before the message             |
| `dismissible`   | `boolean`                                       | `true`                | Show the dismiss button             |
| `onDismiss`     | `() => void`                                    |                       | Called after dismissing             |
| `storagePrefix` | `string`                                        | `'onu-announcement:'` | `localStorage` key prefix           |
| `classNames`    | `{ message, link, dismiss }`                    |                       | Classes for each part               |

The link uses the `linkComponent` from `OnuProvider` (Inertia, Next.js, …). Variants are exported as `announcementBarVariants`.

## Accessibility

- A `role="region"` landmark named "Announcement".
- The dismiss button is labelled "Dismiss" and is 44px on touch screens.

## SSR

The stored dismissal is read on the client, so a dismissed bar may flash during hydration in SSR apps. Render it client-side only if that matters.

## RTL

The dismiss button sits at the inline end, and the link arrow mirrors in RTL.

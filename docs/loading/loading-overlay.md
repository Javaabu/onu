---
title: LoadingOverlay
sidebar_position: 4
---

Covers a container (a card, table or form) while it loads or saves. The container gets `aria-busy`, the content underneath becomes `inert`, and a status message is announced. The overlay only appears after a short `delay`, so quick loads don't flicker.

```tsx
import { LoadingOverlay } from "@javaabu/onu"

;<LoadingOverlay loading={isFetching} message="Refreshing payments…" className="rounded-xl">
  <PaymentsCard />
</LoadingOverlay>
```

Full screen, e.g. while submitting an application:

```tsx
<LoadingOverlay loading={submitting} fullScreen message="Submitting…" />
```

## Props

| Prop         | Type                                     | Default | Description                                     |
| ------------ | ---------------------------------------- | ------- | ----------------------------------------------- |
| `loading`    | `boolean`                                |         | Show the overlay (required)                     |
| `message`    | `ReactNode`                              |         | Visible text under the spinner                  |
| `delay`      | `number`                                 | `200`   | Wait (ms) before showing; `0` shows immediately |
| `fullScreen` | `boolean`                                | `false` | Cover the viewport instead of the container     |
| `blur`       | `boolean`                                | `true`  | Blur the content underneath                     |
| `className`  | `string`                                 |         | Classes for the container                       |
| `classNames` | `{ content, overlay, spinner, message }` |         | Classes for each part                           |

The root is a `relative` `<div>`; other `<div>` props pass through. `useDelayedFlag(value, delay)` is exported for your own delayed indicators.

## Accessibility

- `aria-busy` is set on the container while `loading` is true.
- While the overlay is visible, the content is `inert` (not focusable or clickable).
- A `role="status"` region, always mounted, announces the message (or "Loading…") when the overlay appears.

## RTL

The overlay is centred and direction-neutral; messages follow the page direction.

---
title: PageProgress
sidebar_position: 5
---

A thin bar at the top of the page that shows a navigation or long request is in progress, like NProgress. Control it with `pageProgress.start()` / `done()` or the `usePageProgress(loading)` hook. It grows from the inline start (right to left in RTL) and drops its animations under reduced motion.

Mount it once, e.g. in your layout:

```tsx
import { PageProgress } from "@javaabu/onu"

;<PageProgress />
```

## Hooking up a router

```ts
import { router } from "@inertiajs/react"
import { pageProgress } from "@javaabu/onu"

router.on("start", () => pageProgress.start())
router.on("finish", () => pageProgress.done())
```

Or from a component, while something loads:

```tsx
import { usePageProgress } from "@javaabu/onu"

function Report() {
  const { isLoading } = useQuery(…)
  usePageProgress(isLoading)
  …
}
```

`start()` calls nest: the bar finishes after the same number of `done()` calls (`done(true)` forces it). `set(0.5)` and `inc(0.1)` move it manually. Use `createPageProgress()` for a separate bar (e.g. inside a panel with `position="absolute"`).

## Props

| Prop         | Type                                                             | Default        | Description                                     |
| ------------ | ---------------------------------------------------------------- | -------------- | ----------------------------------------------- |
| `controller` | `PageProgressController`                                         | `pageProgress` | Which controller to follow                      |
| `height`     | `number`                                                         | `3`            | Thickness in px                                 |
| `delay`      | `number`                                                         | `150`          | Wait (ms) before showing; fast loads never show |
| `position`   | `'fixed' \| 'absolute'`                                          | `'fixed'`      | Top of the viewport or of the nearest container |
| `color`      | `'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info'` | `'primary'`    | Bar colour                                      |
| `className`  | `string`                                                         |                | Classes for the track                           |
| `classNames` | `{ bar }`                                                        |                | Classes for the bar                             |

## API

| Export                                        | Description                                                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pageProgress`                                | Shared controller: `start`, `done(force?)`, `set(0–1)`, `inc(amount?)`, `getState`, `subscribe` |
| `createPageProgress({ trickleMs, finishMs })` | Create a separate controller                                                                    |
| `usePageProgress(loading, controller?)`       | Show the bar while `loading` is true                                                            |
| `usePageProgressState(controller?)`           | Read `{ active, value }`                                                                        |

## Accessibility

The bar is a `role="progressbar"` named "Loading page" (translated) with `aria-valuenow`. It is decorative for sighted users, so also show a real loading state (skeleton, overlay) for the content being loaded. Width transitions are disabled under `prefers-reduced-motion`.

## RTL

The bar is anchored with `inset-inline-start`, so it fills from the right in RTL (R11.6).

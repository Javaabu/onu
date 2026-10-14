---
title: useUnsavedChangesGuard
sidebar_position: 14
reference: hook
---

Warns before leaving a page with unsaved changes (§25.9). [`SaveBar`](./save-bar) uses it; call it yourself for programmatic navigation.

```tsx
import { useUnsavedChangesGuard } from "@javaabu/onu"

const { confirmLeave, guard, dialog } = useUnsavedChangesGuard(isDirty)

return (
  <>
    …<button onClick={() => guard(() => router.visit("/users"))}>All users</button>
    {dialog}
  </>
)
```

While `dirty` is true:

- closing or reloading the tab shows the browser's own "Leave site?" warning (`beforeunload`);
- clicking a same-origin link anywhere on the page asks "You have unsaved changes. Leave anyway?". **Stay on page** keeps the user where they are; **Leave** replays the click, so router links (Inertia, Next, React Router) navigate as usual;
- pressing the browser's **Back** or **Forward** button to another page (including another hash-router route) asks the same question; **Leave** completes the move.

Links that open a new tab, downloads, modified clicks (Ctrl/⌘/Shift), in-page anchors (`#section`), other origins and anything inside `[data-unsaved-guard-ignore]` are not intercepted. Hash-router links, whose fragment starts with `/` or `!/` (`#/users`, `#!/users`), are routes, so they are guarded.

### How Back is guarded, and its limits

`popstate` fires only after the address has changed, and routers (React Router, Inertia, hash routers) react to it before a page-level listener can. So the guard uses the [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation_API): its `navigate` event fires before a Back/Forward move and can be cancelled. The guard cancels the move, asks, and on **Leave** repeats it with `navigation.traverseTo()`, so Back, Forward and multi-step jumps (long-press on Back) all land where the user meant to go.

What cannot be done:

- Browsers without the Navigation API (older Safari and Firefox) do not let a page cancel Back; there it is not guarded. Use your router's blocking hook with `confirmLeave` (below) if you must support them.
- Browsers refuse to let a page cancel Back repeatedly without the user interacting in between (to stop "back-button traps"). Such a move goes through unguarded.
- Navigations done in code (`router.visit`, `navigate()`) are not asked about; wrap them in `guard()`.
- Leaving the site from the browser's own UI (typing a URL, closing the tab) only gets the browser's "Leave site?" prompt; its text cannot be changed.
- Set `interceptHistory: false` to turn this off.

## Router integration

Back and link clicks are covered on their own. To guard your router's programmatic navigation too, wire `confirmLeave` or `guard` into it:

```tsx
// Inertia
useEffect(
  () =>
    router.on("before", (event) => {
      if (isDirty) {
        event.preventDefault()
        guard(() => router.visit(event.detail.visit.url))
      }
    }),
  [isDirty],
)

// React Router
const blocker = useBlocker(isDirty)
useEffect(() => {
  if (blocker.state === "blocked") void confirmLeave().then((ok) => (ok ? blocker.proceed() : blocker.reset()))
}, [blocker])
```

## API

`useUnsavedChangesGuard(dirty, options?)` returns:

| Field          | Type                            | Description                               |
| -------------- | ------------------------------- | ----------------------------------------- |
| `confirmLeave` | `() => Promise<boolean>`        | `true` when clean or the user chose Leave |
| `guard`        | `(proceed: () => void) => void` | Runs `proceed` when it is fine to leave   |
| `dialog`       | `ReactElement`                  | The confirmation dialog; render it once   |

| Option           | Type        | Default                                   | Description                    |
| ---------------- | ----------- | ----------------------------------------- | ------------------------------ |
| `beforeUnload`   | `boolean`   | `true`                                    | Browser prompt on close/reload |
| `interceptLinks` | `boolean`   | `true`                                    | Ask before following links     |
| `interceptHistory` | `boolean` | `true`                                    | Ask before Back/Forward leave the page |
| `title`          | `ReactNode` | "Leave this page?"                        | Dialog title                   |
| `message`        | `ReactNode` | "You have unsaved changes. Leave anyway?" | Dialog text                    |

## Accessibility

An alert dialog (focus trapped, Escape = stay). Focus returns to the element that had it before the dialog opened.

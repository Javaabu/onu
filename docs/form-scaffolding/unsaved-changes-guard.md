---
title: useUnsavedChangesGuard
sidebar_position: 14
---

Warns before leaving a page with unsaved changes (§25.9). [`SaveBar`](./save-bar) uses it; call it yourself for router navigation that isn't a link click.

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
- clicking a same-origin link anywhere on the page asks "You have unsaved changes. Leave anyway?". **Stay on page** keeps the user where they are; **Leave** replays the click, so router links (Inertia, Next, React Router) navigate as usual.

Links that open a new tab, downloads, modified clicks (Ctrl/⌘/Shift), in-page anchors, other origins and anything inside `[data-unsaved-guard-ignore]` are not intercepted.

## Router integration

The browser's Back button cannot be cancelled by a page, so wire `confirmLeave` into your router:

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
| `title`          | `ReactNode` | "Leave this page?"                        | Dialog title                   |
| `message`        | `ReactNode` | "You have unsaved changes. Leave anyway?" | Dialog text                    |

## Accessibility

An alert dialog (focus trapped, Escape = stay). Focus returns to the element that had it before the dialog opened.

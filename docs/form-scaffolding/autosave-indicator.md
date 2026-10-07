---
title: AutosaveIndicator
sidebar_position: 12
---

Shows whether changes are being saved automatically: **idle**, **saving**, **saved** (with relative time, "Saved 2 minutes ago") or **error** (with **Retry**). Pair it with the `useAutosave` hook.

```tsx
import { AutosaveIndicator, useAutosave } from "@javaabu/onu"

const autosave = useAutosave(draft, { onSave: (value) => api.put(`/posts/${id}/draft`, value), delay: 1000 })

<AutosaveIndicator {...autosave} />
```

Or drive it yourself:

```tsx
<AutosaveIndicator status="saved" lastSavedAt={savedAt} />
<AutosaveIndicator status="error" onRetry={retry} />
```

## Props

| Prop          | Type                                       | Default                 | Description                                 |
| ------------- | ------------------------------------------ | ----------------------- | ------------------------------------------- |
| `status`      | `'idle' \| 'saving' \| 'saved' \| 'error'` |                         | Current state                               |
| `lastSavedAt` | `Date \| number`                           |                         | Shown as relative time, refreshed every 30s |
| `error`       | `ReactNode`                                | "Couldn’t save changes" | Error text                                  |
| `onRetry`     | `() => void`                               |                         | Shows a Retry button in the error state     |
| `compact`     | `boolean`                                  | `false`                 | Icon only (text kept for screen readers)    |

## useAutosave(value, options)

Saves `value` after it stops changing for `delay` ms. Returns `{ status, lastSavedAt, onRetry, flush }`; spread it into the indicator and call `flush()` to save immediately (e.g. on blur). A newer save always wins over a slower older one.

| Option    | Type                 | Default       | Description                |
| --------- | -------------------- | ------------- | -------------------------- |
| `onSave`  | `(value) => unknown` |               | Save; reject to show error |
| `delay`   | `number`             | `1000`        | Debounce in ms             |
| `enabled` | `boolean`            | `true`        | Pause saving               |
| `isEqual` | `(a, b) => boolean`  | JSON equality | Change detection           |

## Accessibility

Status changes are announced in a polite live region ("Saving…", "Saved", "Couldn’t save changes"). The ticking relative time is not re-announced. Status is shown with an icon and text, not colour alone.

## Dhivehi

Relative time uses the active locale's date-fns locale ("3 މިނިޓު ކުރިން ސޭވްކުރެވުނު").

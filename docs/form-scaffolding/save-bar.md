# SaveBar

The save bar for edit pages (REQUIREMENTS §25.9). It lists each change in plain words, keeps **Save** disabled until something changed, has a **Discard** button, is a sticky side panel on desktop and a bar fixed to the bottom on phones, and warns before leaving with unsaved changes.

```tsx
import { Form, SaveBar, describeChanges } from "@javaabu/onu"

const changes = describeChanges(saved, values, { email: "Email", role: "Role" })

<Form onSubmit={save}>
  <div className="gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
    <div className="gap-6 grid">{/* field cards */}</div>
    <SaveBar changes={changes} onDiscard={() => reset(saved)} successMessage="User saved" />
  </div>
</Form>
```

## Behaviour

- **While editing**: each change is listed, e.g. "Email changes to jane@new.com", "Role changes to Editor", "Phone is cleared". Save is disabled until there is a change.
- **Discard** calls `onDiscard`; put every field back to its saved value there.
- **Saving**: inside a [`Form`](./form.md) the Save button submits it and shows the form's processing state (spinner, no double clicks). Outside a form, pass `form="form-id"`, or `onSave` to save yourself.
- **On success**: the success message appears; the list empties once your saved values update.
- **On error**: "Your changes were not saved. Please try again." The `Form` shows each error under its field and focuses the first one.
- **Leaving**: while there are unsaved changes, closing or reloading the tab shows the browser's "Leave site?" prompt, and clicking an in-app link (including hash-router links such as `#/users`) or pressing the browser's Back button asks "You have unsaved changes. Leave anyway?". Nothing is asked once changes are saved or discarded. For programmatic visits, use [`useUnsavedChangesGuard`](./unsaved-changes-guard.md).

## describeChanges(saved, current, labels, format?)

Compares the keys in `labels` (in that order) and returns `SaveBarChange[]`. The values can be any object type, including an `interface`. `format` maps a key to a display value (each formatter receives that key's typed value) (e.g. a role id to its name). Values are formatted for the locale: numbers, dates, yes/no for booleans, lists joined with commas, `{ label }` objects by label; empty values read "… is cleared".

## Props

| Prop                         | Type                                      | Default                        | Description                                |
| ---------------------------- | ----------------------------------------- | ------------------------------ | ------------------------------------------ |
| `changes`                    | `{ field, value?, key?, description? }[]` | `[]`                           | What changed                               |
| `dirty`                      | `boolean`                                 | `changes.length > 0`           | Whether anything can be saved              |
| `onDiscard`                  | `() => void`                              |                                | Restore saved values                       |
| `onSave`                     | `() => unknown`                           |                                | Save yourself instead of submitting a form |
| `form`                       | `string`                                  |                                | Id of the form to submit when outside it   |
| `saving`                     | `boolean`                                 | from `Form`                    | Saving state                               |
| `status`                     | `'idle' \| 'success' \| 'error'`          | from `Form` / `onSave`         | Result of the last save                    |
| `successMessage`             | `ReactNode`                               | "Changes saved"                | e.g. "User saved"                          |
| `errorMessage`               | `ReactNode`                               | "Your changes were not saved…" |                                            |
| `title`                      | `ReactNode`                               | "Unsaved changes"              | Panel title while there are changes; it reads "No changes yet" otherwise |
| `saveLabel` / `discardLabel` | `ReactNode`                               |                                | Button text                                |
| `guard`                      | `boolean`                                 | `true`                         | Warn before leaving with unsaved changes   |
| `layout`                     | `'responsive' \| 'side' \| 'bottom'`      | `responsive`                   | Force a layout                             |
| `classNames`                 | `{ title, list, item, actions, message }` |                                | Classes for each part                      |

On phones the bar is fixed to the bottom (above the safe area) with a spacer so it never covers content; the change list collapses behind an "N unsaved changes" toggle. While nothing has changed, the bar reads "No changes yet" rather than "Unsaved changes".

Whenever the bar is fixed to the bottom (`layout="bottom"`, or `responsive` below `lg`), it lines up with the page's content column: `AppLayout`'s main area, a shadcn `SidebarInset`, or the nearest `<main>`. It follows the column as the sidebar opens, collapses or resizes, so it never covers the `AppSidebar` (in LTR or RTL). Outside such a column it spans the viewport.

## Accessibility

- An `<aside>` landmark named "Unsaved changes".
- The change list and status messages are in a polite live region; errors use `role="alert"`.
- The phone toggle has `aria-expanded`; buttons are 44px on touch screens.
- The leave dialog is an alert dialog; focus returns to where it was when the user stays.

| Key               | Action                                   |
| ----------------- | ---------------------------------------- |
| <kbd>Enter</kbd>  | Save (from any field, inside the `Form`) |
| <kbd>Escape</kbd> | Stay on the page (in the leave dialog)   |

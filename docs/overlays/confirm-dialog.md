# ConfirmDialog

Asks the user to confirm an action, built on shadcn's `AlertDialog`. Use it as a component, or ask from anywhere with the promise-based `useConfirm()` / `confirm()`. It supports a destructive variant, "type the name to confirm", and async actions with a spinner.

## Component

```tsx
import { Button, ConfirmDialog } from "@javaabu/onu"

;<ConfirmDialog
  trigger={<Button variant="destructive">Delete</Button>}
  variant="destructive"
  title="Delete 3 selected users?"
  description="They will be moved to the trash."
  onConfirm={() => api.delete(ids)}
/>
```

When `onConfirm` returns a promise, the confirm button shows a spinner, both buttons are disabled, and the dialog stays open until the promise settles. If it rejects, the dialog stays open and shows the error message.

## Promise API

Mount a `ConfirmProvider` once, near the root of your app:

```tsx
import { ConfirmProvider } from "@javaabu/onu"

;<OnuProvider>
  <ConfirmProvider>
    <App />
  </ConfirmProvider>
</OnuProvider>
```

Then ask from a component with `useConfirm()`, or from anywhere (router guards, stores) with `confirm()`:

```tsx
import { confirm, useConfirm } from "@javaabu/onu"

const ask = useConfirm()

async function onDelete() {
  const ok = await ask({
    title: "Delete Aishath Ali?",
    variant: "destructive",
    onConfirm: () => api.delete(user.id), // optional: spinner until it settles
  })
  if (ok) toast("User deleted")
}

// A string is shorthand for the title.
if (await confirm("Leave without saving?")) router.visit(url)
```

The promise resolves `true` when confirmed and `false` when cancelled (Cancel, Escape). Asking again while a dialog is open resolves the earlier one with `false`. Without a `ConfirmProvider`, `confirm()` falls back to the browser's `window.confirm` with the string title and description.

## Type to confirm

```tsx
<ConfirmDialog variant="destructive" title="Delete Kulhudhuffushi?" confirmText="Kulhudhuffushi" />
```

The confirm button stays disabled until the text matches. If `confirmText` contains Thaana, the field types Thaana from a Latin keyboard.

## Props

`ConfirmDialog` takes the `ConfirmOptions` (also accepted by `confirm()`) plus dialog state:

| Prop                                  | Type                                                                    | Default                    | Description                                  |
| ------------------------------------- | ----------------------------------------------------------------------- | -------------------------- | -------------------------------------------- |
| `title`                               | `ReactNode`                                                             | "Are you sure?"            | The question                                 |
| `description`                         | `ReactNode`                                                             |                            | What will happen                             |
| `confirmLabel`                        | `ReactNode`                                                             | "Confirm" / "Delete"       | Confirm button text                          |
| `cancelLabel`                         | `ReactNode`                                                             | "Cancel"                   | Cancel button text                           |
| `variant`                             | `'default' \| 'destructive'`                                            | `'default'`                | Destructive colours and a warning icon       |
| `icon`                                | `SemanticIconName \| false`                                             | `warning` when destructive | Icon beside the title                        |
| `confirmText`                         | `string`                                                                |                            | Text the user must type to enable the button |
| `onConfirm`                           | `() => unknown`                                                         |                            | Runs on confirm; may return a promise        |
| `errorMessage`                        | `ReactNode`                                                             | error's message            | Shown when `onConfirm` fails                 |
| `onCancel`                            | `() => void`                                                            |                            | Runs on Cancel / Escape                      |
| `trigger`                             | `ReactNode`                                                             |                            | Element that opens the dialog                |
| `open`, `defaultOpen`, `onOpenChange` |                                                                         |                            | Controlled / uncontrolled state              |
| `children`                            | `ReactNode`                                                             |                            | Extra content under the description          |
| `classNames`                          | `{ content, icon, title, description, input, footer, confirm, cancel }` |                            | Classes for each part                        |

`ConfirmProvider` takes `defaults?: ConfirmOptions` applied to every request.

## Accessibility

- Uses the WAI-ARIA alert dialog pattern (`role="alertdialog"`), labelled by the title and described by the description.
- Focus starts on **Cancel** (the safe choice), or on the text field with `confirmText`, and returns to the opener on close, also when opened with `confirm()`.
- While the action runs, the dialog is `aria-busy` and "Working…" is announced; errors use `role="alert"`.

| Key               | Action                                                   |
| ----------------- | -------------------------------------------------------- |
| <kbd>Tab</kbd>    | Move between Cancel, Confirm and the field               |
| <kbd>Enter</kbd>  | Activate the focused button; confirm from the text field |
| <kbd>Escape</kbd> | Cancel (not while the action is running)                 |

## RTL and Dhivehi

All built-in strings come from the `overlay` and `common` locale namespaces. Buttons and the icon swap sides in RTL.

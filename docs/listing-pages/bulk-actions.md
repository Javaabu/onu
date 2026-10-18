# BulkActionBar

The bulk action bar (REQUIREMENTS §25.6). It appears as soon as one row is selected and shows "3 selected", the actions and **Clear selection**. [`DataTable`](./data-table.md) renders it for you from `bulkActions`.

```tsx
import { BulkActionBar, type BulkAction } from "@javaabu/onu"

const actions: BulkAction<unknown>[] = [
  {
    id: "status",
    label: "Change status",
    defaultValue: "active",
    form: ({ id, value, onChange }) => <StatusSelect id={id} value={value} onChange={onChange} />,
    run: (ids, status) => api.updateStatus(ids, status),
    successMessage: (n) => `${n} users updated`,
  },
  { id: "delete", label: "Delete", destructive: true, run: (ids) => api.delete(ids) },
]

;<BulkActionBar selected={state.selection} actions={actions} noun={noun} onClearSelection={state.clearSelection} />
```

## Behaviour

- An action with `form` first shows that small form in the bar, with Apply and Cancel.
- A destructive action (or one with `confirm`) asks first: "Delete 3 selected users?" with Cancel and Delete.
- While `run` is pending the bar shows a spinner and its buttons are disabled.
- When it finishes, a success message appears ("3 users deleted" for `id: "delete"`; otherwise `successMessage`, the string `run` returned, or "Label: 3 users done") and the selection clears.
- If `run` throws, the error shows in the bar and the selection is kept.

## Props

| Prop               | Type                                     | Description     |
| ------------------ | ---------------------------------------- | --------------- |
| `selected`         | `string[]`                               | Selected ids    |
| `actions`          | `BulkAction[]`                           | See below       |
| `onClearSelection` | `() => void`                             |                 |
| `noun`             | `{ one, other }`                         | What is listed  |
| `onSuccess`        | `(message, action, ids) => void`         | After success   |
| `onError`          | `(error, action) => void`                | After a failure |
| `classNames`       | `{ bar, count, actions, form, message }` |                 |

`BulkAction<V>`: `id`, `label`, `icon?`, `destructive?`, `confirm?` (`boolean` or `{ title, description, confirmLabel }`), `form?`, `defaultValue?`, `run(ids, value)`, `successMessage?`, `permitted?` (`false` hides it).

## Accessibility

The bar is a region named "Bulk actions"; the count is a polite live region, so "3 selected" is announced. Confirmations are alert dialogs that return focus where they were opened. After success, focus moves to the result message so it isn't lost when the bar goes away; errors are `role="alert"`.

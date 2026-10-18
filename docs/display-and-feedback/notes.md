# Notes

Internal notes on a record: who wrote what and when, with an add-note box that can type Thaana (`thaana` prop, R13.3) and delete with confirmation.

```tsx
import { Notes } from "@javaabu/onu"
;<Notes
  notes={record.notes}
  currentUserId={user.id}
  thaana
  onAdd={(body) => api.post(`/records/${id}/notes`, { body })}
  onDelete={(noteId) => api.delete(`/notes/${noteId}`)}
/>
```

`NoteData`: `{ id, author: { id?, name, avatar? }, body, createdAt }`.

## Props

| Prop               | Type                        | Default | Description                                                          |
| ------------------ | --------------------------- | ------- | -------------------------------------------------------------------- |
| `notes`            | `NoteData[]`                |         | Notes, newest first                                                  |
| `onAdd`            | `(body) => void \| Promise` |         | Shows the add-note box                                               |
| `onDelete`         | `(id) => void \| Promise`   |         | Delete (after confirmation)                                          |
| `canDelete`        | `(note) => boolean`         |         | Who may delete; default everyone, or the author with `currentUserId` |
| `currentUserId`    | `string \| number`          |         | Restricts delete to the author                                       |
| `thaana`           | `boolean \| ThaanaOptions`  |         | Thaana typing in the note box                                        |
| `composerPosition` | `'top' \| 'bottom'`         | `'top'` | Where the box sits                                                   |
| `title`            | `ReactNode \| null`         | "Notes" | Heading; `null` hides it                                             |
| `now`              | `Date`                      | live    | Reference time                                                       |
| `classNames`       | `{ list, note, composer }`  |         | Classes for each part                                                |

## Accessibility

- A labelled `<section>`; the note box has an accessible name and a hint for <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.
- Delete opens an alert dialog; focus returns to the delete button when it closes.

| Key                                           | Action                              |
| --------------------------------------------- | ----------------------------------- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> | Add the note                        |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>  | Switch Thaana/Latin (with `thaana`) |

## RTL and Thaana

Note bodies use `dir="auto"`. With `thaana` the box is RTL with `lang="dv"` and the Thaana font.

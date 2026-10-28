# CommentThread

A discussion with nested replies. People can edit and delete their own comments, and the composer can type Thaana (`thaana` prop, R13.3). Mentions are not built in. The same component makes a flat list of internal notes (`variant="list"`, below).

```tsx
import { CommentThread } from "@javaabu/onu"
;<CommentThread
  comments={comments}
  currentUserId={user.id}
  thaana
  onAdd={(body, parentId) => api.post("/comments", { body, parent_id: parentId })}
  onEdit={(id, body) => api.patch(`/comments/${id}`, { body })}
  onDelete={(id) => api.delete(`/comments/${id}`)}
/>
```

`CommentData`: `{ id, author: { id, name, avatar? }, body, createdAt, editedAt?, replies? }`. Return a promise from the callbacks to show a spinner; the composer clears after a successful submit.

## Notes

With `variant="list"` the thread is a flat, bordered list: internal notes on a record, who wrote what and when, with add and delete. It uses the note strings ("Notes", "Add note", "No notes yet"), hides Reply (`replies` defaults to `false`) and puts the box above the list (`composerPosition` defaults to `"top"`). `labels` changes the strings.

```tsx
import { CommentThread } from "@javaabu/onu"
;<CommentThread
  variant="list"
  comments={record.notes}
  currentUserId={user.id}
  thaana
  onAdd={(body) => api.post(`/records/${id}/notes`, { body })}
  onDelete={(noteId) => api.delete(`/notes/${noteId}`)}
/>
```

As in the thread, only the author may delete a note; pass `canDelete={() => true}` to let anyone delete.

## Props

| Prop               | Type                                                        | Default    | Description                                      |
| ------------------ | ----------------------------------------------------------- | ---------- | ------------------------------------------------ |
| `comments`         | `CommentData[]`                                             |            | Top-level comments with nested `replies`         |
| `currentUserId`    | `string \| number`                                          |            | Own comments get Edit and Delete                 |
| `onAdd`            | `(body, parentId \| null) => void \| Promise`               |            | Enables the composer and Reply                   |
| `onEdit`           | `(id, body) => void \| Promise`                             |            | Enables Edit (text bodies only)                  |
| `onDelete`         | `(id) => void \| Promise`                                   |            | Enables Delete (asks for confirmation)           |
| `canEdit`          | `(comment) => boolean`                                      | own        | Who may edit                                     |
| `canDelete`        | `(comment) => boolean`                                      | own        | Who may delete                                   |
| `replies`          | `boolean`                                                   | `true`     | Show Reply buttons; `false` for `list`           |
| `variant`          | `'thread' \| 'list'`                                        | `'thread'` | Articles with nested replies, or a list of notes |
| `composerPosition` | `'top' \| 'bottom'`                                         | `'bottom'` | Where the composer sits; `'top'` for `list`      |
| `maxDepth`         | `number`                                                    | `3`        | Indented levels; deeper replies line up          |
| `thaana`           | `boolean \| ThaanaOptions`                                  |            | Thaana typing in the composer (with a toggle)    |
| `title`            | `ReactNode \| null`                                         | "Comments" | Heading ("Notes" for `list`); `null` hides it    |
| `labels`           | `{ title, empty, composer, submit, delete, deleteConfirm }` |            | Override the built-in strings                    |
| `now`              | `Date`                                                      | live       | Reference time for relative dates                |
| `classNames`       | `{ list, comment, body, composer }`                         |            | Classes for each part                            |

## Accessibility

- Each comment is an `<article>` named after its author; replies are nested lists.
- Reply opens a composer and moves focus into it; <kbd>Escape</kbd> or Cancel returns focus to the Reply button. Edit works the same way.
- Delete asks for confirmation in an alert dialog; focus returns to the delete button.
- The list variant is a plain list in a labelled `<section>`; its items are not articles.

| Key                                           | Action                              |
| --------------------------------------------- | ----------------------------------- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> | Send                                |
| <kbd>Escape</kbd>                             | Cancel a reply or edit              |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>  | Switch Thaana/Latin (with `thaana`) |

## RTL and Thaana

Bodies use `dir="auto"`, so Dhivehi comments align right even on an English page. Reply lines are on the inline start. With `thaana` the composer is RTL with `lang="dv"` and the Thaana font.

# CommentThread

A discussion with nested replies. People can edit and delete their own comments, and the composer can type Thaana (`thaana` prop, R13.3). Mentions are not built in.

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

## Props

| Prop            | Type                                          | Default    | Description                                   |
| --------------- | --------------------------------------------- | ---------- | --------------------------------------------- |
| `comments`      | `CommentData[]`                               |            | Top-level comments with nested `replies`      |
| `currentUserId` | `string \| number`                            |            | Own comments get Edit and Delete              |
| `onAdd`         | `(body, parentId \| null) => void \| Promise` |            | Enables the composer and Reply                |
| `onEdit`        | `(id, body) => void \| Promise`               |            | Enables Edit (text bodies only)               |
| `onDelete`      | `(id) => void \| Promise`                     |            | Enables Delete (asks for confirmation)        |
| `canEdit`       | `(comment) => boolean`                        | own        | Who may edit                                  |
| `canDelete`     | `(comment) => boolean`                        | own        | Who may delete                                |
| `maxDepth`      | `number`                                      | `3`        | Indented levels; deeper replies line up       |
| `thaana`        | `boolean \| ThaanaOptions`                    |            | Thaana typing in the composer (with a toggle) |
| `title`         | `ReactNode \| null`                           | "Comments" | Heading; `null` hides it                      |
| `now`           | `Date`                                        | live       | Reference time for relative dates             |
| `classNames`    | `{ list, comment, body, composer }`           |            | Classes for each part                         |

## Accessibility

- Each comment is an `<article>` named after its author; replies are nested lists.
- Reply opens a composer and moves focus into it; <kbd>Escape</kbd> or Cancel returns focus to the Reply button. Edit works the same way.
- Delete asks for confirmation in an alert dialog; focus returns to the delete button.

| Key                                           | Action                              |
| --------------------------------------------- | ----------------------------------- |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> | Send                                |
| <kbd>Escape</kbd>                             | Cancel a reply or edit              |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>  | Switch Thaana/Latin (with `thaana`) |

## RTL and Thaana

Bodies use `dir="auto"`, so Dhivehi comments align right even on an English page. Reply lines are on the inline start.

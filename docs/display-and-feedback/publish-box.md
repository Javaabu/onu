---
title: PublishBox
sidebar_position: 14
---

The "Publish" panel of a content editor: status, visibility and publish date, with **Preview**, **Save draft** and **Publish** actions. The primary button reads **Schedule** for a future date and **Update** once published. Fits a sidebar; the buttons stack in narrow containers.

```tsx
import { PublishBox } from "@javaabu/onu"
;<PublishBox
  status={post.status}
  onStatusChange={setStatus}
  visibility={post.visibility}
  onVisibilityChange={setVisibility}
  publishAt={post.published_at}
  onPublishAtChange={setPublishedAt}
  previewHref={`/news/${post.slug}?preview=1`}
  onSaveDraft={() => save({ status: "draft" })}
  onPublish={() => save({ status: "published" })}
/>
```

Returning a promise from `onSaveDraft` / `onPublish` shows a spinner on that button and disables both until it settles.

Without the `on…Change` handlers each row is read-only (a status badge, an icon + label, a formatted date or "Immediately").

## Props

| Prop                 | Type                                                           | Default                   | Description                                     |
| -------------------- | -------------------------------------------------------------- | ------------------------- | ----------------------------------------------- |
| `status`             | `'draft' \| 'pending' \| 'scheduled' \| 'published' \| string` |                           | Current status                                  |
| `onStatusChange`     | `(status) => void`                                             |                           | Show a status select                            |
| `statusOptions`      | `{ value, label }[]`                                           | draft, pending, published | Select options                                  |
| `statusMap`          | `StatusMap`                                                    |                           | Badge tones/labels for custom statuses          |
| `visibility`         | `'public' \| 'private' \| string`                              |                           | Shows the visibility row when set               |
| `onVisibilityChange` | `(visibility) => void`                                         |                           | Show a visibility select                        |
| `visibilityOptions`  | `{ value, label }[]`                                           | public, private           | Select options                                  |
| `publishAt`          | `Date \| string \| number \| null`                             |                           | Publish date                                    |
| `onPublishAtChange`  | `(date \| null) => void`                                       |                           | Show a date-time field                          |
| `renderDateInput`    | `({ id, value, onChange }) => ReactNode`                       |                           | Use your own picker (e.g. Onu's DateTimePicker) |
| `previewHref`        | `string`                                                       |                           | Preview link (opens a new tab)                  |
| `onPreview`          | `() => void`                                                   |                           | Preview button                                  |
| `onSaveDraft`        | `() => void \| Promise`                                        |                           | Save draft button (hidden once published)       |
| `onPublish`          | `() => void \| Promise`                                        |                           | Publish / Schedule / Update button              |
| `busy`               | `'draft' \| 'publish' \| null`                                 | automatic                 | Force a busy state                              |
| `disabled`           | `boolean`                                                      | `false`                   | Disable every control                           |
| `title`              | `ReactNode`                                                    | "Publish"                 | Card title                                      |
| `classNames`         | `{ header, content, footer, row }`                             |                           | Classes for each part                           |

## Accessibility

- Every control is labelled; selects follow the shadcn `Select` (listbox) pattern.
- The card has `aria-busy` while an action runs, and the busy button is disabled to prevent double submits.

## RTL and Dhivehi

Labels, statuses and buttons are translated. The date field stays left-to-right.

---
title: LastEditedBy
sidebar_position: 15
---

"Last edited by Aishath Shiuna · 5 minutes ago", with a small avatar. The time is a [RelativeDate](./relative-date), so the exact date shows on hover, focus, or underneath on touch screens.

```tsx
import { LastEditedBy } from "@javaabu/onu"
;<LastEditedBy
  user={{ name: record.editor.name, avatar: record.editor.photo, href: record.editor.url }}
  at={record.updated_at}
/>
```

## Props

| Prop         | Type                               | Default | Description                                  |
| ------------ | ---------------------------------- | ------- | -------------------------------------------- |
| `user`       | `{ name, avatar?, href? } \| null` |         | Who made the change (name links when `href`) |
| `at`         | `Date \| string \| number \| null` |         | When; empty shows "—"                        |
| `hideAvatar` | `boolean`                          | `false` | Hide the avatar                              |
| `dateProps`  | `RelativeDateProps`                |         | Passed to the relative date                  |
| `classNames` | `{ avatar, name, date }`           |         | Classes for each part                        |

## Accessibility

The avatar is decorative (the name is in the text). The sentence is translated as a whole, so word order is right in Dhivehi.

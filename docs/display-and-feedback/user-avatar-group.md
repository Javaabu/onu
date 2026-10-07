---
title: UserAvatarGroup
sidebar_position: 5
---

Overlapping avatars with a "+N" button that lists everyone else. Named `UserAvatarGroup` so shadcn's `AvatarGroup` primitive stays available.

```tsx
import { UserAvatarGroup } from "@javaabu/onu"
;<UserAvatarGroup
  users={[
    { id: 1, name: "Aishath Shiuna", status: "online" },
    { id: 2, name: "Ahmed Ali" },
    { id: 3, name: "މަރިޔަމް ޒާހިރާ", src: "/m.jpg" },
  ]}
  max={4}
/>
```

When there are more than `max` people, `max - 1` avatars are shown followed by "+N". The button opens a popover with the remaining names (tap or keyboard, nothing depends on hover).

## Props

| Prop             | Type                                   | Default | Description                              |
| ---------------- | -------------------------------------- | ------- | ---------------------------------------- |
| `users`          | `{ id?, name, src?, status? }[]`       |         | People to show                           |
| `max`            | `number`                               | `4`     | Avatars shown, including the "+N" button |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Avatar size                              |
| `shape`          | `'circle' \| 'square'`                 |         | Avatar shape                             |
| `renderOverflow` | `(hidden) => ReactNode`                |         | Custom popover content                   |
| `classNames`     | `{ avatar, count, popover }`           |         | Classes for each part                    |

## Accessibility

- The group is a `role="group"` named "{count} people".
- "+N" is a button named "Show N more people"; focus returns to it when the list closes.

| Key                                 | Action                         |
| ----------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the list of hidden people |
| <kbd>Escape</kbd>                   | Close the list                 |

## RTL

Avatars overlap toward the inline end, so the stack reads right to left in RTL.

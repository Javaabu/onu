---
title: ConditionalLink
sidebar_position: 12
---

Renders a link only when there is somewhere to go **and** the user may go there; otherwise renders the same content as plain text. Handy in tables and detail views.

```tsx
import { ConditionalLink } from "@javaabu/onu"

<ConditionalLink href={user.url} when={can("view", user)}>
  {user.name}
</ConditionalLink>

<ConditionalLink href={null}>No profile</ConditionalLink> // plain <span>
```

The link uses the `linkComponent` from `OnuProvider` (R16.2), so it works with Inertia's or Next.js's `Link`.

## Props

| Prop            | Type             | Default  | Description                         |
| --------------- | ---------------- | -------- | ----------------------------------- |
| `href`          | `string \| null` |          | Link target; empty means plain text |
| `when`          | `boolean`        | `true`   | Extra condition (e.g. a permission) |
| `fallbackAs`    | `ElementType`    | `'span'` | Element for the plain-text version  |
| `className`     | `string`         |          | Classes for both versions           |
| `linkClassName` | `string`         |          | Classes for the link version only   |

Other anchor props and `ref` go to the link. Both versions have `data-slot="conditional-link"` and `data-linked="true|false"`.

## Accessibility

Plain text is not focusable, so keyboard users only stop on real links.

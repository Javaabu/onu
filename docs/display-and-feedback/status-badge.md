---
title: StatusBadge
sidebar_position: 2
---

A status pill that always pairs colour with an icon and text, so colour is never the only signal (R14.6). Styled like shadcn's `Badge` with semantic tones.

```tsx
import { StatusBadge } from "@javaabu/onu"

<StatusBadge status="success" />          // ✓ Success
<StatusBadge status="pending">In review</StatusBadge>
```

## Tones

| Tone      | Icon      | Default label |
| --------- | --------- | ------------- |
| `success` | `success` | Success       |
| `warning` | `warning` | Warning       |
| `danger`  | `error`   | Error         |
| `info`    | `info`    | Info          |
| `neutral` | `dot`     | Neutral       |
| `pending` | `clock`   | Pending       |

## Custom statuses

Map your own status values (e.g. from an API) to a tone, label and icon:

```tsx
const statuses: StatusMap = {
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Rejected" },
  paid: { tone: "info", label: "Paid", icon: "credit-card" },
}

<StatusBadge status={application.status} statusMap={statuses} />
```

Unknown statuses fall back to the `neutral` tone with the raw value as the label.

## Props

| Prop        | Type                               | Default | Description                                             |
| ----------- | ---------------------------------- | ------- | ------------------------------------------------------- |
| `status`    | `StatusTone \| string`             |         | A tone or a key of `statusMap`                          |
| `statusMap` | `Record<string, StatusDefinition>` |         | `{ tone, label?, icon? }` per status                    |
| `children`  | `ReactNode`                        |         | Label override                                          |
| `icon`      | `string \| ReactNode \| false`     |         | Icon override; `false` hides it                         |
| `size`      | `'sm' \| 'md' \| 'lg'`             | `'md'`  | Size                                                    |
| `asChild`   | `boolean`                          | `false` | Render your element (e.g. a link) with the badge styles |

Variants are exported as `statusBadgeVariants` (`tone`, `size`). The root has `data-slot="status-badge"`, `data-tone` and `data-status`.

## Accessibility

- The text label is always present; the icon is decorative.
- Not interactive unless you render a link or button with `asChild`.

## RTL and Dhivehi

Default labels are translated. The icon sits at the inline start in both directions.

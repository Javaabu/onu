---
title: RequiredMarker
sidebar_position: 5
---

The `*` shown after a required field's label. [`FormField`](./form-field) adds it when `required` is set.

```tsx
import { RequiredMarker } from '@javaabu/onu';

<label>Name <RequiredMarker /></label>
<RequiredMarker symbol="(required)" />
```

| Prop     | Type     | Default | Description |
| -------- | -------- | ------- | ----------- |
| `symbol` | `string` | `*`     | Marker text |

The marker is hidden from screen readers (`aria-hidden`); mark the control itself with `required` / `aria-required`.

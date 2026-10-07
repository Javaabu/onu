---
title: FieldErrors
sidebar_position: 6
---

Error messages for one field, each with an error icon. [`FormField`](./form-field) renders it for you.

```tsx
import { FieldErrors } from '@javaabu/onu';

<FieldErrors errors={['The name field is required.']} />
<FieldErrors errors={errors.name} firstOnly />
```

| Prop        | Type                 | Default | Description                 |
| ----------- | -------------------- | ------- | --------------------------- |
| `errors`    | `string \| string[]` |         | Messages to show            |
| `firstOnly` | `boolean`            | `false` | Show only the first message |

The container is a polite live region, so new errors are announced. Give it an `id` and reference it from the control's `aria-describedby`.

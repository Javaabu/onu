# Label

shadcn's `Label` with a required marker or an "(optional)" note. [`FormField`](./form-field.md) renders labels for you; use `Label` for custom layouts.

```tsx
import { Label } from "@javaabu/onu"

<Label htmlFor="name" required>Name</Label>
<Label htmlFor="nickname" optional>Nickname</Label>
```

The shadcn primitive is still available from `@javaabu/onu/primitives`.

## Props

| Prop       | Type      | Default | Description                                   |
| ---------- | --------- | ------- | --------------------------------------------- |
| `required` | `boolean` | `false` | Adds the [required marker](./required-marker.md) |
| `optional` | `boolean` | `false` | Adds a muted "(optional)" note                |
| `invalid`  | `boolean` | `false` | Destructive colour                            |

All Radix `Label.Root` props are passed through.

## Accessibility

The marker is `aria-hidden`; mark the control itself `required`. The optional note is read as part of the label. Both strings are translated (`form.optional`).

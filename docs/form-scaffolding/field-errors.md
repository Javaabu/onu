# FieldErrors

Error messages for one field, each with an error icon. [`FormField`](./form-field.md) renders it for you.

```tsx
import { FieldErrors } from '@javaabu/onu';

<FieldErrors errors={['The name field is required.']} />
<FieldErrors errors={errors.name} firstOnly />
```

## Props

| Prop        | Type                         | Default | Description                                     |
| ----------- | ---------------------------- | ------- | ----------------------------------------------- |
| `errors`    | `string \| string[] \| null` |         | Messages to show; empty strings are skipped     |
| `firstOnly` | `boolean`                    | `false` | Show only the first message                     |
| `className` | `string`                     |         | Container classes (destructive text by default) |

Other `<div>` props (such as `id`) are passed to the container. With no messages the container stays mounted and empty.

## Accessibility

The container is a polite live region (`aria-live="polite"`) that stays mounted, so errors that appear after a submit are announced without moving focus. The icon before each message is decorative (`aria-hidden`); the text carries the meaning, so an error is never shown by colour alone.

Give the container an `id`, reference it from the control's `aria-describedby` and set `aria-invalid` on the control. [`FormField`](./form-field.md) does all three for you.

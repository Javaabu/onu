---
title: EmailInput
sidebar_position: 2
---

An email address input. It sets `type="email"`, `inputMode="email"` (the email keyboard on phones) and `autocomplete="email"`, turns off auto-capitalisation and spell check, and is always left-to-right, even on a Dhivehi page. Built on [`TextInput`](./text-input).

```tsx
import { EmailInput } from "@javaabu/onu"

;<EmailInput placeholder="aishath@example.mv" />
```

Inside a [`FormField`](../form-scaffolding/form-field):

```tsx
<FormField label="Email" name="email" required>
  <EmailInput showIcon />
</FormField>
```

For a sign-in form, pass `autoComplete="username"` so password managers pair it with the password field.

## Props

| Prop           | Type                                    | Default   | Description                                       |
| -------------- | --------------------------------------- | --------- | ------------------------------------------------- |
| `showIcon`     | `boolean`                               | `false`   | Show a mail icon at the inline start              |
| `autoComplete` | `string`                                | `"email"` | Autofill hint, e.g. `"username"` on sign-in forms |
| `startAddon`   | `ReactNode`                             |           | Content before the input (replaces the icon)      |
| `endAddon`     | `ReactNode`                             |           | Content after the input                           |
| `classNames`   | `{ root, input, startAddon, endAddon }` |           | Classes for each part                             |

All other `<input>` props are passed through, and `ref` points at the `<input>`. `type`, `thaana` and `thaanaToggle` are not accepted.

## RTL and Thaana

The input is forced to `dir="ltr"` (R11.7): email addresses are Latin, so the caret and text stay left-to-right inside an RTL form. It has no `thaana` prop.

## Accessibility

- Give it a label with `FormField`, a `<label>` or `aria-label`.
- Errors from the `FormField` set `aria-invalid` and are linked with `aria-describedby`.

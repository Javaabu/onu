---
title: Form layout & errors
sidebar_position: 3
---

Providers that configure every [`FormField`](./form-field) inside them.

## FormLayoutProvider

Sets the label layout and disabled state for a group of fields. Nested providers override outer ones; a field's own props override both.

```tsx
import { FormLayoutProvider } from "@javaabu/onu"

;<FormLayoutProvider labelLayout="inline" disabled={processing}>
  …
</FormLayoutProvider>
```

## FormErrorsProvider

Provides server-side validation errors by field name. Accepts Laravel's 422 `errors` object: keys in dot notation, values as a string or an array of strings.

```tsx
import { FormErrorsProvider } from "@javaabu/onu"

;<FormErrorsProvider errors={{ email: ["The email has already been taken."] }}>
  <FormField label="Email" name="email">
    <TextInput />
  </FormField>
</FormErrorsProvider>
```

Field names in bracket notation (`items[0][name]`) are matched to dot notation (`items.0.name`).

## Helpers

| Export                      | Description                              |
| --------------------------- | ---------------------------------------- |
| `useLabelLayout(explicit?)` | Effective label layout for a field       |
| `useFormDisabled()`         | Disabled state from the nearest provider |
| `useFieldErrors(name)`      | Server errors for a field name           |
| `toDotNotation(name)`       | `items[0][name]` → `items.0.name`        |

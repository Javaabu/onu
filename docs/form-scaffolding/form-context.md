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

[`Form`](./form), [`FormGroup`](./form-group) and [`Fieldset`](./fieldset) render one for their `labelLayout` and `disabled` props, so you rarely need it directly.

### Props

| Prop          | Type                    | Default                            | Description                         |
| ------------- | ----------------------- | ---------------------------------- | ----------------------------------- |
| `labelLayout` | `"stacked" \| "inline"` | outer provider, then `OnuProvider` | Label layout for every field inside |
| `disabled`    | `boolean`               | outer provider, then `false`       | Disables every field inside         |
| `children`    | `ReactNode`             |                                    |                                     |

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

Field names in bracket notation (`items[0][name]`) are matched to dot notation (`items.0.name`). A field's own `error` prop is shown first, then the server errors for its `name`. [`Form`](./form) renders this provider for its `errors` prop.

### Props

| Prop       | Type                                                      | Default | Description                                 |
| ---------- | --------------------------------------------------------- | ------- | ------------------------------------------- |
| `errors`   | `Record<string, string \| string[] \| undefined> \| null` |         | Errors keyed by field name, in dot notation |
| `children` | `ReactNode`                                               |         |                                             |

## Helpers

| Export                      | Description                              |
| --------------------------- | ---------------------------------------- |
| `useLabelLayout(explicit?)` | Effective label layout for a field       |
| `useFormDisabled()`         | Disabled state from the nearest provider |
| `useFieldErrors(name)`      | Server errors for a field name           |
| `toDotNotation(name)`       | `items[0][name]` → `items.0.name`        |

## Accessibility

The providers render no markup; they only change what each [`FormField`](./form-field) renders:

- **Errors.** A field with server errors gets `aria-invalid="true"` and its messages in a polite live region linked with `aria-describedby`, so they are read with the field and announced when they arrive. The providers do not move focus; [`Form`](./form) focuses the first invalid field when errors arrive.
- **Disabled.** `disabled` sets the native `disabled` attribute on every control, which also removes them from the tab order and from form submission. To keep values readable and focusable (for example while a request is in flight), prefer `readOnly` on the controls.
- **Inline labels** stay real `<label>` elements tied to their control, and fall back to stacked in narrow containers, so a narrow column or a zoomed-in page does not squeeze the control.

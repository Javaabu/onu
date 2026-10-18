# FormField

A label, a control, help text and error messages, laid out **stacked** (label above) or **inline** (label beside). Inline labels fall back to stacked when the field is narrow.

```tsx
import { FormField, TextInput } from "@javaabu/onu"

;<FormField label="Email" name="email" help="We'll send the receipt here." required>
  <TextInput type="email" />
</FormField>
```

The control inside receives `id`, `name`, `aria-describedby` (help and errors), `aria-invalid`, `aria-required`, `required` and `disabled`. Props set directly on the control win.

## Label layouts

```tsx
<FormField label="Name" labelLayout="inline">…</FormField>

// For a whole form or section
<FormLayoutProvider labelLayout="inline">…</FormLayoutProvider>

// For the whole app
<OnuProvider labelLayout="inline">…</OnuProvider>
```

The inline label column is `--onu-label-width` wide (12rem by default). Below about 28rem of container width the field stacks. In RTL the label sits on the right.

## Errors

Pass `error` directly, or provide server errors to every field by `name` with `FormErrorsProvider`. Laravel's 422 `errors` object works as is, including array fields:

```tsx
<FormErrorsProvider errors={errors /* e.g. Inertia's usePage().props.errors */}>
  <FormField label="Item" name="items[0][name]">
    {" "}
    {/* reads errors["items.0.name"] */}
    <TextInput />
  </FormField>
</FormErrorsProvider>
```

## Props

| Prop          | Type                              | Default              | Description                                              |
| ------------- | --------------------------------- | -------------------- | -------------------------------------------------------- |
| `label`       | `ReactNode`                       |                      | Visible label                                            |
| `name`        | `string`                          |                      | Field name; wires `name` and server errors               |
| `id`          | `string`                          | generated            | Control id                                               |
| `help`        | `ReactNode`                       |                      | Help text under the control                              |
| `error`       | `string \| string[]`              |                      | Error message(s), merged with server errors              |
| `required`    | `boolean`                         | `false`              | Shows the required marker and sets `aria-required`       |
| `disabled`    | `boolean`                         | from form            | Disables the control                                     |
| `labelLayout` | `'stacked' \| 'inline'`           | from form / provider | Label layout                                             |
| `hideLabel`   | `boolean`                         | `false`              | Hide the label visually, keep it for screen readers      |
| `labelAside`  | `ReactNode`                       |                      | Content beside the label, e.g. a "Forgot password?" link |
| `classNames`  | `{ label, control, help, error }` |                      | Classes for each part                                    |

## Hooks

- `useFormField()`: the current field (`id`, `invalid`, `required`, …) or `null`.
- `useFormFieldControl(props)`: the props a custom control should spread to be wired to the field.

## Accessibility

- The label is a real `<label for>`; help and errors are linked with `aria-describedby`.
- Errors are announced in a polite live region.
- The required marker is hidden from screen readers; the control carries `aria-required`.

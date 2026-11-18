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

## Building blocks

`FormField` renders these for you. Use them directly when you build a custom layout, and wire them up yourself: give help and errors an `id`, point the control's `aria-describedby` at them, and set `aria-invalid` and `required` on the control.

```tsx
import { FieldErrors, HelpText, Label, RequiredMarker } from "@javaabu/onu"

<Label htmlFor="name" required>Name</Label>
<input id="name" required aria-invalid={!!errors.name} aria-describedby="name-help name-errors" />
<HelpText id="name-help">As shown on your ID card.</HelpText>
<FieldErrors id="name-errors" errors={errors.name} />

<label>Mobile number <RequiredMarker /></label>
```

### Label

shadcn's `Label` with a required marker or an "(optional)" note. The shadcn primitive is still available from `@javaabu/onu/primitives`.

```tsx
<Label htmlFor="name" required>Name</Label>
<Label htmlFor="nickname" optional>Nickname</Label>
```

#### Label props

| Prop       | Type      | Default | Description                                      |
| ---------- | --------- | ------- | ------------------------------------------------ |
| `required` | `boolean` | `false` | Adds the [required marker](#requiredmarker)      |
| `optional` | `boolean` | `false` | Adds a muted "(optional)" note (`form.optional`) |
| `invalid`  | `boolean` | `false` | Destructive colour                               |

All Radix `Label.Root` props are passed through.

### HelpText

Supporting text under a control: a `<p>` in `text-sm text-muted-foreground`. Every `<p>` prop is passed through, including `id` and `ref`.

### RequiredMarker

The `*` after a required field's label.

```tsx
<RequiredMarker symbol="(required)" />
```

#### RequiredMarker props

| Prop        | Type     | Default | Description                                |
| ----------- | -------- | ------- | ------------------------------------------ |
| `symbol`    | `string` | `"*"`   | Marker text                                |
| `className` | `string` |         | Merged with the default `text-destructive` |

Every other `<span>` prop is passed through.

### FieldErrors

Error messages for one field, each with an error icon.

```tsx
<FieldErrors errors={["The name field is required."]} />
<FieldErrors errors={errors.name} firstOnly />
```

#### FieldErrors props

| Prop        | Type                         | Default | Description                                     |
| ----------- | ---------------------------- | ------- | ----------------------------------------------- |
| `errors`    | `string \| string[] \| null` |         | Messages to show; empty strings are skipped     |
| `firstOnly` | `boolean`                    | `false` | Show only the first message                     |
| `className` | `string`                     |         | Container classes (destructive text by default) |

Other `<div>` props (such as `id`) are passed to the container. With no messages the container stays mounted and empty.

## Accessibility

- The label is a real `<label for>`; help and errors are linked with `aria-describedby`, so screen readers read the label, then the help, then any errors.
- Put what users need before typing (formats, limits) in help text rather than in a placeholder, which disappears on input and is not reliably read.
- Errors sit in a polite live region (`aria-live="polite"`) that stays mounted, so errors that appear after a submit are announced without moving focus. The icon before each message is decorative; the text carries the meaning, so an error is never shown by colour alone.
- The required marker is hidden from screen readers (`aria-hidden`), so a label is not read as "Name star"; the control carries `required` / `aria-required`, which is announced as "required". The marker has a translated tooltip (`common.required`) for mouse users. `FormField` sets both; `Label` only adds the marker, so set `required` on your control yourself. On long forms, explain the `*` once at the top.
- The "(optional)" note is read as part of the label.

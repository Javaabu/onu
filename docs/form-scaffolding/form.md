# Form

A `<form>` that handles the boring parts: label layout for every field, disabling fields while saving, server validation errors (Laravel 422) under each field, an error summary at the top, and moving focus to the first invalid field. Works on its own, with Inertia, or with [react-hook-form](https://react-hook-form.com).

```tsx
import { Form, FormField, SubmitButton, TextInput } from "@javaabu/onu"

;<Form onSubmit={(values) => api.post("/users", values)} labelLayout="inline">
  <FormField label="Name" name="name" required>
    <TextInput />
  </FormField>
  <FormField label="Email" name="email" required>
    <TextInput type="email" />
  </FormField>
  <SubmitButton>Save</SubmitButton>
</Form>
```

## Submitting

`onSubmit(values, event)` gets the form's values: from react-hook-form when `form` is set, otherwise from `FormData` (repeated names such as `tags[]` become arrays). It may return a promise; until it settles:

- the form is `aria-busy`, every field is disabled (`disableWhileProcessing`), and
- `SubmitButton` shows a spinner and ignores clicks, so the form cannot be submitted twice.

Without `onSubmit` the form submits natively (`action` / `method`).

## Validation errors

When `onSubmit` throws or rejects with a Laravel validation error, the form:

1. shows each message under its field (fields are matched by `name`, so `items[0][name]` reads `items.0.name`);
2. moves focus to the first invalid field (opening a collapsed [`Fieldset`](./fieldset.md) if needed);
3. shows the [error summary](./validation-summary.md) at the top, with a link to every field.

These all count as a validation error:

```ts
throw { message: "…", errors: { email: ["The email has already been taken."] } } // the 422 body
throw axiosError // error.response.data is the 422 body
throw response // a fetch Response with status 422 (the JSON body is read)
throw new ValidationError({ email: "Taken" }) // no HTTP client needed
```

Any other error shows "The form could not be submitted." in the summary. Editing a field clears its server error. `onError(error, payload)` and `onSuccess(result)` are called after each attempt.

### Inertia

Pass Inertia's state straight through. New `errors` move focus to the first invalid field.

```tsx
const form = useForm({ name: "", email: "" })

<Form onSubmit={() => form.post("/users")} errors={form.errors} processing={form.processing}>
  …
</Form>
```

### react-hook-form

Pass the `useForm()` result as `form`. The form renders `FormProvider`, submits through `handleSubmit`, shows react-hook-form's errors in fields and in the summary, and maps server errors with `setError`.

```tsx
const form = useForm<Values>({ resolver: zodResolver(schema) })

<Form form={form} onSubmit={(values) => api.put(`/users/${id}`, values)}>
  <FormField label="Title" name="title">
    <TextInput {...form.register("title")} />
  </FormField>
  <SubmitButton />
</Form>
```

## Props

| Prop                     | Type                                 | Default   | Description                                                                 |
| ------------------------ | ------------------------------------ | --------- | --------------------------------------------------------------------------- |
| `onSubmit`               | `(values, event) => unknown`         |           | Submit handler; may return a promise. Without it the form submits natively. |
| `form`                   | `UseFormReturn`                      |           | react-hook-form integration                                                 |
| `errors`                 | `Record<string, string \| string[]>` |           | Server errors (e.g. Inertia `form.errors`), merged with errors from submit  |
| `processing`             | `boolean`                            |           | Processing state from outside (e.g. Inertia `form.processing`)              |
| `labelLayout`            | `'stacked' \| 'inline'`              | provider  | Label layout for every field                                                |
| `disabled`               | `boolean`                            | `false`   | Disable every field                                                         |
| `disableWhileProcessing` | `boolean`                            | `true`    | Disable fields while processing                                             |
| `summary`                | `boolean`                            | `true`    | Show the error summary at the top                                           |
| `summaryTitle`           | `ReactNode`                          | generated | Summary heading                                                             |
| `focusOnError`           | `boolean`                            | `true`    | Focus the first invalid field when errors arrive                            |
| `onSuccess`              | `(result) => void`                   |           | After `onSubmit` resolves                                                   |
| `onError`                | `(error, payload \| null) => void`   |           | After `onSubmit` fails; `payload` is the validation body, if any            |
| `classNames`             | `{ summary }`                        |           | Classes for the summary                                                     |

All other `<form>` props are passed through, and `ref` points at the `<form>`. The form has `data-status="idle | submitting | success | error"`.

## Hooks and helpers

- `useOnuForm()`: `{ processing, status, errors, formError, setErrors(errors, message?), formRef }` of the nearest `Form`, or `null`.
- `getValidationErrors(value)` / `readValidationErrors(value)` (async, also reads a fetch `Response`): find a `{ message, errors }` payload in a thrown value.
- `isValidationPayload(value)`, `ValidationError`, `flattenFieldErrors(rhfErrors)`, `findField(root, name)`, `focusField(el)`, `focusFirstInvalid(root, errors)`, `formDataToObject(formData)`.

## Accessibility

- The summary is a `role="alert"` region; each error is a link that focuses its field.
- Fields carry `aria-invalid` and `aria-describedby` pointing at their messages.
- While processing the form is `aria-busy` and the submit button is `aria-busy` + `aria-disabled` (it keeps focus).

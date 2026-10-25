---
title: Forms & Laravel validation
sidebar_position: 12
---

Onu's form components are built around Laravel's conventions, so server validation errors show up under the right fields with no glue code.

# Fields

Wrap every control in a [`FormField`](../form-scaffolding/form-field). Give it the input's `name` (bracket notation is fine) and it wires the label, help text, errors and ARIA attributes:

```tsx
<FormField label="Name" name="name" required help="As shown on your ID card">
    <TextInput thaana />
</FormField>
```

Labels are stacked by default. Use `labelLayout="inline"` on a field, a [`Form`](../form-scaffolding/form), a `FormLayoutProvider` or `OnuProvider` to put labels beside the controls; they stack again in narrow containers.

# Validation errors

Laravel returns validation errors as a 422 response:

```json
{
    "message": "The email has already been taken.",
    "errors": { "email": ["The email has already been taken."], "items.0.name": ["The name field is required."] }
}
```

[`Form`](../form-scaffolding/form) understands this shape wherever it comes from — the thrown body, an axios error, a fetch `Response`, or Inertia's `errors` prop — and then:

1. shows each message under its field (`items[0][name]` matches `items.0.name`);
2. focuses the first invalid field, opening collapsed sections if needed;
3. shows an [error summary](../form-scaffolding/validation-summary) with links to every field.

```tsx
<Form onSubmit={(values) => axios.post('/applications', values)}>
    …
    <SubmitButton>Submit</SubmitButton>
</Form>
```

Without `Form`, provide errors to a section with `FormErrorsProvider`.

# Inertia

```tsx
import { useForm } from '@inertiajs/react';

const form = useForm({ name: '', email: '' });

<Form onSubmit={() => form.post('/users')} errors={form.errors} processing={form.processing}>
    <FormField label="Name" name="name">
        <TextInput value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
    </FormField>
    <SubmitButton>Save</SubmitButton>
</Form>
```

# Plain HTML forms

Every input renders a real form field with a Laravel-friendly `name`, so a normal `<form method="post">` submits what Laravel expects:

| Component | Submitted as |
|---|---|
| Date picker | `due_date=2026-03-12` |
| Date range | `period[from]`, `period[to]` |
| Multi-select, tags | `tags[]` |
| Map picker | `location[lat]`, `location[lng]` |
| Repeating group | `items[0][name]`, `items[1][name]` |
| Rich text editor | HTML in a hidden input (`""` when empty, so `required` works) |
| Custom attribute fields | `attributes[key]`, booleans as `1`/`0` |

# Unsaved changes and the save bar

On edit pages, the [`SaveBar`](../form-scaffolding/save-bar) lists each change in plain words, keeps Save disabled until something changed, offers Discard, and warns before leaving with unsaved changes ([`useUnsavedChangesGuard`](../form-scaffolding/unsaved-changes-guard)).

# API-backed selects

[`ApiSelect`](../choice-inputs/api-select) reads Laravel API resources and paginators with no configuration: it sends `search`, `page` and `per_page`, reads `data`, and loads the next page as the list scrolls.

```tsx
<FormField label="Island" name="island_id">
    <ApiSelect url="/api/islands" />
</FormField>
```

# Uploads

[`InstantFileUpload`](../files-and-media/dropzone-uploader#compact-input-instant-upload) (`DropzoneUploader` with `appearance="input"`) uploads as soon as a file is chosen, sends your CSRF header, shows progress, and reads 422 errors from the upload endpoint. The uploaded file's id goes into a hidden input for the main form.

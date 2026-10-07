---
title: SubmitButton
sidebar_position: 16
---

A `type="submit"` [`Button`](./button) that shows a spinner while the form is processing and ignores clicks until it finishes, so a form can't be submitted twice.

```tsx
import { Form, SubmitButton } from "@javaabu/onu"

<Form onSubmit={save}>
  …
  <SubmitButton>Save</SubmitButton>
</Form>

// Outside an Onu Form, or with Inertia
<SubmitButton processing={form.processing}>Save</SubmitButton>
```

Inside a [`Form`](./form) it follows the form's processing state automatically. The default label is "Submit" (translated).

## Props

| Prop         | Type      | Default     | Description                        |
| ------------ | --------- | ----------- | ---------------------------------- |
| `processing` | `boolean` | from `Form` | Show the spinner and block submits |

All [`Button`](./button) props except `type` and `loading` are supported (`variant`, `size`, `startIcon`, `loadingText`, …).

## Accessibility

While processing: `aria-busy="true"` and `aria-disabled="true"`. The button stays focusable (it is not `disabled`), so keyboard focus is not lost mid-submit.

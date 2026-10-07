---
title: PlaceholderInput
sidebar_position: 3
---

A skeleton shaped like a form field (label, control and optional help text), for forms whose values are still loading. It follows the same stacked/inline [label layout](../form-scaffolding/form-field) as `FormField`, so the page doesn't jump when the real fields arrive.

```tsx
import { FormField, PlaceholderInput, TextInput } from "@javaabu/onu"

function ProfileForm({ user, loading }: Props) {
  if (loading) {
    return (
      <>
        <PlaceholderInput />
        <PlaceholderInput control="textarea" help />
        <PlaceholderInput control="switch" />
      </>
    )
  }
  return (
    <FormField label="Full name">
      <TextInput defaultValue={user.name} />
    </FormField>
  )
}
```

## Props

| Prop          | Type                                                          | Default         | Description                    |
| ------------- | ------------------------------------------------------------- | --------------- | ------------------------------ |
| `control`     | `'input' \| 'textarea' \| 'select' \| 'checkbox' \| 'switch'` | `'input'`       | Shape of the control           |
| `label`       | `boolean`                                                     | `true`          | Show a label placeholder       |
| `help`        | `boolean`                                                     | `false`         | Show a help-text placeholder   |
| `labelLayout` | `'stacked' \| 'inline'`                                       | form / provider | Label layout, like `FormField` |
| `srLabel`     | `string`                                                      | "Loading…"      | Screen-reader text             |
| `className`   | `string`                                                      |                 | Classes for the root           |
| `classNames`  | `{ label, control, help }`                                    |                 | Classes for each part          |

Checkboxes and switches keep their label-beside-control shape in both layouts (R3.34). Inline layout falls back to stacked in narrow containers, like `FormField`. Controls are 44px tall on touch screens, matching the real inputs.

## Accessibility

Each placeholder is a `role="status"` region named "Loading…" (translated) with `aria-hidden` shapes. When many fields load together, consider one `LoadingOverlay` or a single status message for the form instead.

## RTL

The label column sits on the inline start (right in RTL), as in `FormField`.

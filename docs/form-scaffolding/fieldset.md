---
title: Fieldset / FormSection
sidebar_position: 3.4
---

A titled section of a form: a real `<fieldset>` with a `<legend>`, an optional description, and an optional collapse toggle. `FormSection` is an alias.

```tsx
import { Fieldset, FormField, TextInput } from "@javaabu/onu"

;<Fieldset legend="Permanent address" description="As registered with the Department of National Registration.">
  <FormField label="Island" name="island">
    <TextInput />
  </FormField>
</Fieldset>
```

## Collapsible

```tsx
<Fieldset legend="Advanced settings" collapsible defaultOpen={false}>
  …
</Fieldset>
```

The legend becomes a toggle button. A collapsed section stays in the DOM, so its fields are still submitted, and it opens itself when one of its fields needs focus: a native `invalid` event, a link in the [error summary](./validation-summary), or [`Form`](./form) focusing the first invalid field. Custom containers can do the same by listening for the `onu:reveal` event.

## Variants

`plain` (default), `card` (bordered card) and `separated` (a rule above every section but the first). `fieldsetVariants` is exported.

## Props

| Prop           | Type                                        | Default   | Description                                          |
| -------------- | ------------------------------------------- | --------- | ---------------------------------------------------- |
| `legend`       | `ReactNode`                                 |           | Section title                                        |
| `description`  | `ReactNode`                                 |           | Text under the title, linked with `aria-describedby` |
| `variant`      | `'plain' \| 'card' \| 'separated'`          | `plain`   | Look                                                 |
| `collapsible`  | `boolean`                                   | `false`   | Show / hide toggle                                   |
| `defaultOpen`  | `boolean`                                   | `true`    | Initial state when collapsible                       |
| `open`         | `boolean`                                   |           | Controlled state                                     |
| `onOpenChange` | `(open: boolean) => void`                   |           | Called when the state changes                        |
| `labelLayout`  | `'stacked' \| 'inline'`                     | inherited | Label layout for the fields inside                   |
| `disabled`     | `boolean`                                   | inherited | Disables every control inside (native)               |
| `hideLegend`   | `boolean`                                   | `false`   | Hide the legend visually                             |
| `classNames`   | `{ legend, description, content, trigger }` |           | Classes for each part                                |

## Accessibility

- Screen readers announce the legend when focus enters the section.
- The collapse toggle is a button with `aria-expanded` and `aria-controls`.

| Key                                 | Action                         |
| ----------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Expand or collapse the section |

## RTL

The chevron sits at the inline end; the legend aligns to the inline start.

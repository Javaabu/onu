---
title: Checkbox
sidebar_position: 8
---

shadcn's checkbox plus a label, description and an indeterminate (mixed) state. Without `label` it renders just the box, exactly like the primitive.

```tsx
import { Checkbox } from '@javaabu/onu';

<Checkbox label="Send me SMS updates" description="We text you when your status changes." />
<Checkbox label="All utilities" checked={all} indeterminate={some} onCheckedChange={toggleAll} />
<Checkbox aria-label="Select row" size="sm" />
```

## Props

All Radix checkbox props (`checked`, `defaultChecked`, `onCheckedChange`, `name`, `value`, `required`, `disabled`), plus:

| Prop            | Type                           | Default     | Description                                    |
| --------------- | ------------------------------ | ----------- | ---------------------------------------------- |
| `label`         | `ReactNode`                    |             | Clickable label beside the box                 |
| `description`   | `ReactNode`                    |             | Secondary text (wired to `aria-describedby`)   |
| `indeterminate` | `boolean`                      |             | Mixed state; same as `checked="indeterminate"` |
| `labelPosition` | `"end" \| "start"`             | `"end"`     | Label after or before the box                  |
| `size`          | `"sm" \| "default" \| "lg"`    | `"default"` | Box size (`checkboxVariants`)                  |
| `className`     | `string`                       |             | Classes for the **box** (as in shadcn)         |
| `classNames`    | `{ root, label, description }` |             | Wrapper, label and description                 |

:::info

`Checkbox` replaces shadcn's primitive in the main export and is API-compatible with it; the primitive is still available from `@javaabu/onu/primitives`.

:::

## Accessibility

A `checkbox` with `aria-checked="mixed"` when indeterminate. Space toggles. The hit area grows to 44px on touch screens. Inside a [`FormField`](../form-scaffolding/form-field) it picks up `name`, errors and `required`.

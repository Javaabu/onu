---
title: Textarea
sidebar_position: 12
---

A multi-line text input that grows with its content, with [Thaana](../guides/thaana-input) support and an optional character counter.

```tsx
import { Textarea } from '@javaabu/onu';

<Textarea placeholder="Remarks" />
<Textarea thaana thaanaToggle />
<Textarea showCount maxLength={500} />
<Textarea autoResize={false} rows={6} />
```

## Props

| Prop           | Type                         | Default | Description                                         |
| -------------- | ---------------------------- | ------- | --------------------------------------------------- |
| `thaana`       | `boolean \| ThaanaOptions`   | `false` | Type Thaana from a Latin keyboard                   |
| `thaanaToggle` | `boolean`                    | `false` | Show a Thaana/Latin toggle                          |
| `autoResize`   | `boolean`                    | `true`  | Grow with the content (`field-sizing: content`)     |
| `showCount`    | `boolean`                    | `false` | Show a character counter; uses `maxLength` when set |
| `classNames`   | `{ root, textarea, footer }` |         | Classes for each part                               |

All other `<textarea>` props are passed through, and `ref` points at the `<textarea>`.

:::info

`Textarea` replaces shadcn's primitive of the same name in the main export. The plain primitive is still available from `@javaabu/onu/primitives`.

:::

## Accessibility

The counter is announced politely as it changes. Wrap the textarea in a [`FormField`](../form-scaffolding/form-field) or give it a label.

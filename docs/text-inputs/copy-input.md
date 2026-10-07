---
title: CopyInput
sidebar_position: 5
---

A read-only value with a copy button: share links, reference numbers, account numbers. Focusing the input selects the whole value, and the copy button announces "Copied".

```tsx
import { CopyInput } from "@javaabu/onu"

;<FormField label="Share link">
  <CopyInput value="https://portal.gov.mv/track/REF-2026-00451" />
</FormField>

<CopyInput value="REF-2026-00451" mono onCopy={() => toast.success("Copied")} />
```

The clipboard API is used where available, with an `execCommand("copy")` fallback for older browsers and non-secure contexts.

## Props

| Prop         | Type                                    | Default | Description                           |
| ------------ | --------------------------------------- | ------- | ------------------------------------- |
| `value`      | `string`                                |         | The value to show and copy (required) |
| `onCopy`     | `(value: string) => void`               |         | Called after a successful copy        |
| `mono`       | `boolean`                               | `false` | Use the monospace font                |
| `endAddon`   | `ReactNode`                             |         | Extra content before the copy button  |
| `classNames` | `{ root, input, startAddon, endAddon }` |         | Classes for each part                 |

All other `<input>` props are passed through. The input is always `readOnly`.

## RTL and Thaana

The value keeps the page direction unless you pass `dir` (for example `dir="ltr"` for URLs). No `thaana` prop: the value is not editable.

## Accessibility

- The copy button is named "Copy" (from the locale) and its result, "Copied" or "Could not copy", is announced in a polite live region.
- It is 44px on touch screens.

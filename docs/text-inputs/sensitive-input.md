---
title: SensitiveInput
sidebar_position: 4
---

A read-only display for a secret such as an API key or client secret. It shows only the last few characters (`••••••••7342`), with buttons to reveal the value and to copy it. While masked, the full value is never in the DOM, and the number of dots is fixed so the length is not leaked.

```tsx
import { SensitiveInput } from "@javaabu/onu"

;<FormField label="Live secret key">
  <SensitiveInput value="sk_live_51Hx9aBcDeFgHiJkLmN0pQ7342" />
</FormField>
```

Copy always copies the full secret, even while it is masked. The clipboard API is used where available, with an `execCommand("copy")` fallback for older browsers and non-secure contexts.

## Copy input

With `masked={false}` the value is shown as is, with only the copy button: share links, reference numbers, account numbers. Focusing the input selects the whole value.

`CopyInput` is `SensitiveInput` with `masked={false}`, and it is not monospace unless you pass `mono`.

```tsx
import { CopyInput } from "@javaabu/onu"

;<FormField label="Share link">
  <SensitiveInput masked={false} mono={false} value="https://portal.gov.mv/track/REF-2026-00451" />
</FormField>

<CopyInput value="REF-2026-00451" mono onCopy={() => toast.success("Copied")} />
```

`CopyInput` props:

| Prop         | Type                                    | Default | Description                           |
| ------------ | --------------------------------------- | ------- | ------------------------------------- |
| `value`      | `string`                                |         | The value to show and copy (required) |
| `onCopy`     | `(value: string) => void`               |         | Called after a successful copy        |
| `mono`       | `boolean`                               | `false` | Use the monospace font                |
| `endAddon`   | `ReactNode`                             |         | Extra content before the copy button  |
| `classNames` | `{ root, input, startAddon, endAddon }` |         | Classes for each part                 |

All other `<input>` props are passed through. The input is always `readOnly`.

## Props

| Prop               | Type                                    | Default | Description                                            |
| ------------------ | --------------------------------------- | ------- | ------------------------------------------------------ |
| `value`            | `string`                                |         | The secret (required)                                  |
| `masked`           | `boolean`                               | `true`  | Mask the value; `false` shows it with no reveal button |
| `visibleChars`     | `number`                                | `4`     | Trailing characters shown while masked                 |
| `maskLength`       | `number`                                | `8`     | Number of mask dots                                    |
| `revealed`         | `boolean`                               |         | Controlled reveal state                                |
| `defaultRevealed`  | `boolean`                               | `false` | Initial reveal state                                   |
| `onRevealedChange` | `(revealed: boolean) => void`           |         | Called when the reveal button is pressed               |
| `revealable`       | `boolean`                               | `true`  | Show the reveal button                                 |
| `copyable`         | `boolean`                               | `true`  | Show the copy button                                   |
| `onCopy`           | `(value: string) => void`               |         | Called after a successful copy                         |
| `mono`             | `boolean`                               | `true`  | Use the monospace font                                 |
| `classNames`       | `{ root, input, startAddon, endAddon }` |         | Classes for each part                                  |

Also exported: `maskSecret(value, visibleChars?, maskLength?, maskChar?)`.

## RTL and Thaana

Masked, it is always `dir="ltr"`. With `masked={false}` the value keeps the page direction unless you pass `dir` (for example `dir="ltr"` for URLs). Monospace unless `mono={false}`. No `thaana` prop: the value is not editable.

## Accessibility

- The reveal button (masked only) is named "Show value" and exposes its state with `aria-pressed`; "Value shown" / "Value hidden" is announced.
- The copy button is named "Copy" and announces "Copied" (or "Could not copy") in a polite live region.
- Focusing the input selects its text.
- Buttons are 44px on touch screens.

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

Copy always copies the full secret, even while it is masked.

## Props

| Prop               | Type                                    | Default | Description                              |
| ------------------ | --------------------------------------- | ------- | ---------------------------------------- |
| `value`            | `string`                                |         | The secret (required)                    |
| `visibleChars`     | `number`                                | `4`     | Trailing characters shown while masked   |
| `maskLength`       | `number`                                | `8`     | Number of mask dots                      |
| `revealed`         | `boolean`                               |         | Controlled reveal state                  |
| `defaultRevealed`  | `boolean`                               | `false` | Initial reveal state                     |
| `onRevealedChange` | `(revealed: boolean) => void`           |         | Called when the reveal button is pressed |
| `revealable`       | `boolean`                               | `true`  | Show the reveal button                   |
| `copyable`         | `boolean`                               | `true`  | Show the copy button                     |
| `onCopy`           | `(value: string) => void`               |         | Called after a successful copy           |
| `classNames`       | `{ root, input, startAddon, endAddon }` |         | Classes for each part                    |

Also exported: `maskSecret(value, visibleChars?, maskLength?, maskChar?)`.

## RTL and Thaana

Always `dir="ltr"` and monospace. No `thaana` prop.

## Accessibility

- The reveal button is named "Show value" and exposes its state with `aria-pressed`; "Value shown" / "Value hidden" is announced.
- The copy button is named "Copy" and announces "Copied" (or "Could not copy") in a polite live region.
- Focusing the input selects its text.
- Buttons are 44px on touch screens.

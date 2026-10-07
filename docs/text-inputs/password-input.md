---
title: PasswordInput
sidebar_position: 3
---

A password input with a show/hide button, a Caps Lock warning and an optional strength meter. Built on [`TextInput`](./text-input).

```tsx
import { PasswordInput } from "@javaabu/onu"

;<PasswordInput />
```

## Strength meter

`strength` shows a four-step meter with a text label ("Weak", "Strong", …), so colour is never the only signal. The built-in scorer (`scorePassword`) is a small, dependency-free estimate based on length, character variety, repeats and common sequences. Pass your own scorer (for example zxcvbn) for stricter checks, and always enforce the real rules on the server.

```tsx
<FormField label="New password" help="At least 12 characters">
  <PasswordInput strength />
</FormField>

<PasswordInput strength={(pw) => myScorer(pw)} /> // returns 0–4
```

With `strength`, `autoComplete` defaults to `"new-password"`; otherwise `"current-password"`.

## Props

| Prop              | Type                                                     | Default | Description                                     |
| ----------------- | -------------------------------------------------------- | ------- | ----------------------------------------------- |
| `toggleable`      | `boolean`                                                | `true`  | Show the show/hide button                       |
| `visible`         | `boolean`                                                |         | Controlled visibility                           |
| `defaultVisible`  | `boolean`                                                | `false` | Initial visibility                              |
| `onVisibleChange` | `(visible: boolean) => void`                             |         | Called when the button is pressed               |
| `capsLockWarning` | `boolean`                                                | `true`  | Warn when Caps Lock is on                       |
| `strength`        | `boolean \| (pw: string) => 0–4`                         | `false` | Show a strength meter, optionally with a scorer |
| `classNames`      | `{ wrapper, root, input, endAddon, capsLock, strength }` |         | Classes for each part                           |

All other `<input>` props are passed to the input, and `ref` points at it. `className` goes on the wrapper.

Also exported: `scorePassword(password): 0 | 1 | 2 | 3 | 4`.

## RTL and Thaana

Always `dir="ltr"`; no `thaana` prop (R13.3).

## Accessibility

- The toggle is a button named "Show password" with `aria-pressed`.
- The Caps Lock warning has `role="status"` and is added to the input's `aria-describedby` while shown.
- The strength label is a polite live region and is also linked with `aria-describedby`.

| Key                                               | Action                        |
| ------------------------------------------------- | ----------------------------- |
| <kbd>Tab</kbd>                                    | Moves to the show/hide button |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the button | Shows or hides the password   |

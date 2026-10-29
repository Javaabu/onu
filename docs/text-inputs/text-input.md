---
title: TextInput
sidebar_position: 1
---

A single-line text input with optional addons and [Thaana keyboard](../guides/thaana-input) support. Built on shadcn's `Input` and `InputGroup`.

```tsx
import { TextInput } from "@javaabu/onu"

;<TextInput placeholder="Full name" />
```

Inside a [`FormField`](../form-scaffolding/form-field) the input gets its `id`, `name`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from the field:

```tsx
<FormField label="Name" name="name" help="As shown on your ID card" required>
  <TextInput />
</FormField>
```

## Thaana

Set `thaana` to type Thaana from a Latin keyboard. The input switches to `dir="rtl"`, `lang="dv"` and the Thaana font. Add `thaanaToggle` for a button that switches between Thaana and Latin (also <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>). `thaana` and `thaanaToggle` work the same on [`Textarea`](./textarea).

```tsx
<TextInput thaana />
<TextInput thaana thaanaToggle />
<TextInput thaana={{ keymap: 'typewriter', paste: 'transliterate' }} />
```

## Addons

```tsx
<TextInput startAddon={<Icon name="search" />} placeholder="Search" />
<TextInput endAddon="MVR" inputMode="decimal" />
```

Addons sit at the inline start and end, so they swap sides in RTL.

## Email and URL

`type="email"` and `type="url"` set the matching keyboard on phones (`inputMode`), browser autofill (`autoComplete="email"` / `"url"`), turn off auto-capitalisation, autocorrect and spell check, and keep the input left-to-right even on a Dhivehi page (R11.7). Any of those attributes you pass yourself wins, except `dir`, which is always `ltr`. `thaana` and `thaanaToggle` are ignored for these types: addresses are Latin.

```tsx
<FormField label="Email" name="email" required>
  <TextInput type="email" startAddon={<Icon name="mail" />} />
</FormField>

<TextInput type="url" placeholder="example.mv" />
<TextInput type="url" urlProtocol={false} placeholder="/news/ferry-schedule" />
```

For a sign-in form, pass `autoComplete="username"` to the email field so password managers pair it with the password field.

A URL without a scheme gets `urlProtocol` (default `https://`) when the user leaves the field: `javaabu.com` becomes `https://javaabu.com`. The value is set the way a user would type it (a native input event), so `onChange`, controlled state and `react-hook-form` all see it. `urlProtocol={false}` keeps the value as typed, e.g. for site-relative paths. The same rule is exported as `normalizeUrl(value, protocol?)`.

## Props

| Prop           | Type                                    | Default | Description                                               |
| -------------- | --------------------------------------- | ------- | --------------------------------------------------------- |
| `thaana`       | `boolean \| ThaanaOptions`              | `false` | Type Thaana from a Latin keyboard (not for email and URL) |
| `thaanaToggle` | `boolean`                               | `false` | Show a Thaana/Latin toggle button                         |
| `urlProtocol`  | `string \| false`                       | `"https://"` | `type="url"`: added on blur when the scheme is missing; `false` turns it off |
| `startAddon`   | `ReactNode`                             |         | Content before the input                                  |
| `endAddon`     | `ReactNode`                             |         | Content after the input                                   |
| `classNames`   | `{ root, input, startAddon, endAddon }` |         | Classes for each part                                     |
| `className`    | `string`                                |         | Classes for the input (or the group when addons are used) |

All other `<input>` props are passed to the input, and `ref` points at the `<input>`.

`ThaanaOptions`: `{ keymap?: 'phonetic' | 'phonetic-hh' | 'typewriter' | Keymap, paste?: 'keep' | 'transliterate', toggleShortcut?: false | { code, altKey?, shiftKey?, ctrlKey?, metaKey? }, defaultEnabled?: boolean }`.

## Accessibility

- Always give the input a label: a `FormField`, a `<label>`, or `aria-label`.
- Email and URL inputs are always `dir="ltr"`, so the caret and text stay left-to-right inside an RTL form.
- While Thaana is on, the input has `dir="rtl"` and `lang="dv"`, so screen readers can pick a Dhivehi voice and the caret moves right to left. In Latin mode it has `dir="auto"` and no `lang`.
- The keyboard inserts text the way typing does, so the browser's undo and `onChange` keep working. Text composed by a native Thaana keyboard or another IME passes through untouched.
- The Thaana toggle has an accessible name, exposes its state with `aria-pressed`, and announces "Thaana typing on/off". Keep it (`thaanaToggle`) when users may switch with the shortcut, so the change is announced; see [`ThaanaToggle`](./thaana-toggle#accessibility).

| Key                                          | Action                                                |
| -------------------------------------------- | ----------------------------------------------------- |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> | Switch between Thaana and Latin (when `thaana` is on) |

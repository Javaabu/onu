---
title: KeyboardKey
sidebar_position: 6
---

Shows a key or keyboard shortcut using shadcn's `Kbd`. Combos adapt to the platform: <kbd>⌘</kbd><kbd>K</kbd> on macOS and iOS, <kbd>Ctrl</kbd>+<kbd>K</kbd> on Windows and Linux.

```tsx
import { KeyboardKey, formatShortcut } from "@javaabu/onu"

<KeyboardKey>Esc</KeyboardKey>
<KeyboardKey keys="mod+k" />        // ⌘K or Ctrl+K
<KeyboardKey keys="ctrl+shift+p" />
<KeyboardKey keys="g d" />          // sequence: G then D
formatShortcut("mod+s", "other")    // "Ctrl+S"
```

## Key names

`mod` is ⌘ on Apple platforms and Ctrl elsewhere. Also understood: `cmd`/`meta`, `ctrl`, `alt`/`option`, `shift`, `enter`, `esc`, `tab`, `backspace`, `delete`, `space`, `up`, `down`, `left`, `right`. Anything else is shown as typed (single letters upper-cased).

## Props

| Prop         | Type                 | Default  | Description                            |
| ------------ | -------------------- | -------- | -------------------------------------- |
| `keys`       | `string`             |          | Combination (`+`) and sequence (space) |
| `children`   | `ReactNode`          |          | Custom single key instead of `keys`    |
| `platform`   | `'mac' \| 'other'`   | detected | Force a platform                       |
| `classNames` | `{ key, separator }` |          | Classes for each part                  |

`detectPlatform()` and `formatShortcut(shortcut, platform?)` are exported for menus and tooltips. Detection is SSR-safe (server renders the non-Apple form).

## Accessibility

Screen readers hear the key names ("Command K", "Control Shift P"), not the symbols; the visual keys are hidden from them.

## RTL and Dhivehi

Shortcuts always read left to right, also in RTL pages. Spoken key names are translated.

---
title: ThaanaKeyboard (Tiptap)
sidebar_position: 7
---

A Tiptap extension that types Thaana from a Latin keyboard through ProseMirror transactions rather than DOM edits (R13.2), so undo/redo, input rules and collaboration keep working. `WysiwygEditor` and `BlockEditor` use it for their `thaana` prop; use it directly in your own Tiptap editors.

```tsx
import { ThaanaKeyboard } from "@javaabu/onu/editor"

const editor = useEditor({
  extensions: [StarterKit, ThaanaKeyboard.configure({ keymap: "phonetic", paste: "transliterate" })],
})

editor.commands.toggleThaana()
editor.commands.setThaana(false)
editor.storage.thaanaKeyboard.enabled // current mode
```

## Options

| Option           | Type                                                    | Default         | Description                                |
| ---------------- | ------------------------------------------------------- | --------------- | ------------------------------------------ |
| `enabled`        | `boolean`                                               | `true`          | Start in Thaana mode                       |
| `keymap`         | `'phonetic' \| 'phonetic-hh' \| 'typewriter' \| Keymap` | `'phonetic'`    | Key layout                                 |
| `paste`          | `'keep' \| 'transliterate'`                             | `'keep'`        | Convert pasted Latin plain text            |
| `toggleShortcut` | `string \| false`                                       | `'Alt-Shift-t'` | ProseMirror key name that toggles the mode |
| `onToggle`       | `(enabled) => void`                                     |                 | Called when the mode changes               |

## How it works

- Typed characters are mapped in `beforeinput` (works with Android's keyCode 229) and in `handleTextInput`; the Thaana text is inserted as a normal typed transaction.
- <kbd>Ctrl</kbd>/<kbd>⌘</kbd> shortcuts never produce text input, so they pass through.
- Text from an IME or a native Thaana keyboard is left alone; whole Latin words composed by predictive keyboards are converted when composition ends.
- Toggling dispatches a transaction, so `useEditorState` sees the new mode.

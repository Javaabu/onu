# ThaanaKeyboard (Tiptap)

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

## Accessibility

- The extension changes only how keys map to characters; the editor stays a normal ProseMirror text box for screen readers, and Thaana is inserted as ordinary typed text, so the editor reads, undoes and redoes it like any other input.
- <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> switches modes from the keyboard. Set `toggleShortcut: false` only when you offer another way to switch.
- The extension does not render a button or announce the mode. Onu's editors add a [`ThaanaToggle`](../text-inputs/thaana-toggle.md) to the toolbar (`aria-pressed`, with the change announced in a polite live region); in your own editor, render one from `editor.storage.thaanaKeyboard.enabled` and `toggleThaana()`, or announce `onToggle` with [`useAnnouncer`](../accessibility/use-announcer.md).
- Mark Thaana content with `dir="rtl"` and `lang="dv"` (Onu's editors do this from the mode) so it is read with a Dhivehi voice and laid out right to left.

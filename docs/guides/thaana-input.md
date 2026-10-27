---
title: Thaana input
sidebar_position: 7
---

Onu can type Thaana from a Latin keyboard, so users don't need a Dhivehi keyboard installed. It is a React version of [JTK](https://github.com/jawish/jtk) (Javascript Thaana Keyboard) and uses the same keyboard layouts.

# On components

Every component that accepts free text has a `thaana` prop: text inputs, textareas, search boxes, autocomplete, tags, searchable selects, inline edit, the command palette, comment and note composers, the translations editor and the rich text editors.

```tsx
<TextInput thaana />
<TextInput thaana thaanaToggle />   // with a Thaana/Latin button
<Textarea thaana={{ keymap: 'typewriter', paste: 'transliterate' }} />
```

With Thaana on, the field is right-to-left, `lang="dv"`, and uses the Thaana font. Users switch between Thaana and Latin with the toggle button or <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>; screen readers hear "Thaana typing on/off".

Inputs that must hold Latin text (email, password, URL, numbers, phone, OTP, slug, colour) do not offer it.

# Keyboard layouts

| `keymap` | Layout |
|---|---|
| `phonetic` (default) | Phonetic (Segha version), the most common layout |
| `phonetic-hh` | Phonetic (Hassan Hameed version): different alifu, abafili, aabaafili, gaafu and sukun |
| `typewriter` | The standard Thaana typewriter layout |

Pass your own map with `createKeymap(latinKeys, thaanaCharacters)`.

# Options

| Option | Default | Description |
|---|---|---|
| `keymap` | `"phonetic"` | Layout name or a custom keymap |
| `paste` | `"keep"` | `"transliterate"` converts pasted Latin text to Thaana |
| `toggleShortcut` | Alt+Shift+T | `{ code, altKey, shiftKey, ctrlKey, metaKey }`, or `false` |
| `defaultEnabled` | `true` | Start in Thaana mode |

# On your own elements

```tsx
import { useThaanaInput, attachThaanaKeyboard, transliterate } from '@javaabu/onu/thaana';

function MyField() {
    const ref = useRef<HTMLInputElement>(null);
    const { enabled, toggle } = useThaanaInput(ref, { keymap: 'phonetic' });
    return <input ref={ref} dir={enabled ? 'rtl' : 'auto'} lang="dv" />;
}

// Without React
const keyboard = attachThaanaKeyboard(document.querySelector('#name'));
keyboard.setEnabled(false);
keyboard.detach();

transliterate('dhivehi'); // "ދހިވެހި"
```

# How it works

- Typed characters are converted in the `beforeinput` event, so it works with physical keyboards and on-screen keyboards that send characters directly — including Android, where key codes are not available.
- Predictive keyboards (such as Gboard) that compose whole words are converted when the word is finished.
- If the user already types with a Thaana keyboard or another input method, their text passes through untouched.
- <kbd>Ctrl</kbd>/<kbd>⌘</kbd> shortcuts are never intercepted.
- Text is inserted so the browser's undo still works.
- It works on inputs, textareas and `contenteditable` elements; the editors use a Tiptap extension built on the same keymaps.

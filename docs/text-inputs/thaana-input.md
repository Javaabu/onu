# ThaanaInput

`ThaanaInput` and `ThaanaTextarea` are [`TextInput`](./text-input.md) and [`Textarea`](./textarea.md) with Thaana typing on and the Thaana/Latin toggle shown by default.

```tsx
import { ThaanaInput, ThaanaTextarea } from '@javaabu/onu';

<FormField label="ނަން">
    <ThaanaInput />
</FormField>

<ThaanaTextarea thaana={{ keymap: 'phonetic-hh' }} thaanaToggle={false} />
```

They accept every prop of the component they wrap. `thaana` takes keyboard options only (it cannot be turned off).

For the keyboard itself, including using it on your own elements, see the [Thaana input guide](../guides/thaana-input.md).

## Props

These differ from [`TextInput`](./text-input.md#props) / [`Textarea`](./textarea.md); every other prop is the same.

| Prop           | Type                                                        | Default | Description                                          |
| -------------- | ----------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `thaana`       | `true \| { keymap, paste, toggleShortcut, defaultEnabled }` | `true`  | Keyboard options; Thaana typing cannot be turned off |
| `thaanaToggle` | `boolean`                                                   | `true`  | Show the [Thaana/Latin toggle](./thaana-toggle.md)      |

`keymap` is `"phonetic"` (default), `"phonetic-hh"`, `"typewriter"` or a custom keymap; `paste: "transliterate"` converts pasted Latin text; `defaultEnabled: false` starts in Latin mode.

## Accessibility

- While Thaana is on, the field has `dir="rtl"` and `lang="dv"`, so screen readers can pick a Dhivehi voice and the caret moves right to left. In Latin mode it has `dir="auto"` and no `lang`.
- The field is still a native `<input>` / `<textarea>`: label it with [`FormField`](../form-scaffolding/form-field.md) as usual. The keyboard inserts text the way typing does, so the browser's undo and `onChange` keep working.
- The toggle button and <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> switch modes. The toggle (shown by default) also announces each change, so keep it when users may switch with the shortcut; see [`ThaanaToggle`](./thaana-toggle.md#accessibility).
- Text composed by a native Thaana keyboard or another IME passes through untouched, so users who already type Thaana are not double-converted.

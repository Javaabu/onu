---
title: InlineEdit
sidebar_position: 11
---

Text that turns into an input when clicked, for quick edits on detail pages and tables. **Enter** saves, **Escape** cancels. Saves can be async: the editor shows progress and, if the save fails, stays open with the error.

```tsx
import { InlineEdit } from "@javaabu/onu"

;<InlineEdit label="Name" defaultValue="Aishath Shifa" onSave={(name) => api.patch(`/users/${id}`, { name })} />
```

## Thaana

```tsx
<InlineEdit label="ނަން" value={nameDv} onSave={saveDv} thaana />
```

With `thaana` the input types Thaana from a Latin keyboard and is `dir="rtl"` `lang="dv"`; the displayed value is marked `lang="dv"` too.

## Multiline

`multiline` uses a textarea: <kbd>Enter</kbd> adds a line and <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> saves.

## Props

| Prop             | Type                                 | Default | Description                                                 |
| ---------------- | ------------------------------------ | ------- | ----------------------------------------------------------- |
| `label`          | `string`                             |         | What is edited; used for accessible names                   |
| `value`          | `string`                             |         | Controlled value                                            |
| `defaultValue`   | `string`                             | `""`    | Uncontrolled initial value                                  |
| `onSave`         | `(value) => unknown`                 |         | Save; return a promise for a saving state, throw for errors |
| `onCancel`       | `() => void`                         |         | After Escape / Cancel                                       |
| `onChange`       | `(value) => void`                    |         | Every edit                                                  |
| `validate`       | `(value) => string \| null`          |         | Return a message to block saving                            |
| `placeholder`    | `string`                             | "Empty" | Shown when empty                                            |
| `multiline`      | `boolean`                            | `false` | Use a textarea                                              |
| `thaana`         | `boolean \| ThaanaOptions`           | `false` | Thaana keyboard                                             |
| `blurBehavior`   | `'save' \| 'cancel' \| 'none'`       | `save`  | What leaving the editor does                                |
| `renderValue`    | `(value) => ReactNode`               |         | Custom display                                              |
| `defaultEditing` | `boolean`                            | `false` | Start in edit mode                                          |
| `disabled`       | `boolean`                            | `false` | Read only                                                   |
| `inputProps`     | input props                          |         | Extra props for the input                                   |
| `classNames`     | `{ display, input, actions, error }` |         | Classes for each part                                       |

If the thrown error has a `message`, it is shown; otherwise "Couldn’t save. Please try again.".

## Accessibility

- The value is a button named "Edit Name: Aishath Shifa".
- In edit mode the input is labelled by `label` and described by the key hint; errors are announced (`role="alert"`) and linked with `aria-describedby`.
- After saving or cancelling, focus returns to the value; "Name saved" is announced.
- While saving, the input is read-only and `aria-busy`.

| Key                                         | Action                       |
| ------------------------------------------- | ---------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> (value) | Start editing                |
| <kbd>Enter</kbd>                            | Save (single line)           |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd>            | Save (multiline)             |
| <kbd>Escape</kbd>                           | Cancel and restore the value |

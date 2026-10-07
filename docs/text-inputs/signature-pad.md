---
title: SignaturePad
sidebar_position: 20
---

A signature pad built on [`signature_pad`](https://github.com/szimek/signature_pad). Draw with a finger, pen or mouse; undo the last stroke or clear; the result is a PNG data URL. The canvas resizes with its container (and the device pixel ratio) without losing the drawing. "Type your name" is offered as a keyboard and screen-reader alternative, and also produces a PNG.

It is exported from the media entry point, and `signature_pad` is an optional peer dependency:

```bash
npm install signature_pad
```

```tsx
import { SignaturePad } from "@javaabu/onu/media"

;<SignaturePad label="Applicant signature" onValueChange={setSignature} name="signature" />
```

## Props

| Prop                                    | Type                                | Default         | Description                                                   |
| --------------------------------------- | ----------------------------------- | --------------- | ------------------------------------------------------------- |
| `onValueChange`                         | `(dataUrl: string \| null) => void` |                 | Called after each stroke or typed change; `null` when cleared |
| `defaultValue`                          | `string \| null`                    |                 | A saved data URL to start from                                |
| `penColor`                              | `string`                            | text colour     | Ink colour                                                    |
| `backgroundColor`                       | `string`                            | transparent     | Fill of the exported image                                    |
| `minWidth` / `maxWidth`                 | `number`                            | `0.75` / `2.75` | Stroke width range                                            |
| `disabled`                              | `boolean`                           | `false`         | Stop drawing and disable the buttons                          |
| `allowTyped`                            | `boolean`                           | `true`          | Offer "Type your name"                                        |
| `mode` / `defaultMode` / `onModeChange` | `"draw" \| "type"`                  | `"draw"`        | Control the mode                                              |
| `thaana`                                | `boolean \| ThaanaOptions`          |                 | Thaana typing for the typed name                              |
| `name`                                  | `string`                            |                 | Submit the data URL via a hidden input                        |
| `label`                                 | `string`                            |                 | Accessible name of the group                                  |
| `classNames`                            | `{ canvas, toolbar, typed }`        |                 | Classes for each part                                         |

Also exported: `renderTypedSignature(text, options?)`.

:::info
The ink follows the theme's text colour by default, so a signature drawn in dark mode exports with light ink. Pass `penColor` (and `backgroundColor`) when the image will be printed or shown on a fixed background.
:::

## RTL and Thaana

The pad works the same in both directions. The typed name accepts `thaana`, so Dhivehi names can be typed from a Latin keyboard.

## Accessibility

- The canvas has `role="img"` and an accessible name that tells the user they can type their name instead.
- Draw / Type are toggle buttons with `aria-pressed`; Undo and Clear are labelled buttons, 44px on touch screens.
- "Signature captured" and "Signature cleared" are announced.
- The canvas uses `touch-action: none` so drawing does not scroll the page; the buttons are the gesture alternatives (R3.27).

| Key                                 | Action                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| <kbd>Tab</kbd>                      | Move between Draw/Type, the name field and the buttons |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Switch mode, undo or clear                             |

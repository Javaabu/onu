---
title: QrCode
sidebar_position: 19
---

A QR code generator. The text is encoded with [`uqr`](https://github.com/unjs/uqr) (MIT, zero dependencies) and Onu renders the SVG itself, so the dark modules use `currentColor` and follow theme tokens. It supports the four error-correction levels, a quiet zone, a centre logo (which switches to level H automatically), and optional buttons to download the code as PNG or SVG and to copy the encoded text. It is the generator counterpart of the [QR code scanner](../text-inputs/qr-code-scanner.md) and is exported from the media entry point.

```tsx
import { QrCode } from "@javaabu/onu/media"

<QrCode value="https://verify.trade.gov.mv/BL-2026-04417" label="QR code to verify licence BL-2026-04417" />

<QrCode
  value={ticket.url}
  size={200}
  logo="/logo.svg"
  caption="Scan to verify"
  download
  copyable
  filename={`ticket-${ticket.number}`}
/>
```

Text is encoded as UTF-8, so Thaana works. Text that does not fit in a QR code (about 2,900 bytes at level L, fewer at higher levels) shows an error message in place of the code.

## Colours

The code never mirrors and is rendered with tokens through the `tone` variant (`qrCodeVariants`):

| Tone                   | Result                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `contrast` (default)   | Dark modules on a light ground in both themes (`bg-foreground` / `text-background` dark) |
| `theme`                | Follows the theme: light modules on a dark ground in dark mode. Most phone cameras scan this, some older readers do not |
| `transparent`          | No background; modules use the current text colour. Keep enough contrast with what is behind |

Recolour with `classNames.svg`, e.g. `classNames={{ svg: "text-primary" }}`. Downloads use the colours as rendered (read with `getComputedStyle`).

## Logo

`logo` takes a URL or `{ src, size?, excavate? }`. `size` is the logo width as a fraction of the code (0.1–0.3, default 0.22). The modules behind it are cleared unless `excavate={false}`. A logo always uses error-correction level H, so the code still scans with the centre covered. For the PNG download the image must allow CORS; otherwise the PNG has the cleared area without the logo.

## Props

| Prop           | Type                                                             | Default      | Description                                         |
| -------------- | ---------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `value`        | `string`                                                         |              | Text to encode (required)                           |
| `size`         | `number`                                                         | `160`        | Width and height in CSS px; shrinks in narrow boxes |
| `level`        | `"L" \| "M" \| "Q" \| "H"`                                       | `"M"`        | Error correction (always `"H"` with a logo)         |
| `quietZone`    | `number`                                                         | `4`          | Light margin, in modules                            |
| `tone`         | `"contrast" \| "theme" \| "transparent"`                         | `"contrast"` | Colours (see above)                                 |
| `logo`         | `string \| { src, size?, excavate? }`                            |              | Centre image                                        |
| `label`        | `string`                                                         | "QR code"    | Accessible name (`aria-label` also works)           |
| `caption`      | `ReactNode`                                                      |              | Text under the code                                 |
| `showValue`    | `boolean`                                                        | `false`      | Show the encoded text under the code                |
| `download`     | `boolean \| ("png" \| "svg")[]`                                  | `false`      | Download buttons (`true` = both)                    |
| `copyable`     | `boolean`                                                        | `false`      | Copy-text button                                    |
| `filename`     | `string`                                                         | `"qr-code"`  | Download file name without extension                |
| `downloadSize` | `number`                                                         | `1024`       | Approximate PNG width in px                         |
| `onDownload`   | `(format, blob) => void`                                         |              | After a download                                    |
| `onCopy`       | `(value) => void`                                                |              | After a successful copy                             |
| `classNames`   | `{ svg, caption, value, actions, button, error }`                |              | Classes for each part                               |

Other props and `ref` go to the root `div` (`data-slot="qr-code"`, with `data-level`, `data-version` and `data-modules`).

Also exported for custom rendering: `encodeQrCode(value, level)`, `qrCodePath(modules, offset, skip?)`, `qrLogoBox(size, ratio)`, `qrCodeToSvg(matrix, options)` and `qrCodeToPng(matrix, options)`.

## Accessibility

- The code is an `img` named by `label` (default "QR code"); give it a label that says what it is for, e.g. "QR code to verify licence BL-2026-04417".
- Put the information in text as well (`showValue`, `caption` or nearby text) for people who cannot scan.
- Download and copy buttons have visible, translated labels and are 44px tall on touch screens. Copying is announced in a polite live region.
- Text that is too long is reported with `role="alert"`.

| Key                                 | Action                          |
| ----------------------------------- | ------------------------------- |
| <kbd>Tab</kbd>                      | Move between the action buttons |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Download or copy                |

## RTL and Dhivehi

The code itself is never mirrored. Buttons and caption follow the page direction, the value is shown with `dir="auto"`, and all labels come from the `file` namespace (`file.qrCode`, `file.qrDownloadPng`, …) in English and Dhivehi.

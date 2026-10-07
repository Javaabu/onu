---
title: QrCodeScanner
sidebar_position: 22
---

A QR code scanner. It opens the camera with `getUserMedia`, decodes frames with the browser's `BarcodeDetector`, and loads the [`barcode-detector`](https://github.com/Sec-ant/barcode-detector) polyfill (ZXing in WebAssembly) only where the native API is missing (R8.2). It shows clear states for the permission prompt, a blocked camera, no camera and unsupported browsers, has a torch toggle when the camera supports one, and always offers manual entry. The camera stops when a code is found (unless `continuous`) and when the component unmounts.

It is exported from the media entry point, and `barcode-detector` is an optional peer dependency:

```bash
npm install barcode-detector
```

```tsx
import { QrCodeScanner } from "@javaabu/onu/media"

<QrCodeScanner onScan={(value) => checkIn(value)} />
<QrCodeScanner continuous autoStart onScan={addTicket} />
```

The camera only starts after the user presses **Start camera** (or with `autoStart`), and browsers only allow it on HTTPS or `localhost`.

## States

| Status        | Shown                                                      |
| ------------- | ---------------------------------------------------------- |
| `idle`        | Start camera button and manual entry                       |
| `requesting`  | "Waiting for camera permission…"                           |
| `scanning`    | Camera preview with a frame, Stop and (if supported) torch |
| `denied`      | How to allow the camera, plus manual entry                 |
| `no-camera`   | No camera found, plus manual entry                         |
| `unsupported` | The browser cannot scan, plus manual entry                 |
| `error`       | The camera could not be started                            |

## Props

| Prop             | Type                                        | Default           | Description                             |
| ---------------- | ------------------------------------------- | ----------------- | --------------------------------------- |
| `onScan`         | `(value: string) => void`                   |                   | Called with the decoded text (required) |
| `formats`        | `string[]`                                  | `["qr_code"]`     | Barcode formats                         |
| `continuous`     | `boolean`                                   | `false`           | Keep scanning after a result            |
| `autoStart`      | `boolean`                                   | `false`           | Start the camera on mount               |
| `manualEntry`    | `boolean`                                   | `true`            | Show the manual entry field             |
| `facingMode`     | `"environment" \| "user"`                   | `"environment"`   | Preferred camera                        |
| `scanInterval`   | `number`                                    | `250`             | ms between detection attempts           |
| `createDetector` | `(formats) => Promise<BarcodeDetectorLike>` | native / polyfill | Supply your own decoder                 |
| `onStatusChange` | `(status) => void`                          |                   | Called on every state change            |
| `onError`        | `(error) => void`                           |                   | Camera, decoder or torch errors         |
| `classNames`     | `{ video, controls, manual, message }`      |                   | Classes for each part                   |

Also exported: `createBarcodeDetector(formats?)`.

## RTL

Controls follow the page direction; the manual entry field is left-to-right because codes are Latin.

## Accessibility

- The status message is a `status` live region; problems use `role="alert"`.
- Scanned codes are announced ("Code scanned: …").
- The torch is a toggle button with `aria-pressed`; all buttons are 44px on touch screens.
- Manual entry is always available, so the component works without a camera.

| Key                                 | Action                                    |
| ----------------------------------- | ----------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Start / stop the camera, toggle the torch |
| <kbd>Enter</kbd> in the code field  | Use the typed code                        |

---
"@javaabu/onu": patch
---

`QrCodeScanner` in `continuous` mode reports a code once while it stays in view instead of four times a second, and when the decoder fails to load it shows a new `decoder-error` status with the Start button to try again.

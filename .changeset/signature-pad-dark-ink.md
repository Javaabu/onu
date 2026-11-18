---
"@javaabu/onu": patch
---

`SignaturePad` now draws with black ink by default (`penColor`), so a signature made in dark mode no longer exports as near-white strokes; in dark mode the canvas is shown inverted so the ink stays visible. A saved signature from `defaultValue` is no longer erased when the pad resizes.

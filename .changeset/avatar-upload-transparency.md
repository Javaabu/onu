---
"@javaabu/onu": patch
---

`AvatarUpload` and `cropImage` no longer give transparent images a black background in JPEG output (transparent areas are white), and the cropped avatar file's extension now matches its type, e.g. `.png` with `cropOptions={{ type: "image/png" }}`.

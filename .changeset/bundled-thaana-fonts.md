---
"@javaabu/onu": minor
---

Thaana fonts are now bundled. `@javaabu/onu/fonts.css` ships Faruma (Dhivehi text) and MV Faseyha (Dhivehi headings and bold, the new `--onu-font-thaana-bold` token) as `woff2` files subset to Thaana, about 12 kB each, loaded only when a page shows Thaana text. They replace MV Waheed, which was referenced but never bundled, in the default font stacks, the PDF export and the typed signature font.

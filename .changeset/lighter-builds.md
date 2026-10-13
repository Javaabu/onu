---
"@javaabu/onu": minor
---

Smaller, faster builds: code highlighting uses `shiki/core` with the JavaScript regex engine and a curated, lazily loaded language set (add more with the new `registerCodeLanguage` / `registerCodeTheme`), instead of Shiki's full ~300-language bundle and WebAssembly; type declarations are generated with TypeScript 7 (about 3.5x faster and no Node heap limit), and Vite no longer computes gzip sizes during builds.

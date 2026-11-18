---
"@javaabu/onu": patch
---

The build now marks only modules that need the browser with `"use client"`, so Server Components can call pure helpers such as `cn`, `themeScript`, `createTranslator`, `mergeMessages`, the `/thaana` conversion functions and the `/export` builders. `themeScript` no longer needs a client-component wrapper in Next.js.

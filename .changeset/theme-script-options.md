---
"@javaabu/onu": patch
---

`themeScript` now takes the provider's options as an object, `themeScript({ defaultTheme, forcedTheme, storageKey })`, applies `forcedTheme`, and falls back to `defaultTheme` for a stored value that isn't a theme, so the first paint matches `ThemeProvider`.

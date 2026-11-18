---
"@javaabu/onu": patch
---

`ThemeProvider` no longer causes a hydration mismatch when a theme is stored: it hydrates with `defaultTheme` and switches to the stored theme right after, so a server-rendered `ThemeToggle` shows the stored choice. It also follows a theme chosen in another tab.

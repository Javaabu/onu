# Dark mode

Every Onu component has a dark variant. Dark mode turns on when an ancestor has the `dark` class or `data-theme="dark"`, so it works with any toggling approach.

`ThemeProvider` handles it for you: light, dark or following the system, remembered in `localStorage`.

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@javaabu/onu';

<ThemeProvider defaultTheme="system">
    <App />
</ThemeProvider>

function MyToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    return <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>Toggle</button>;
}
```

| Prop | Default | Description |
|---|---|---|
| `defaultTheme` | `"system"` | Theme when nothing is stored |
| `forcedTheme` | | Fix the theme, e.g. `"light"` for print pages |
| `storageKey` | `"onu-theme"` | `localStorage` key |

The provider sets `class="dark"`, `data-theme` and `color-scheme` on `<html>`, so dialogs and menus in portals follow it.

In server-rendered apps, add `themeScript()` to `<head>` to apply the stored theme before the page paints:

```tsx
<script dangerouslySetInnerHTML={{ __html: themeScript() }} />
```

In your own styles use Tailwind's `dark:` variant, which Onu configures for both the class and the attribute.

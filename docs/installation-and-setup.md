# Installation

First install the NPM package

```bash
npm install @javaabu/onu --save
```

# Styles

Import Tailwind and Onu's stylesheet in your main CSS file. The font pack is optional; to use it, first install the fonts it loads:

```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana
```

```css
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/onu/fonts.css"; /* optional: needs the font packages above */
```

Without the font pack, leave out the last line. Faruma and MV Faseyha (Thaana) are inside `@javaabu/onu`; see [Fonts](./guides/fonts.md).

`tailwind.css` adds Onu's design tokens, the dark mode variant, and tells Tailwind to scan Onu's components for classes.

# Providers

Wrap your app in `ThemeProvider` (light, dark and system themes) and `OnuProvider` (locale, direction, density, icons and links).

```tsx
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <OnuProvider locale={dv}>
      <App />
    </OnuProvider>
  </ThemeProvider>,
)
```

`OnuProvider` sets `lang`, `dir` and `data-density` on `<html>`, so dialogs and menus rendered in portals follow the same direction. Pass `syncDocument={false}` if Onu only controls part of a page.

English-only apps leave out `locale` and import nothing else: each component brings its own English text, so neither the Dhivehi strings nor the full English set end up in the bundle. `locale="dv"` also works and loads the Dhivehi text on demand (see [Dhivehi & locales](./guides/dhivehi-and-locales.md#loading-dhivehi)).

| Prop            | Default     | Description                                                        |
| --------------- | ----------- | ------------------------------------------------------------------ |
| `locale`        | `"en"`      | A locale object (`dv` from `@javaabu/onu/locales/dv`), `"en"` or `"dv"` |
| `dir`           | from locale | Override the direction                                             |
| `messages`      |             | Override individual strings, e.g. `{ common: { save: "Submit" } }` |
| `density`       | `"default"` | `"compact"`, `"default"`, `"comfortable"` or `"touch"`             |
| `labelLayout`   | `"stacked"` | Default label layout for form fields: `"stacked"` or `"inline"`    |
| `linkComponent` | `"a"`       | Component used for links, e.g. Inertia's or Next's `Link`          |
| `icons`         | Lucide      | Map semantic icon names to another set, e.g. FontAwesome Pro (the default Lucide set loads on demand) |
| `iconSources`   |             | Icon sources for `DynamicIcon` and the icon picker                 |
| `maps`          |             | `{ googleMapsApiKey, mapId, darkMapId }`                           |

# Laravel + Inertia

```tsx
import { Link } from "@inertiajs/react"

;<OnuProvider linkComponent={Link}>…</OnuProvider>
```

Pass Inertia's `errors` to forms with `FormErrorsProvider` so every field shows its validation errors. See [Forms & Laravel validation](./guides/forms-and-laravel.md).

# Avoiding a theme flash (SSR)

Add `themeScript()` to `<head>` so the stored theme applies before the first paint:

```tsx
import { themeScript } from "@javaabu/onu"

;<script dangerouslySetInnerHTML={{ __html: themeScript() }} />
```

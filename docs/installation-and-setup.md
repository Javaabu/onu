---
title: Installation & Setup
sidebar_position: 1.2
---

Install Onu and its required peers, add its stylesheet to your CSS, and wrap your app in its providers.

## Requirements

- [React](https://react.dev) 19 (`react` and `react-dom`).
- [Tailwind CSS](https://tailwindcss.com) 4, with `@import "tailwindcss"` and `@import "@javaabu/onu/tailwind.css"` in your CSS (see [Styles](#styles)).
- [React Hook Form](https://react-hook-form.com) 7 and [TanStack Query](https://tanstack.com/query) 5. They are required peers because the core entry imports them, and Onu shares their React context with your app.

## Installation

```bash
npm install @javaabu/onu react-hook-form @tanstack/react-query --save
```

## Peer dependencies per entry

Everything else is optional: install a row's packages only when you use that entry.

| Entry | Install | Notes |
|---|---|---|
| `@javaabu/onu`, `/primitives`, `/thaana`, `/locales/dv` | Nothing more | |
| `@javaabu/onu/charts` | `recharts` | `MapChart` also needs `@vis.gl/react-google-maps @deck.gl/core @deck.gl/layers @deck.gl/google-maps`, loaded on demand |
| `@javaabu/onu/maps` | `@vis.gl/react-google-maps @turf/turf terra-draw terra-draw-google-maps-adapter @googlemaps/markerclusterer @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/google-maps` | Everything after `@turf/turf` loads on demand, when a component that draws, clusters or uses a deck.gl layer needs it |
| `@javaabu/onu/editor` | `@tiptap/core @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/static-renderer @tiptap/suggestion @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-table @tiptap/extension-text-align shiki` | `shiki` loads on first use, for code highlighting |
| `@javaabu/onu/calendar` | `@fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/list @fullcalendar/interaction` | |
| `@javaabu/onu/media` | `react-easy-crop signature_pad yet-another-react-lightbox media-chrome barcode-detector` | The entry imports the first four statically, so install them even if you use only one component. `barcode-detector` is only for `QrCodeScanner`, and loads where the browser has no native `BarcodeDetector` |
| `@javaabu/onu/export` | `write-excel-file` | Only for Excel export, loaded on first use; CSV and PDF need nothing |
| `@javaabu/onu/icons/iconify` | `@iconify/react` and any `@iconify-json/*` collections | |
| `@javaabu/onu/icons/fontawesome` | `@fortawesome/fontawesome-svg-core @fortawesome/react-fontawesome` and your FontAwesome icon packages | |
| `@javaabu/onu/fonts.css` | `@fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana` | |
| `@javaabu/onu/fonts-optional.css` | `@fontsource-variable/geist @fontsource-variable/source-serif-4` | |

## Styles

Import Tailwind and Onu's stylesheet in your main CSS file (`app.css` below). The font pack is optional; to use it, first install the fonts it loads:

```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana
```

```css
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/onu/fonts.css"; /* optional: needs the font packages above */
```

Without the font pack, leave out the last line. `tailwind.css` already loads Faruma and MV Faseyha (Thaana); see [Fonts](./guides/fonts).

`tailwind.css` adds Onu's design tokens, the dark mode variant, and tells Tailwind to scan Onu's components for classes.

## Providers

Wrap your app in `ThemeProvider` (light, dark and system themes) and `OnuProvider` (locale, direction, density, icons and links).

```tsx
// main.tsx
import { createRoot } from "react-dom/client"
import { OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

import { App } from "./App"
import "./app.css"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <OnuProvider locale={dv}>
      <App />
    </OnuProvider>
  </ThemeProvider>,
)
```

`OnuProvider` sets `lang`, `dir` and `data-density` on `<html>`, so dialogs and menus rendered in portals follow the same direction. Pass `syncDocument={false}` if Onu only controls part of a page.

English-only apps leave out `locale` and import nothing else: each component brings its own English text, so neither the Dhivehi strings nor the full English set end up in the bundle. `locale="dv"` also works and loads the Dhivehi text on demand (see [Dhivehi & locales](./guides/dhivehi-and-locales#loading-dhivehi)).

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
| `syncDocument`  | `true`      | Set `lang`, `dir` and `data-density` on `<html>`; turn off if Onu only controls part of a page |

## Laravel + Inertia

```tsx
import { Link } from "@inertiajs/react"

;<OnuProvider linkComponent={Link}>…</OnuProvider>
```

Pass Inertia's `errors` to forms with `FormErrorsProvider` so every field shows its validation errors. See [Forms & Laravel validation](./guides/forms-and-laravel).

## Avoiding a theme flash (SSR)

Add `themeScript()` to `<head>` so the stored theme applies before the first paint:

```tsx
import { themeScript } from "@javaabu/onu"

;<script dangerouslySetInnerHTML={{ __html: themeScript() }} />
```

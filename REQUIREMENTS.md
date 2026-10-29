# Onu — Requirements

> **Onu** (އޮނު) means *bamboo* in Dhivehi.
> Onu is Javaabu's primary React UI component library going forward.

This document captures the requirements, constraints and full build list for Onu. It is the source of truth for scope; anything not listed here is out of scope until added.

---

## Table of contents

1. [Overview](#1-overview)
2. [Package & distribution](#2-package--distribution)
3. [Design language](#3-design-language)
4. [Dependency policy](#4-dependency-policy)
5. [Technology stack & component sourcing](#5-technology-stack--component-sourcing)
6. [Icons](#6-icons)
7. [Typography & fonts](#7-typography--fonts)
8. [Browser support](#8-browser-support)
9. [Theming](#9-theming)
10. [Dark mode](#10-dark-mode)
11. [RTL support](#11-rtl-support)
12. [Dhivehi support](#12-dhivehi-support)
13. [Thaana (JTK) input](#13-thaana-jtk-input)
14. [Accessibility](#14-accessibility)
15. [Style overrides & customisation](#15-style-overrides--customisation)
16. [Framework integration](#16-framework-integration)
17. [Testing, CI & coverage](#17-testing-ci--coverage)
18. [Examples](#18-examples)
19. [Developer documentation](#19-developer-documentation)
20. [Repository structure](#20-repository-structure)
21. [Component definition of done](#21-component-definition-of-done)
22. [UI build list](#22-ui-build-list)
23. [Sample pages](#23-sample-pages)
24. [Open questions](#24-open-questions)
25. [Expected UI behaviour](#25-expected-ui-behaviour)

---

## 1. Overview

| | |
|---|---|
| **Name** | Onu |
| **Package** | `@javaabu/onu` |
| **Owner** | Javaabu Pvt. Ltd. |
| **Basis** | [shadcn/ui](https://ui.shadcn.com) components wherever one exists, on [Radix UI](https://www.radix-ui.com) primitives, styled with [Tailwind CSS](https://tailwindcss.com). Gaps are filled with reputable, well-maintained libraries (§4) |
| **Licence** | MIT (to be confirmed) |

### Goals

- One shared, versioned component library for all Javaabu React projects. Admin panels first, but equally at home in public portals, citizen portals, kiosks and LMS.
- A modern, clean design language that adapts to each of those contexts (§3).
- Built on shadcn/ui and proven libraries, not reinvented (§4).
- A wide icon set out of the box, with first-class FontAwesome Pro support (§6).
- RTL and Dhivehi are first-class, not afterthoughts.
- Every free-text input can type Thaana via a phonetic (JTK-style) keyboard.
- Re-theme an entire app by changing **one** CSS variable.
- WCAG 2.2 AA accessible by default.
- Every component tested, documented and showcased.

### Non-goals

- A Vue or Flutter port (separate efforts).
- Server-side rendering of interactive-only widgets (maps, signature pad, QR scanner) — these must be SSR-*safe* (no crash on import) but may render a placeholder on the server.

---

## 2. Package & distribution

- **R2.1** Published to npm as `@javaabu/onu`.
- **R2.2** Unlike stock shadcn (copy-paste), Onu ships as an installable, versioned package so fixes propagate to all projects. Components must still be built shadcn-style (composable parts, `cva` variants, `cn()` merging) so a project can eject/copy a component when it really needs to.
- **R2.3** *(Nice to have)* Also publish a shadcn-compatible registry (`registry.json`) so `npx shadcn add` can pull Onu components for teams that prefer copy-paste.
- **R2.4** ESM only, fully tree-shakable, `"sideEffects": ["*.css"]`.
- **R2.5** Subpath exports so heavy features don't bloat the main bundle:
  - `@javaabu/onu` — core components
  - `@javaabu/onu/thaana` — Thaana keyboard engine + hooks
  - `@javaabu/onu/charts`
  - `@javaabu/onu/maps`
  - `@javaabu/onu/editor` — WYSIWYG / block editor / renderer
  - `@javaabu/onu/calendar` — full calendar
  - `@javaabu/onu/media` — cropper, signature pad, QR scanner, media player
  - `@javaabu/onu/icons/iconify` — Iconify adapter
  - `@javaabu/onu/icons/fontawesome` — FontAwesome Free/Pro adapter
  - `@javaabu/onu/fonts.css` — recommended font pack (§7)
  - `@javaabu/onu/styles.css` — theme tokens + base styles
  - `@javaabu/onu/tailwind.css` — Tailwind `@theme` / `@source` entry for consumers
- **R2.6** Heavy or licensed third-party dependencies (map SDKs, chart libs, editors, scanners, FontAwesome, fonts) are **optional peer dependencies**, required only when the matching subpath is imported.
- **R2.7** Peer dependencies: `react` and `react-dom` `^18.3 || ^19`, `tailwindcss` `^4`.
- **R2.8** Ship TypeScript declarations; source written in TypeScript `strict` mode. No `any` in public APIs.
- **R2.9** Every client component file carries a `"use client"` directive so it works in React Server Component environments (Next.js App Router).
- **R2.10** Semantic versioning. Releases managed with [Changesets](https://github.com/changesets/changesets); `CHANGELOG.md` generated from them.
- **R2.11** Bundle-size budget tracked in CI (e.g. `size-limit`); a PR that grows a subpath beyond its budget fails.

## 3. Design language

Onu is used mainly for admin panels, but the same system has to work for public portals, citizen portals, learning platforms, kiosks and print. The design must be modern, neutral and versatile, never "admin-only".

- **R3.1** **Visual style: ProtonAnt, by default.** The primitives are vendored from shadcn/ui's Radix base in the *nova* style (`scripts/sync-shadcn.mjs --style nova`), and Onu's defaults then give them the ProtonAnt look (adopted in October 2026, replacing the earlier *new-york* target):
  - **Proton** (Proton's design system) for colour and the app shell: Proton purple `#6d4aff` as the one brand colour (`--onu-primary`), a warm grey shell (sidebar, header and the frame around content) with the page on a white panel, grey hover and active states, and count pills.
  - **Ant Design** for sizing and detail: 14px body text on a 22px line, 32px controls at the default density, 6px control corners and 8px cards, Ant's primary scale (`--primary-1` … `--primary-8`) and preset tag colours.
  - Shadows are minimal: 1px borders and surface colour do the work; shadows are kept for overlays.
  - This is the only built-in look. It lives entirely in tokens (`tokens.json` → `tokens.css`, `theme.css`) and a few shell classes, not in component logic, so apps re-theme it with `--onu-primary`, `--onu-radius`, the shell tokens (`--shell`, `--shell-foreground`, …) and density, without forking components.
- **R3.2** **Density modes** via `data-density="compact | default | comfortable | touch"` on any container:
  - `compact`: data-heavy admin tables and grids
  - `default`: general admin forms and pages
  - `comfortable`: public and citizen portals, LMS
  - `touch`: kiosks, with ≥ 44px targets and a larger type scale
- **R3.3** **Elevation scale** (flat → raised → overlay → modal) mapped to tokens. In dark mode, raised elements use lighter surfaces instead of heavier shadows.
- **R3.4** **Spacing** on a 4px grid. The **type scale** is fixed for app UIs and fluid (`clamp()`) for portal and marketing pages.
- **R3.5** **Shape** comes from `--onu-radius`, so the same components can look sharp (0), soft (default) or pill-shaped, with presets for each.
- **R3.6** **Motion** is short (150–250ms), purposeful and ease-out. It uses `tw-animate-css` (shadcn's default) and is disabled under `prefers-reduced-motion`.
- **R3.7** **Beyond admin**: layout pieces for portal and content pages (hero, feature grid, content card, masonry). Prose styling (`@tailwindcss/typography`) is tuned for both Latin and Thaana for articles and the laws reader.
- **R3.8** **Data-dense details**: tabular numerals, truncation with tooltip, sticky headers and columns, and zebra/hover rows as options.
- **R3.9** **Print**: print styles for certificates, receipts, invoices and detail views.
- **R3.10** **Foundations first**: before the component build starts, a *Design foundations* page in `web/` (colour, type, spacing, elevation, radius, iconography, density) is reviewed and signed off.

### Figma kit (required)

- **R3.11** A **Figma kit is a required deliverable**. It is a published Figma library that mirrors Onu one-to-one, so designers and developers work from the same system.
- **R3.12** **Tokens are defined once, in code**: a W3C Design Tokens (DTCG) `tokens.json` in the repo. It generates the CSS variables (§9) and is synced to **Figma Variables** (via Tokens Studio or the Figma Variables REST API). Neither side is edited by hand on its own.
  - Variable modes cover light/dark and the density modes, and the primary colour is a single variable, just as in code.
- **R3.13** Every component in the build list (§22) has a Figma component whose properties and variants match the React props and `cva` variants (size, variant, state, density), using the same names.
- **R3.14** The kit includes LTR and RTL versions of components where layout differs, Thaana typography styles, the default Lucide icon set, and text styles for Inter / Faruma / MV Faseyha / JetBrains Mono (§7).
- **R3.15** **Figma Code Connect** links each Figma component to its React component and import, so Dev Mode shows real Onu code snippets.
- **R3.16** The sample pages (§23) also exist as Figma frames, built only from kit components.
- **R3.17** The kit may start from a community shadcn/ui Figma kit if its licence allows. It is versioned alongside the npm package: each release notes the matching kit version, and changes to tokens or components land in both in the same release.

### Responsive design

- **R3.18** **Every component and sample page is responsive** from 320px wide phones up to large desktop screens (≥ 1920px), mobile-first, using Tailwind breakpoints (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536).
- **R3.19** Components adapt to the space they are in, not only the viewport. Container queries (`@container`) are used for cards, forms, tables, filters and widgets that may sit in a sidebar or a narrow column.
- **R3.20** Responsive patterns are built in, not left to each project:
  - tables become labelled cards on phones (§25.6);
  - dropdown panels become bottom sheets on phones (e.g. filters, §25.7);
  - sidebars collapse to an off-canvas drawer; top navigation collapses to a menu;
  - save bars become fixed bottom bars (§25.9);
  - dialogs become full-screen or bottom sheets on small screens where that reads better;
  - multi-column forms stack to one column.
- **R3.21** No horizontal page scrolling at any width. Wide content (tables, code, charts) scrolls inside its own container with visible affordance.
- **R3.22** Text and layout survive 200% zoom and 400% reflow (WCAG 1.4.4 / 1.4.10).
- **R3.23** Visual regression tests run at phone (375px), tablet (768px) and desktop (1280px) widths (§17).

### Touch support

- **R3.24** All interactive components work with touch, mouse, pen and keyboard. Pointer events are used, not mouse-only events.
- **R3.25** Touch targets are at least 44×44px on coarse pointers (`@media (pointer: coarse)`), even in `compact` density.
- **R3.26** Nothing depends on hover alone. Anything revealed on hover (tooltips, row actions, relative date details) also has a tap or always-visible equivalent on touch devices (see §25.5).
- **R3.27** Gestures where they help, always with a button alternative:
  - swipe for carousel, gallery, lightbox and media lister;
  - drag-to-dismiss for bottom sheets and drawers;
  - pull/drag handles for kanban, sortable lists and row reordering (touch sensors with a press delay so scrolling still works);
  - pinch-zoom and drag for image cropper, lightbox and maps;
  - drawing with finger or pen on the signature pad and map drawing tools.
- **R3.28** Pickers (date, time, select, colour) open in a touch-friendly bottom sheet on phones, with large cells, and never trigger the on-screen keyboard unless text entry is needed.
- **R3.29** Correct mobile keyboards via `inputmode` / `type` / `autocomplete` (numeric for OTP and numbers, tel for phone, email, url).
- **R3.30** Safe-area insets (`env(safe-area-inset-*)`) respected for fixed bars, bottom navigation and sheets on notched devices. `touch-action` is set so gestures don't fight page scrolling.

### Form label layouts

- **R3.31** Every form input supports two label layouts:
  - **stacked** (default): label above the input, help text and errors below;
  - **inline** (horizontal): label beside the input in a fixed-width column, input, help and errors in the second column.
- **R3.32** Layout is set per field (`labelLayout="stacked" | "inline"`) or for a whole form/fieldset via `Form` / `FormGroup` / context, with per-field override. The inline label column width is configurable (`--onu-label-width`).
- **R3.33** Inline layout automatically falls back to stacked on narrow containers (container query, R3.19), so it is always responsive.
- **R3.34** In RTL, inline labels sit on the right; label alignment (start / end) is configurable. Checkboxes, radios and switches keep their own label-beside-control pattern in both layouts.
- **R3.35** Both layouts keep correct label association, required markers, help text and error wiring (R14.7).

## 4. Dependency policy

**Don't build from scratch unless nothing good exists.** The order of preference for every component:

1. **shadcn/ui component exists** → use it as the base. Pull it into the package source with the shadcn CLI, then extend it (RTL, Thaana, tokens, locales). Track upstream changes.
2. **No shadcn component, but a reputable library exists** (shadcn-ecosystem libraries preferred) → wrap it in Onu styling and tokens.
3. **Missing accessible widget pattern** → use [React Aria](https://react-spectrum.adobe.com/react-aria/) (Adobe) primitives where Radix has none: tree, colour picker, date/time segment fields, non-Gregorian calendars.
4. **Build in-house** on top of shadcn primitives, only as a last resort. The PR must say why no library was suitable.

A dependency must meet **all** of these criteria:

- **Licence**: MIT, Apache-2.0, ISC, BSD or a similar permissive licence. No GPL/AGPL. Commercial packages are allowed only as **optional adapters** that Onu never bundles (e.g. FontAwesome Pro, §6).
- **Maintained**: a release or meaningful commit within the last 12 months, a responsive issue tracker, and not archived or deprecated.
- **Reputable**: widely adopted, and backed by an organisation or established maintainers.
- **Typed**: first-party TypeScript types.
- **Compatible**: React 18 and 19, SSR-safe, tree-shakable.
- **Accessible and RTL-capable**, or can be made so by wrapping.
- **Reasonable bundle size** for what it provides.

Governance:

- **R4.1** Every runtime and peer dependency is recorded in `DEPENDENCIES.md` with its purpose, licence and the reason it was chosen.
- **R4.2** Renovate (or Dependabot) keeps dependencies current. CI runs a vulnerability scan (`npm audit` / OSV) and a licence check that fails on disallowed licences.
- **R4.3** Dependencies are reviewed quarterly against the criteria above. Current watch-list:
  - `vaul` (shadcn Drawer): its maintainer has signalled reduced maintenance. Follow whatever shadcn moves to, and keep the bottom sheet behind Onu's own API so the underlying library can be swapped.
  - `date-fns` has no Dhivehi locale. Write one and contribute it upstream.
  - FullCalendar: only its MIT "standard" plugins may be used, never the premium ones.

## 5. Technology stack & component sourcing

### Core stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Base components | shadcn/ui, Radix base, *nova* style, restyled to ProtonAnt by default (R3.1) |
| Primitives | Radix UI; React Aria where Radix has gaps |
| Styling | Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`, `clsx`, `tw-animate-css` |
| Icons | Lucide (default), Iconify (wide set), FontAwesome Free/Pro adapter (see §6) |
| Fonts | Inter and JetBrains Mono via Fontsource; Faruma and MV Faseyha for Thaana (see §7) |
| Build | Vite library mode (or `tsup`) emitting ESM + `.d.ts` |
| Forms | `react-hook-form` (components also work uncontrolled or plain controlled) |
| Validation | Schema-agnostic; `zod` used in examples |
| Dates | `date-fns` + `react-day-picker`; `@internationalized/date` for Hijri and date/time fields |
| Unit tests | Vitest + React Testing Library + `user-event` + jsdom |
| a11y tests | `vitest-axe` (axe-core) + `@axe-core/playwright` |
| E2E / visual | Playwright (web app) |
| Docs | Markdown in `/docs`, rendered by Docusaurus (see §19) |

### Sourcing map

What each build-list group is based on. "In-house" means composed from shadcn primitives because no suitable library exists.

| Group | shadcn base | Libraries | In-house |
|---|---|---|---|
| Form scaffolding | `form`, `field`, `label`, `button`, `button-group`, `input-group`, `card`, `separator` | `react-hook-form` (`useFieldArray` for repeating groups) | Required marker, AJAX errors, autosave indicator, save bar, floating submit |
| Text inputs | `input`, `textarea`, `input-group`, `input-otp`, `popover`, `command` | `react-phone-number-input`, `signature_pad`, `barcode-detector` (zxing-wasm polyfill for the native API), `@sindresorhus/slugify`, React Aria `ColorArea`/`ColorSlider`/`ColorField` (colour picker), TanStack Virtual (icon picker grid) | Thaana engine, copy input, sensitive input, tags input (on `command` + `badge`) |
| Date and time | `calendar`, `popover`, date-picker pattern | `react-day-picker`, `date-fns`, React Aria `DateField`/`TimeField` + `@internationalized/date` (Hijri), FullCalendar (standard plugins) | Week picker, reporting-period picker |
| Choice inputs | `select`, `combobox`, `command`, `checkbox`, `radio-group`, `switch`, `toggle-group`, `slider` | `cmdk`, TanStack Query (API select caching and request de-duplication) | Rating, dual listbox, image select, payment method selector, account switcher, dependent/API selects, quick-create |
| Files and media | `avatar`, `progress`, `carousel`, `dialog`, `aspect-ratio` | `react-dropzone`, `react-easy-crop`, `embla-carousel-react`, `yet-another-react-lightbox`, Media Chrome (media player) | Upload progress, media lister, attachment preview, document download, click-to-load embed |
| Rich content | none (shadcn has no editor) | [Tiptap](https://tiptap.dev) (ProseMirror) for the WYSIWYG and block editors; `@tiptap/static-renderer` for the block renderer; Shiki for code highlighting. Only MIT-licensed Tiptap packages may be used, never paid Pro/Cloud extensions | Translations editor, custom attribute fields |
| Maps | none | **Google Maps (default)** via `@vis.gl/react-google-maps`; `terra-draw` + its Google Maps adapter (radius/polygon/route drawing); `@googlemaps/markerclusterer`; deck.gl `GoogleMapsOverlay` (heatmap, replay trails); `@turf/turf`. MapLibre via `react-map-gl` as an optional secondary adapter | Location card, info panel, legend swatch, replay controls, route stop editor |
| Charts | `chart` | `recharts`; map chart as a choropleth on Google Maps (deck.gl `GeoJsonLayer`) | Stat tiles, period comparison |
| Listing pages | `table`, data-table pattern, `pagination`, `dropdown-menu`, `checkbox`, `empty`, `toggle-group` | TanStack Table, TanStack Virtual, `@dnd-kit`, React Aria `Tree`, `react-querybuilder` (filter condition builder) | Kanban, filter panel/chips/tabs, bulk actions, view switcher, load more |
| Overlays | `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `hover-card`, `dropdown-menu`, `context-menu`, `command` | `vaul`, `cmdk`, `yet-another-react-lightbox` | none |
| Loading | `spinner`, `skeleton`, `progress` | none | Loading overlay, page progress bar |
| Layout and navigation | `sidebar`, `navigation-menu`, `menubar`, `breadcrumb`, `tabs`, `accordion`, `card`, `separator`, `collapsible`, `scroll-area`, `resizable` | none | Wizard/stepper, timeline, masonry (CSS columns), mega menu (on `navigation-menu`), notification centre, back to top, skip link, language switcher, theme toggle |
| Display and feedback | `badge`, `avatar`, `kbd`, `alert`, `sonner`, `item`, `empty`, `hover-card` | `sonner`, `Intl.RelativeTimeFormat` / `date-fns` | Countdown, activity feed, comment thread, publish box, cookie consent, share buttons, error pages |

These picks were made against §4. A library may be replaced during implementation only by one that also meets §4 and the RTL, accessibility, theming and dark mode requirements.

## 6. Icons

- **R6.1** An `<Icon>` component gives consistent sizing (size tokens that line up with the text scale) and inherits `currentColor`. It is `aria-hidden` by default; passing `label` makes it a meaningful image (`role="img"` + `aria-label`).
- **R6.2** **Default set: [Lucide](https://lucide.dev)** (`lucide-react`). It is shadcn's default, has 1,600+ consistent-stroke icons, is ISC-licensed and tree-shakable. **Lucide is the default for every project**: no configuration is needed to use it, and every built-in component ships with Lucide icons.
- **R6.3** **Wide set: [Iconify](https://iconify.design)** (`@iconify/react`) gives access to 200,000+ icons across 150+ open sets, e.g. Tabler, Phosphor, Material Symbols, Heroicons, Remix, Fluent, and brand logos via Simple Icons.
  - **Offline mode is required**: collections are registered from `@iconify-json/*` packages, so there are no runtime API calls. This is needed for kiosks, intranets and strict CSP.
- **R6.4** **[FontAwesome](https://fontawesome.com) Free and Pro support** through an adapter at `@javaabu/onu/icons/fontawesome`, built on `@fortawesome/react-fontawesome` + `@fortawesome/fontawesome-svg-core`.
  - All FA styles are supported: solid, regular, light, thin, duotone, the sharp families, brands, and custom icons from FA **Kits** (`@awesome.me/kit-*`).
  - Pro packages are **optional peer dependencies supplied by the consuming project** (Pro needs a licensed token for `npm.fontawesome.com`). Onu never bundles or redistributes Pro icons.
  - CI tests the adapter with the Free packages. It also runs the Pro tests when a `FONTAWESOME_NPM_AUTH_TOKEN` secret is available.
  - Duotone secondary colour is bound to theme tokens (`--fa-primary-color`, `--fa-secondary-color` → `--onu-primary`), so duotone icons follow the theme.
- **R6.5** **One switch for the whole library** (opt-in FontAwesome Pro): components refer to icons by semantic names (`close`, `check`, `chevron-down`, `search`, `calendar`, `upload`, `sort-asc`, `external-link`, …). `OnuProvider icons={...}` maps those names to any set.
  - Ships with `lucideIconMap` (the default) and `fontAwesomeIconMap({ style: 'regular' | 'solid' | 'light' | 'thin' | 'duotone' | 'sharp-…' })`.
  - A project already on FontAwesome Pro can therefore switch every built-in icon with one line.
- **R6.6** Any component that renders an icon accepts overrides (`icon`, `startIcon`, `endIcon`, or slot props) as a React node or component.
- **R6.7** **Icon picker** searches every configured source: Lucide, the registered Iconify collections, and FontAwesome when the adapter is present.
  - Virtualised grid, keyword search, set and style filters, recently used.
  - The value is a portable string id, e.g. `lucide:house`, `tabler:home`, `fa:regular:house`.
  - A matching `<DynamicIcon id="…">` renders stored ids, e.g. from a CMS or a menu builder.
- **R6.8** A curated list of directional icons (arrows, chevrons, undo/redo, reply, log-in/out, …) is mirrored automatically in RTL (see R11.4). This works for every icon source.

## 7. Typography & fonts

Recommended font pack. Latin and mono fonts are open-licensed (OFL) and **self-hosted via [Fontsource](https://fontsource.org) npm packages**, so there are no third-party CDN calls and fonts work offline, on intranets and on kiosks.

| Role | Font | Why | Package |
|---|---|---|---|
| UI sans (default) | **Inter** (variable) | The de-facto modern UI typeface. Excellent legibility at small admin sizes, tabular figures, wide language coverage, optical-size axis for display headings | `@fontsource-variable/inter` |
| Thaana | **Faruma** (text) and **MV Faseyha** (headings, bold) | The familiar, highly legible Thaana face used across Maldivian government and media sites, so Dhivehi text looks the way readers expect | Bundled `woff2` in `@javaabu/onu/fonts` (subject to redistribution rights, see R7.3) |
| Monospace | **JetBrains Mono** (variable) | Code blocks, API keys, IDs, keyboard keys | `@fontsource-variable/jetbrains-mono` |
| Alternative UI sans | **Geist** (variable) | A slightly more geometric, contemporary option. Shipped as a preset for products that want a different feel | `@fontsource-variable/geist` |
| Serif (optional) | **Source Serif 4** (variable) | Long-form reading: news articles, the laws and regulations reader, certificates | `@fontsource-variable/source-serif-4` |

- **R7.1** Fonts are not bundled into the JS. They are an optional CSS entry, `@javaabu/onu/fonts.css`, which imports the recommended Fontsource packages (optional peer dependencies). Projects can skip it and set the `--onu-font-*` tokens to their own fonts.
- **R7.2** Font stacks rely on per-script `unicode-range`, so mixed Dhivehi/English text automatically renders each script in the right font:
  `--onu-font-sans: "Inter Variable", "Faruma", "MV Faseyha", ui-sans-serif, system-ui, sans-serif;`
  Under `lang="dv"`, Thaana-specific metrics (line-height, size-adjust) apply.
- **R7.3** **Faruma is the default Thaana font, with MV Faseyha for headings and bold.** (Changed from MV Waheed in October 2026.)
  - It is self-hosted as `woff2`, subset to the Thaana Unicode range and served with `unicode-range`, so it only downloads when Thaana text appears.
  - Both fonts are free to use and redistribute (confirmed by Javaabu) and are bundled in `fonts.css`.
  - Both have a single weight. Bold Thaana avoids faux bold: headings and bold text use MV Faseyha via `--onu-font-thaana-bold`.
  - Fallback chain: `"Faruma", "MV Faseyha", "Noto Sans Thaana", sans-serif` (headings: `"MV Faseyha", "Faruma", …`). Other Thaana fonts can be swapped in via `--onu-font-thaana`.
- **R7.4** `font-display: swap`, metric-matched fallbacks (`size-adjust`, `ascent-override`) to minimise layout shift, and preload guidance in the docs.
- **R7.5** Tabular figures (`font-variant-numeric: tabular-nums`) in tables, stat tiles, pagination, countdowns and any column of numbers.
- **R7.6** Typography tokens: `--onu-font-sans`, `--onu-font-thaana`, `--onu-font-mono`, `--onu-font-serif`, plus a type-scale and line-height token per density mode.

## 8. Browser support

- **R8.1** Support every browser supported by the latest stable Tailwind CSS (v4.x at time of writing): **Chrome/Edge 111+, Safari 16.4+, Firefox 128+**, plus their mobile counterparts (iOS Safari 16.4+, Chrome Android).
- **R8.2** Features beyond that baseline (e.g. `BarcodeDetector`, Popover API, View Transitions) must be feature-detected with a working fallback.
- **R8.3** Playwright CI runs against Chromium, Firefox and WebKit.

## 9. Theming

- **R9.1** **One variable switches the whole brand colour**: setting `--onu-primary` (any CSS colour, e.g. `oklch(0.55 0.15 150)` or `#1f7a4d`) recolours the entire library.
- **R9.2** All derived shades (hover, active, subtle backgrounds, rings, foreground-on-primary) are computed from `--onu-primary` using CSS relative colour syntax / `color-mix()` in OKLCH, so no build step or JS is needed to re-theme.
- **R9.3** Foreground colour on primary is chosen automatically to meet WCAG AA contrast, overridable via `--onu-primary-foreground`.
- **R9.4** Additional granular tokens, following the shadcn token naming so shadcn docs/themes stay applicable:
  - Colour: `--onu-background`, `--onu-foreground`, `--onu-card`, `--onu-popover`, `--onu-secondary`, `--onu-muted`, `--onu-accent`, `--onu-destructive`, `--onu-success`, `--onu-warning`, `--onu-info`, `--onu-border`, `--onu-input`, `--onu-ring`, each with a `-foreground` pair where relevant.
  - Charts: `--onu-chart-1` … `--onu-chart-8`.
  - Sidebar: `--onu-sidebar`, `--onu-sidebar-foreground`, `--onu-sidebar-primary`, `--onu-sidebar-accent`, `--onu-sidebar-border`.
  - Shape: `--onu-radius` (all radii derive from it).
  - Typography: `--onu-font-sans`, `--onu-font-thaana`, `--onu-font-mono`.
  - Density: `--onu-spacing-scale` (compact / comfortable layouts, e.g. kiosk vs admin).
- **R9.5** Tokens are exposed to Tailwind via `@theme inline` so consumers write `bg-primary`, `text-muted-foreground`, `rounded-lg`, etc.
- **R9.6** Themes can be scoped: setting variables on any element re-themes that subtree only.
- **R9.7** Ship a few preset themes (e.g. *Onu green* default, neutral, blue) and a theme-builder page in the web app that outputs the CSS to copy.

## 10. Dark mode

- **R10.1** Every component ships a dark variant. No component may hard-code light-only colours.
- **R10.2** Dark mode is activated by a `.dark` class or `[data-theme="dark"]` on an ancestor (Tailwind `@custom-variant dark`), so it works with any toggling strategy.
- **R10.3** Provide `<ThemeProvider>` + `useTheme()` supporting `light`, `dark` and `system`, persisted to `localStorage`, with a no-flash inline script helper for SSR apps.
- **R10.4** Derived primary shades are re-computed for dark mode so the single `--onu-primary` still meets contrast on dark backgrounds.
- **R10.5** Tests and visual snapshots run in both modes.

## 11. RTL support

- **R11.1** Every component works correctly in `dir="rtl"` out of the box, with no extra props.
- **R11.2** Use logical properties/utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `rounded-s-*`, `border-e`, …). Physical `left/right` utilities are banned by a lint rule except where explicitly justified.
- **R11.3** `<DirectionProvider dir="rtl">` (wrapping Radix's `DirectionProvider`) propagates direction to all primitives; components also respect the nearest `dir` attribute.
- **R11.4** Directional icons (chevrons, arrows, back/next, breadcrumb separators) mirror in RTL; non-directional icons (play, checkmarks, logos) do not.
- **R11.5** Keyboard navigation follows visual order in RTL (e.g. `ArrowLeft` moves "forward" in tabs, sliders, carousels, calendars, menus).
- **R11.6** Sliders, progress bars, carousels, steppers, timelines, pagination and charts render mirrored in RTL where semantically appropriate.
- **R11.7** Mixed-direction content is handled: inputs for Latin-only data (email, URL, phone, numbers, codes, OTP) are forced `dir="ltr"` even inside an RTL page; free text uses `dir="auto"` unless set.
- **R11.8** Every component is tested in both LTR and RTL.

## 12. Dhivehi support

- **R12.1** Dhivehi (`dv`) and English (`en`) are built-in locales. All built-in strings (e.g. "Close", "Next", "No results", "Required", pagination labels, date picker labels, aria-labels) come from a locale dictionary — no hard-coded English.
- **R12.2** `<OnuProvider locale="dv">` sets locale, direction (auto RTL for `dv`) and fonts in one place. Consumers can override or add locales and individual strings.
- **R12.3** Thaana font stack configured via `--onu-font-thaana`. The default is Faruma (MV Faseyha for headings); other Thaana fonts can be plugged in (see §7).
- **R12.4** Typography tuned for Thaana: adjusted line-height and letter-spacing, no faux italics, correct baseline alignment of Thaana next to Latin text and icons.
- **R12.5** Dates in Dhivehi: Dhivehi month and weekday names, Dhivehi relative-time strings ("2 ދުވަސް ކުރިން"), and optional Hijri display (see Hijri date component).
- **R12.6** Numbers use Western Arabic digits by default (as is standard in the Maldives), with formatting via `Intl` and the active locale.
- **R12.7** Week start is configurable (default Sunday for `dv`, configurable for `en`).
- **R12.8** Sorting / search in selects and tables handle Thaana text (use `Intl.Collator`).
- **R12.9** Pluralisation and interpolation in built-in strings are supported for both locales.

## 13. Thaana (JTK) input

Javaabu currently uses the JTK (JavaScript Thaana Keyboard) approach for typing Thaana on a Latin keyboard. Onu needs a React-native equivalent.

- **R13.1** Build a standalone, framework-agnostic Thaana keyboard engine (`@javaabu/onu/thaana`) with:
  - Phonetic keymap (default, JTK-compatible) and Typewriter keymap; custom keymaps pluggable.
  - Pure functions for Latin → Thaana conversion of a keystroke and of a whole string (useful for paste and tests).
- **R13.2** React bindings:
  - `useThaanaInput(ref, options)` hook that can be attached to any `<input>`, `<textarea>` or `contenteditable`.
  - `thaana` and `thaanaToggle` props on `<TextInput>` and `<Textarea>`.
  - A Tiptap extension (`ThaanaKeyboard`) so the WYSIWYG and block editors type Thaana through ProseMirror transactions rather than raw DOM edits.
- **R13.3** **Every component that accepts free text** exposes a `thaana` prop (`boolean | ThaanaOptions`), including: Text input, Textarea, Search box, Autocomplete, Searchable select / Multi-select search field, Tags input, Inline edit, Editable select, Combobox-style inputs, Command palette, Translations editor, Notes, Comment thread composer, WYSIWYG and Block editor. Inputs whose content must be Latin (email, password, URL, number, phone, OTP, slug, colour) do **not** offer it.
- **R13.4** When `thaana` is on, the field sets `dir="rtl"`, `lang="dv"` and the Thaana font automatically.
- **R13.5** Optional per-field toggle (button and keyboard shortcut) to switch between Thaana and Latin while typing; the current mode is announced to screen readers.
- **R13.6** Must work with:
  - Caret position and selection replacement (typing over a selection, mid-string inserts).
  - Undo/redo (native undo stack preserved as far as browsers allow).
  - Controlled and uncontrolled inputs, and `react-hook-form`.
  - Modifier keys and shortcuts (Ctrl/Cmd combos pass through untouched).
  - **Mobile/Android** soft keyboards (implement via `beforeinput`/`input` events, not only `keydown`, since Android reports keyCode 229).
  - IME composition events (don't interfere with an OS-level Thaana keyboard; if the user already types Thaana natively, pass it through).
  - Paste: configurable — keep as-is (default) or transliterate Latin.
- **R13.7** 100% unit-test coverage of the keymaps and conversion functions.

## 14. Accessibility

- **R14.1** Conform to **WCAG 2.2 Level AA** for every component in every state, in both light and dark mode and in LTR and RTL.
- **R14.2** Follow the WAI-ARIA Authoring Practices pattern for each widget type (combobox, listbox, menu, dialog, tabs, tree, grid, slider, etc.).
- **R14.3** Full keyboard operability; visible focus indicator (`:focus-visible` ring using `--onu-ring`, ≥ 3:1 contrast, not obscured — WCAG 2.4.11).
- **R14.4** Focus management: dialogs/drawers trap and restore focus; route-level components provide a Skip link.
- **R14.5** Minimum target size 24×24 CSS px (WCAG 2.5.8); 44×44 for kiosk density.
- **R14.6** Colour is never the only means of conveying information (status badges, validation, charts use icon/text/pattern too).
- **R14.7** Form fields: programmatic labels, `aria-describedby` wiring for help text and errors, `aria-invalid`, `aria-required`, error summaries focusable after submit, live-region announcements for async validation and autosave.
- **R14.8** Respect `prefers-reduced-motion` and `prefers-contrast`.
- **R14.9** Charts and maps provide accessible alternatives (data table / text summary, keyboard-operable markers and controls).
- **R14.10** Media: captions/track support for the media player; alt text required (typed as required prop) for image components.
- **R14.11** Every component has automated axe tests (zero violations) and documented keyboard interactions; complex widgets also get manual screen-reader checks (NVDA + Firefox, VoiceOver + Safari) recorded in the PR.
- **R14.12** `lang` attributes set correctly on mixed Dhivehi/English content so screen readers switch voice.

## 15. Style overrides & customisation

- **R15.1** Every component accepts `className`, merged with defaults via `cn()` (`tailwind-merge`) so consumer classes win.
- **R15.2** Compound components expose a `classNames` prop keyed by slot (e.g. `classNames={{ trigger, content, item }}`) as well as being composable from their parts.
- **R15.3** Variants defined with `cva` and exported (e.g. `buttonVariants`) so consumers can reuse/extend them.
- **R15.4** `asChild` (Radix `Slot`) supported wherever rendering a different element makes sense (buttons, links, triggers).
- **R15.5** All native props and `ref` forwarded to the underlying DOM element; `data-slot`, `data-state`, `data-variant`, `data-size` attributes exposed for styling hooks.
- **R15.6** Icons are injectable: components accept icon props/slots, and a global icon map can be supplied via `OnuProvider` (see §6).
- **R15.7** No `!important`, no inline styles except where values are dynamic (positions, progress widths).
- **R15.8** Global defaults (size, variant, radius, density) configurable via `OnuProvider`.

## 16. Framework integration

- **R16.1** Framework-agnostic React: works in Vite SPA, Laravel + Inertia (React), and Next.js.
- **R16.2** Link-rendering components (Link button, Breadcrumbs, Side navigation, Pagination, Nav tabs, Conditional link, …) accept a pluggable link component via `OnuProvider` (`linkComponent={InertiaLink}`) or `asChild`.
- **R16.3** **Laravel validation compatibility**: Field errors and AJAX validation errors accept Laravel's `422` payload (`{ message, errors: { "field.0.name": [...] } }`) directly, including nested/array dot-notation keys, and map them to fields (also via `react-hook-form` `setError`).
- **R16.4** Pagination accepts Laravel paginator / API resource `meta` + `links` shapes out of the box.
- **R16.5** **API select must fetch options asynchronously from any API URL.** Autocomplete and Dependent select reuse the same data layer.
  - **Source**: either a `url` (any endpoint, same-origin or cross-origin) or a custom `fetcher(query, { page, signal })` function. The default fetcher uses `fetch`, so there is no hard dependency on any HTTP client.
  - **Request options**: method, headers, `credentials`, and extra static or dynamic params. The names of the search, page and per-page params are configurable (defaults: `search`, `page`, `per_page`).
  - **Response mapping**: options can be read from any response shape, via a path to the items array (e.g. `data`, `results.items`) plus `valueKey` / `labelKey`, or a `mapOption(item)` function. Laravel JSON resources and paginators work without any configuration.
  - **Searching**: requests are debounced (default 300ms) and have an optional minimum query length. When the user keeps typing, older in-flight requests are cancelled with `AbortController`, so a slow early response can never overwrite a newer one.
  - **Paging**: options load page by page as the list scrolls (infinite scroll) when the API is paginated.
  - **Preloading**: options can load on open, or immediately (`preload`).
  - **Showing the current value**: if a value is already set (e.g. on an edit page), its label is shown without opening the list. The label comes from `initialOptions`, or from a fetch to a `valueUrl` / `fetchById`.
  - **States**: loading, empty ("No results for …"), and error with a **Retry** button. All are announced to screen readers.
  - **Caching**: results are cached per URL + query (TanStack Query), with a configurable lifetime and manual invalidation, e.g. after quick-create.
  - **Dependent use**: params can come from other field values. When the parent field changes, the child refetches and its value clears.
  - **Shared behaviour**: single and multi-select, `thaana` search input, RTL, and full keyboard support, as for Searchable select.
- **R16.6** CSRF and auth are the consumer's concern; components never perform network requests without a consumer-supplied URL/fetcher.
- **R16.7** *(Removed.)* Onu does not ship provider-branded components (eFaas sign-in button, eFaas logos). Apps pass their own single sign-on button to `SignInForm`'s `sso` slot, following the provider's branding guidelines.
- **R16.8** *(Removed.)* Onu does not ship a payment method selector or BML logos. Apps build the choice from `RadioGroup` (`variant="card"`) with the gateway's own assets.
- **R16.9** **Maps default to Google Maps.**
  - `OnuProvider` (or `<MapProvider>`) takes the Google Maps API key and an optional Map ID (needed for vector maps, advanced markers and cloud-based styling).
  - Map styles follow light/dark mode and the theme tokens. The map UI language follows the active locale (`dv`/`en`) and direction.
  - Google has deprecated its Drawing Library and its Heatmap Layer, so neither may be used. Drawing (radius, polygon, route) uses `terra-draw`; heatmaps and replay trails use deck.gl.
  - Map components are written against an internal adapter interface. A MapLibre adapter (no API key, self-hostable tiles, useful for offline kiosks) can be added without changing the component APIs.

## 17. Testing, CI & coverage

- **R17.1** Every component has tests covering: rendering, responsive behaviour, touch interaction where relevant, variants, controlled/uncontrolled behaviour, keyboard interaction, RTL, dark mode class application, `className`/`classNames` overrides, and axe accessibility.
- **R17.2** Coverage thresholds enforced in CI (initial target: **90% lines/statements/functions, 85% branches**; 100% for the Thaana engine). CI fails below threshold.
- **R17.3** Playwright tests run against the web app (Chromium, Firefox, WebKit) for interaction-heavy components and sample pages, including visual regression snapshots in light/dark × LTR/RTL × phone/tablet/desktop widths, plus touch emulation on mobile device profiles.
- **R17.4** GitHub Actions workflows:
  - `ci.yml` (PRs + `main`): install → lint (ESLint, incl. logical-property rule) → format check (Prettier) → typecheck → unit tests with coverage → build package → build examples → build docs → size check.
  - `e2e.yml`: Playwright across browsers.
  - `release.yml`: Changesets version PR + publish to npm with provenance.
- **R17.5** Coverage uploaded to Codecov (or Coveralls).
- **R17.6** `README.md` displays badges for: CI test status, coverage, npm version, licence.

  ```md
  [![Tests](https://github.com/Javaabu/onu/actions/workflows/ci.yml/badge.svg)](https://github.com/Javaabu/onu/actions/workflows/ci.yml)
  [![codecov](https://codecov.io/gh/Javaabu/onu/branch/main/graph/badge.svg)](https://codecov.io/gh/Javaabu/onu)
  [![npm](https://img.shields.io/npm/v/@javaabu/onu)](https://www.npmjs.com/package/@javaabu/onu)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
  ```

## 18. Examples

- **R18.1** A `web/` directory (the docs site) containing a runnable Vite + React + TypeScript app consuming the package via the workspace (`pnpm` workspaces).
- **R18.2** **Component showcase**: one page per component demonstrating every variant, size and state (default, hover, focus, disabled, loading, error, empty), with copyable code.
- **R18.3** Global toolbar on every page to toggle: light/dark, LTR/RTL, `en`/`dv` locale, primary colour (colour picker driving `--onu-primary`), density.
- **R18.4** **Sample pages** (see §23) built only from Onu components and realistic mock data (Dhivehi + English), demonstrating real-world composition.
- **R18.5** Deployed as a static site (e.g. GitHub Pages) on every push to `main`, linked from the README and docs.
- **R18.6** Examples app is used as the Playwright test target.

## 19. Developer documentation

Docs live in `/docs` and follow the exact format used in [`@javaabu/js-utilities`](https://github.com/Javaabu/js-utilities/tree/main/docs) (Docusaurus-rendered markdown, served on Javaabu's docs site).

- **R19.1** `docs/metadata.json`:
  ```json
  {
      "name": "Onu",
      "description": "React UI component library for Javaabu projects",
      "version": "1"
  }
  ```
- **R19.2** Top-level pages, each with front matter (`title`, `sidebar_position`):

  | File | `sidebar_position` |
  |---|---|
  | `intro.md` | 1.0 |
  | `requirements.md` | 1.1 |
  | `installation-and-setup.md` | 1.2 |
  | `questions-and-security.md` | 1.4 |
  | `changelog.md` (links to `CHANGELOG.md` on GitHub) | 1.5 |
  | `about-us.md` | 1.6 |
  | `contributing-to-docs.md` | 99 |

- **R19.3** Guide pages (in a `docs/guides/` category): design language & density, icons (incl. FontAwesome Pro setup), fonts, theming, dark mode, RTL, Dhivehi & locales, Thaana input, accessibility, style overrides, forms & Laravel validation, Inertia/Next.js integration.
- **R19.4** One folder per build-list group, each with a `_category_.json` (`position`, `label`, `collapsible`, `collapsed`, `link.type: "generated-index"`, `link.slug: "/onu/_categories/<group>"`, `link.description`), e.g. `docs/form-scaffolding/`, `docs/text-inputs/`, `docs/date-and-time/`, … matching §22.
- **R19.5** One markdown file per component with front matter, containing: short description, import snippet, basic usage, props table, variants, slots/`classNames`, RTL & Thaana notes, accessibility notes (keyboard interactions table), and examples. Use Docusaurus admonitions (`:::info`, `:::warning`) where helpful.
- **R19.6** Docs are updated in the same PR as the component change; CI checks every exported component has a docs page.

## 20. Repository structure

Proposed (pnpm workspace):

```
onu/
├── .changeset/
├── .github/workflows/        # ci.yml, e2e.yml, release.yml
├── docs/                     # Docusaurus-format markdown (see §19)
├── figma/                    # Code Connect mappings + token sync scripts
├── web/                      # Vite docs site: showcase + sample pages
├── packages/
│   └── onu/                  # @javaabu/onu
│       ├── src/
│       │   ├── components/   # one folder per component (component, test, index)
│       │   ├── thaana/       # keyboard engine + hooks
│       │   ├── icons/        # Icon, DynamicIcon, semantic icon maps, Iconify + FontAwesome adapters
│       │   ├── charts/ maps/ editor/ calendar/ media/
│       │   ├── hooks/ lib/ locales/ providers/
│       │   └── styles/       # generated tokens.css, base.css, tailwind.css
│       └── package.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md
├── README.md
├── REQUIREMENTS.md
└── tokens.json               # DTCG design tokens: source for CSS + Figma Variables
```

## 21. Component definition of done

A build-list item is ticked only when all of the following are true:

- [ ] Implemented in TypeScript with exported prop types and `ref` forwarding
- [ ] Works in light and dark mode
- [ ] Works in LTR and RTL, and with `locale="dv"`
- [ ] `thaana` prop supported (if it accepts free text)
- [ ] Themed only through tokens (re-colours with `--onu-primary`)
- [ ] Responsive (phone, tablet, desktop) and touch-friendly (§3 R3.18–R3.30)
- [ ] Looks right in every density mode it supports, and outside admin contexts where relevant
- [ ] Built on the shadcn component / approved library per §4–§5; any in-house build is justified in the PR
- [ ] Uses semantic icon names so it follows the configured icon set
- [ ] `className` / `classNames` / `asChild` overrides as applicable
- [ ] Meets WCAG 2.2 AA; axe tests pass; keyboard interactions documented
- [ ] Matches the expected UI behaviour in §25 where that component is specified, with a test for each listed behaviour
- [ ] Unit tests meeting coverage thresholds
- [ ] Matching Figma component published in the kit, with Code Connect
- [ ] Showcase page in `web/`
- [ ] Docs page in `docs/`
- [ ] Changeset added

---

## 22. UI build list

### Form scaffolding
- [ ] Form
- [ ] Form group
- [ ] Fieldset / form section
- [ ] Label
- [ ] Required marker
- [ ] Field errors
- [ ] AJAX validation errors
- [ ] Help text
- [ ] Form container
- [ ] Repeating group
- [ ] Inline edit
- [ ] Autosave indicator
- [ ] Save buttons bar
- [ ] Floating submit
- [ ] Submit button
- [ ] Button
- [ ] Link button
- [ ] Button group
- [ ] Auth forms (sign in, register, reset password)

### Text inputs
- [ ] Text input
- [ ] Email input
- [ ] Password input
- [ ] Sensitive input (masked secret)
- [ ] Copy input
- [ ] Number input
- [ ] Quantity stepper
- [ ] Number with unit add-on
- [ ] Phone input
- [ ] URL input
- [ ] Hidden input
- [ ] Textarea
- [ ] Thaana input
- [ ] OTP input
- [ ] Slug generator
- [ ] Autocomplete
- [ ] Colour picker
- [ ] Icon picker
- [ ] Signature pad
- [ ] Tags input
- [ ] QR code scanner

### Date and time
- [ ] Date picker
- [ ] Date-time picker
- [ ] Time picker
- [ ] Date-time range
- [ ] Month / year picker
- [ ] Hijri date
- [ ] Full calendar (month, week, day, agenda)
- [ ] Multiple-date picker
- [ ] Week picker
- [ ] Reporting-period picker

### Choice inputs
- [ ] Select
- [ ] Searchable select
- [ ] Dependent select
- [ ] API select
- [ ] Editable select
- [ ] Multi-select
- [ ] Dual listbox
- [ ] Checkbox
- [ ] Radio
- [ ] Radio group
- [ ] Switch
- [ ] Segmented control
- [ ] Range slider
- [ ] Rating
- [ ] Account switcher
- [ ] Image select
- [ ] Select with quick-create

### Files and media
- [ ] File input
- [ ] Instant file upload
- [ ] Additional files upload
- [ ] Multiple file input
- [ ] Upload progress
- [ ] Image input
- [ ] Avatar upload
- [ ] Image cropper
- [ ] Drag-and-drop uploader
- [ ] Media lister
- [ ] Gallery
- [ ] Carousel
- [ ] Attachment preview
- [ ] Document download
- [ ] Media player
- [ ] Click-to-load video embed

### Rich content
- [ ] WYSIWYG editor
- [ ] Block editor
- [ ] Block renderer
- [ ] Code block
- [ ] Translations editor
- [ ] Custom attribute fields

### Maps
- [ ] Map picker
- [ ] Map radius
- [ ] Map polygon
- [ ] Map route
- [ ] Live map
- [ ] Map navigation
- [ ] Location card
- [ ] Address
- [ ] Map replay
- [ ] Map info panel
- [ ] Route stop editor
- [ ] Heatmap layer
- [ ] Viewport-loaded marker map
- [ ] Map legend swatch

### Charts
- [ ] Bar graph
- [ ] Line graph
- [ ] Pie chart
- [ ] Map chart
- [ ] Stat tiles
- [ ] Time-series chart
- [ ] Period comparison chart
- [ ] Sparkline

### Listing pages
- [ ] Table
- [ ] Editable data grid
- [ ] List view
- [ ] Grid view
- [ ] Kanban board
- [ ] Tree view
- [ ] Sortable list
- [ ] View switcher
- [ ] Column visibility
- [ ] Filter panel
- [ ] Active filter chips
- [ ] Filter submit
- [ ] Filter tabs
- [ ] Search box
- [ ] Search results
- [ ] Per page
- [ ] Bulk actions
- [ ] Export menu
- [ ] Pagination
- [ ] Load more
- [ ] Empty state
- [ ] Row actions
- [ ] Record actions menu
- [ ] Filter condition builder
- [ ] Drag-and-drop row reordering

### Overlays
- [ ] Modal
- [ ] Confirm dialog
- [ ] Slide-over
- [ ] Bottom sheet (pull-up drawer)
- [ ] Popover
- [ ] Tooltip
- [ ] Dropdown menu
- [ ] Context menu
- [ ] Command palette
- [ ] Lightbox

### Loading
- [ ] Spinner
- [ ] Placeholder input (skeleton)
- [ ] Skeleton text, card and table
- [ ] Loading overlay
- [ ] Page progress bar
- [ ] Progress bar

### Layout and navigation
- [ ] App layout
- [ ] Header
- [ ] Top navigation bar
- ~~Menu bar~~ *(Removed.)* Desktop-application menus do not appear in web admin panels or portals; the shadcn `Menubar` primitive is still exported from `@javaabu/onu/primitives`.
- [ ] Mega menu
- [ ] Sidebar
- [ ] Side navigation
- [ ] Mobile bottom navigation
- [ ] Footer
- [ ] Page title
- [ ] Breadcrumbs
- [ ] Section
- [ ] Card
- [ ] Tabs
- [ ] Nav tabs
- [ ] Stacked tabs
- [ ] Accordion
- [ ] Wizard
- [ ] Timeline
- [ ] Divider
- [ ] Language switcher
- [ ] Theme toggle
- [ ] Notification centre
- [ ] User profile widget
- [ ] Logo
- [ ] Skip link
- [ ] Back to top
- [ ] Masonry grid
- [ ] Full-screen overlay menu

### Display and feedback
- [ ] Description list
- [ ] Status badge
- [ ] Tag / chip
- [ ] Avatar
- [ ] Avatar group
- [ ] Keyboard key
- [ ] Alert
- [ ] Notice
- [ ] Announcement bar
- [ ] Cookie consent
- [ ] Toast
- [ ] Conditional link
- [ ] Conditional display
- [ ] Publish box
- [ ] Last edited by
- [ ] Relative date
- [ ] Countdown
- [ ] Activity feed
- [ ] Comment thread
- [ ] Icon with text
- [ ] Share buttons
- [ ] Print and back buttons
- [ ] Calendar
- [ ] Notes
- [ ] Content card
- [ ] Error pages (403, 404, 500, maintenance)

### Foundations (implied by the requirements above)
- [ ] `OnuProvider` (locale, direction, link component, icons, defaults)
- [ ] `ThemeProvider` / `useTheme`
- [ ] `DirectionProvider`
- [ ] Locale dictionaries (`en`, `dv`)
- [ ] Thaana keyboard engine + `useThaanaInput`
- [ ] Design tokens & preset themes
- [ ] Density modes
- [ ] `Icon`, `DynamicIcon` and semantic icon maps (Lucide, Iconify, FontAwesome)
- [ ] Font pack (`fonts.css`)
- [ ] `tokens.json` (DTCG) → CSS variables + Figma Variables sync
- [ ] Figma kit (foundations, components, sample page frames, Code Connect)
- [ ] Dhivehi `date-fns` locale
- [ ] `cn()` and shared utilities
- [ ] Visually hidden / live region utilities

---

## 23. Sample pages

All sample pages live in `web/` and must render correctly in light/dark, LTR/RTL and `en`/`dv`.

### Auth
- [ ] Sign in (email and single sign-on)
- [ ] Register
- [ ] Forgot password
- [ ] Reset password
- [ ] Two-factor / OTP verification
- [ ] Account locked / email verification

### Admin: records
- [ ] Dashboard
- [ ] Index (table with filters, bulk actions, pagination)
- [ ] Index (list view)
- [ ] Index (grid view)
- [ ] Index (kanban board)
- [ ] Create form
- [ ] Edit form
- [ ] Show / detail view
- [ ] Show with tabs (details, documents, history, notes)
- [ ] Trash (restore and force delete)
- [ ] Activity log
- [ ] Import (upload, map columns, preview, confirm)
- [ ] Export

### Admin: content
- [ ] Post editor (title, slug, content, publish box, featured image)
- [ ] Page builder (block editor)
- [ ] Media library
- [ ] Menu builder
- [ ] Translations

### Admin: settings and access
- [ ] Settings
- [ ] Users index
- [ ] User profile
- [ ] Roles and permissions
- [ ] API keys / OAuth clients
- [ ] Notifications

### Applications and workflows
- [ ] Application wizard (multi-step form)
- [ ] Application review (approve / reject with remarks)
- [ ] Application status tracker (timeline)
- [ ] Document upload checklist
- [ ] Payment checkout
- [ ] Payment receipt
- [ ] Certificate / licence view and print

### Public portal
- [ ] Home
- [ ] Services directory
- [ ] Service detail
- [ ] News index
- [ ] News article
- [ ] Gallery
- [ ] Events calendar
- [ ] Event detail
- [ ] Job listings
- [ ] Job detail and apply
- [ ] Search results
- [ ] Contact
- [ ] About
- [ ] Laws and regulations reader

### Citizen / member portal
- [ ] Portal dashboard
- [ ] My applications
- [ ] My documents
- [ ] My payments
- [ ] Profile and delegation (switch account)
- [ ] Notifications inbox

### Learning
- [ ] Course catalogue
- [ ] Course detail
- [ ] Lesson player
- [ ] Quiz
- [ ] Quiz result
- [ ] Certificate

### Maps and operations
- [ ] Fleet / vessel live tracking
- [ ] Zone management (polygons)
- [ ] Route planner
- [ ] Location picker (create record with map)
- [ ] Reports and analytics (charts)

### Kiosk
- [ ] Start screen
- [ ] Payment method selection
- [ ] Payment in progress
- [ ] Payment success
- [ ] Payment failed
- [ ] Maintenance panel

### System
- [ ] 403 Forbidden
- [ ] 404 Not found
- [ ] 500 Server error
- [ ] 503 Maintenance
- [ ] Empty first-run state
- [ ] Print layout

---

## 24. Open questions

To be resolved before (or while) building the affected components:

1. **Licence** — MIT like other Javaabu packages, or private/internal?
2. **Google Maps billing**: whose Google Cloud project/API key is used for the web app and CI, and is a Map ID set up for vector maps?
3. ~~**Thaana font licence**~~: resolved. Faruma and MV Faseyha are free to redistribute; Javaabu supplied the files.
4. **FontAwesome Pro**: which Pro licence/Kit should CI use (needs a `FONTAWESOME_NPM_AUTH_TOKEN` secret)?
5. **Figma**: which Figma team/workspace hosts the library, and is a paid plan with Dev Mode available for Code Connect?
6. **Default primary colour** — exact Javaabu/Onu brand colour value.
7. **Docs hosting** — confirm the Docusaurus docs site that consumes `/docs` (same as js-utilities) and its slug (`/onu`).
8. **Component semantics to confirm**:
   - *Custom attribute fields* — schema shape (align with an existing Javaabu Laravel package?).
   - *Reporting-period picker* — fiscal periods (monthly/quarterly/yearly) with custom fiscal year start?
   - *Map navigation* / *Map replay* — data shape for tracks (GeoJSON LineString with timestamps?).
9. **React Native / Flutter parity** — should token names align with the Flutter design system for cross-platform consistency?

---

## 25. Expected UI behaviour

> Directions in this section (left/right, ‹/›) describe the LTR layout. In RTL they mirror (§11). All visible text comes from the locale dictionaries (§12).

How each component should look and act from the user's point of view: what appears, and what happens when they click, type or press a key.

### 25.1 Date picker

#### Field
- Shows the selected date in the configured format (e.g. `12/03/2026`), or a placeholder like "Select a date" when empty.
- Clicking the field (or pressing Enter/Space on it) opens the picker below it.
- A disabled field does nothing when clicked.
- A field with an error is highlighted, and the error message shows underneath.

#### Days view (what opens first)
- Shows one month as a grid, with weekday names across the top.
- The month shown is the one containing the selected date, or today's month if the field is empty.
- Today is marked. The selected date is highlighted.
- Weekend days are visually distinct.
- Days from the previous and next month fill the first and last rows, dimmed.
- Clicking a day selects it, closes the picker, and shows the date in the field.
- **‹** and **›** arrows move to the previous and next month.
- Dates outside the allowed range are greyed out and can't be clicked.
- Opening the picker does **not** select anything by itself; the field stays empty until the user clicks a day.

#### Zooming out
- The header shows the month and year, e.g. "March 2026".
- **Clicking "March 2026"** switches to the **months view**: a grid of the 12 months of 2026.
  - Clicking a month goes back to the days view for that month.
  - ‹ › move to the previous and next year.
- **Clicking "2026" in the months view** switches to the **years view**: a grid of 12 years around 2026.
  - Clicking a year goes back to the months view for that year.
  - ‹ › move by 12 years.
- **Clicking the year range** (e.g. "2016–2027") switches to the **decades view**: a grid of 12-year blocks. Clicking a block goes back to the years view.

#### Footer
- **Clear** empties the field and closes the picker. It's shown only on optional fields.
- **Done** closes the picker.

#### Keyboard
- Arrow keys move the highlight one day left or right, or one week up or down.
- Page Up / Page Down go to the previous or next month (or year / 12 years in the other views).
- Home / End go to the start or end of the week.
- Enter or Space selects the highlighted day.
- Escape closes the picker without changing anything, and returns focus to the field.
- Clicking outside the picker closes it.

### 25.2 Time picker

#### Field
- Shows the time, e.g. "2:30 PM" (12-hour) or "14:30" (24-hour), or a placeholder when empty.
- Clicking it opens the time panel.

#### Main view: steppers
- Shows the hour and the minute side by side as large numbers, plus an **AM / PM** switch with both options visible and the current one highlighted.
- Each number has a **▲** above it and a **▼** below it.
  - Clicking ▲ / ▼ changes the value by one.
  - The value wraps around: ▼ on 12 gives 11, ▲ on 59 minutes gives 00.
  - Changing the hour never changes the date.
- Clicking **AM** or **PM** switches between morning and afternoon, keeping the same hour on the clock (9 AM ↔ 9 PM).
- Keyboard:
  - Up/Down arrows on a number step it.
  - Pressing **A** or **P** switches AM/PM directly.

#### Clicking the hour: hour grid
- Clicking the hour number opens an **hour grid**: 12 cells (12, 1, 2 … 11), laid out like a clock face, with the current hour highlighted.
- A **Back** link returns to the steppers without changing anything.
- Clicking an hour sets it and returns to the steppers.
- The AM/PM setting is kept.

#### Clicking the minute: minute grid
- Clicking the minute number opens a **minute grid**: one cell per step (e.g. 00, 05, 10 … 55 for a 5-minute step), with the current minute highlighted.
- Clicking a minute sets it and returns to the steppers. **Back** returns without changing anything.
- If the steppers have set a minute that isn't on the grid (e.g. 07 with a 5-minute step), no cell is highlighted.

#### Footer
- **Clear** (optional fields only) empties the field and closes the panel.
- **Done** closes the panel.

#### 24-hour mode
- The same as above, with no AM/PM switch.
- The hour grid shows 00–23.

#### Keyboard
- In the grids, arrow keys move between cells and Enter picks one.
- Escape closes the panel and returns focus to the field.

### 25.3 Date-time picker

- Opens on the **calendar** (the days view from the date picker).
- Below the calendar, a **time chip** shows the current time, e.g. "🕑 2:30 PM".
  - Clicking it swaps the calendar for the **time steppers** (§25.2).
  - A **Back to calendar** link swaps back.
- Next to it, **Clear time** resets the time to 00:00 and keeps the date.
- Picking a day without ever choosing a time sets the time to 00:00.
- The field shows both, e.g. "12/03/2026 2:30 PM".

### 25.4 Date range

- Two fields side by side: **From** and **To**. Each opens a date picker.
- Either can be left empty for an open-ended range ("from 1 March onwards", "up to 31 March").
- A To date with no time means **the end of that day**.
- If To is before From, the range shows the message "End date is before start date".

### 25.5 Relative time

- Shows times like "just now", "5 minutes ago", "3 days ago" or "in 2 hours".
- Hovering or focusing shows the exact date and time in a tooltip.
- On touch screens (no hover), the exact date and time is shown in smaller text underneath instead.
- With no value, it shows "—".

### 25.6 Index (list) page

#### What appears, top to bottom

1. **Page header:**
   - the page title (e.g. "Users");
   - the main action button (e.g. "New user");
   - secondary links if any (e.g. "Trash"). A small dot on Trash means it isn't empty.
2. **Toolbar:**
   - a **search box**;
   - a **Filters** button. When filters are applied it shows a count badge, e.g. "Filters 2".
   - an optional **Export** button.
3. **Filter pills:** one pill per active filter, e.g. "Status: Active ✕". Only shown when filters are applied.
4. **Table:**
   - a checkbox column;
   - the data columns;
   - an actions (⋯) button at the end of each row.
5. **Pagination** at the bottom:
   - "Showing 26–50 of 312 users";
   - a rows-per-page select (10 / 25 / 50 / 100);
   - **Previous / Next** buttons.

#### Search
- Typing does nothing until the user presses **Enter**, or leaves the box after changing the text. Then the list updates.
- Clearing the box and pressing Enter shows everything again.

#### Sorting
- Clicking a sortable column header sorts by it, A→Z or oldest→newest. An arrow appears on that header.
- Clicking the same header again reverses the order.
- Clicking another header sorts by that column instead, starting ascending.

#### Pagination
- Previous is disabled on the first page, and Next on the last.
- Changing rows-per-page goes back to page 1.
- Searching, filtering or sorting also goes back to page 1.

#### Selecting rows and bulk actions
- Ticking row checkboxes selects rows.
- The header checkbox selects or deselects every row on **this page**.
  - It shows a dash (–) when only some rows are selected.
- As soon as one row is selected, a **bulk action bar** appears, showing:
  - "3 selected";
  - the bulk actions (e.g. "Delete", "Change status");
  - a "Clear selection" link.
- Choosing an action that needs more input (e.g. "Change status") shows a small form in the bar first.
- Choosing a destructive action (e.g. "Delete") shows a confirmation, "Delete 3 selected users?", with Cancel and Delete buttons.
- While the action runs, the bar shows a spinner, and the buttons can't be clicked again.
- When it finishes:
  - a success message appears, e.g. "3 users deleted";
  - the selection clears.
- Moving to another page, searching, filtering or sorting also clears the selection.

#### Row actions (⋯ menu)
- Clicking ⋯ opens a menu of actions for that row, e.g. View, Edit, Delete.
- Only actions the user can actually do are listed.
- Choosing Delete closes the menu, then asks "Delete Jane Doe?" before deleting.
- Escape closes the menu.
- Clicking the row (or its name) opens the record.

#### Empty states
- **No records at all:** a message such as "No users yet", a short explanation, and the main action button ("New user").
- **No results for the current search or filters:**
  - "No users match your search", naming the search term and filters;
  - **Clear search** and/or **Clear filters** buttons.

#### Trash view
- Opened from the Trash link: the same list, showing deleted records.
- No bulk bar.
- Each row's ⋯ menu has **Restore** and **Delete permanently**. The second asks for confirmation first.

#### On phones
- Each row becomes a card, with every value labelled by its column name.
- A **Sort by** dropdown replaces the clickable column headers.
- A "Select all" checkbox sits above the cards.

#### Browser behaviour
- The search, filters, sort and page are kept in the address bar, so reloading or sharing the link shows the same view.
- The Back button leaves the page. It doesn't undo each filter change one by one.

### 25.7 Filters

#### Filters panel
- Clicking **Filters** opens a panel: a dropdown on desktop, a bottom sheet on phones.
- It lists each available filter with its control:
  - **Select:** pick one or several options. Long lists can be searched as you type.
  - **Date range:**
    - a "Date" dropdown, to choose which date to filter on (e.g. Created, Updated);
    - **From** and **To** pickers.
  - **Yes / No:** a two-option select.
  - **Text:** a text box.
  - **Deleted records:** "Hide", "Include" or "Only".
- Each filter has its own **Clear** link.
- At the bottom: **Clear all**, **Cancel** and **Apply**.
- Changes in the panel don't affect the list until **Apply** is clicked.
- **Cancel**, Escape or clicking outside closes the panel and throws away the changes.
- **Clear all** removes every filter straight away and closes the panel.
- Reopening the panel always shows the filters currently applied.

#### Filter pills
- After applying, each active filter shows as a pill under the toolbar. Examples:
  - "Status: Active";
  - "Created: 1 Mar → 31 Mar";
  - "Created: from 1 Mar".
- Clicking ✕ on a pill removes that filter, and the list updates.
- When two or more pills are shown, a **Clear all** link appears next to them.
- The Filters button's badge shows how many filters are active.

### 25.8 Record view (show) page

#### What appears
1. **Breadcrumbs:** e.g. "Users › Jane Doe". Each part is a link except the last.
2. **Header:**
   - the record's name;
   - on the left, links back to the list ("All users") and to "Trash";
   - on the right, record actions ("Logs", "Delete").
3. **Tabs:**
   - e.g. "Profile", "Edit", "Activity (12)";
   - each tab opens its own page, and the current one is highlighted.
4. **Summary strip:** key facts such as "Created 3 months ago" and "Last login yesterday".
5. **Detail cards:**
   - groups of label–value pairs (e.g. "Email: jane@example.com");
   - a missing value shows "—".
6. **Activity card:** the last few changes, with a "View all" link.

#### Actions
- Status buttons such as **Approve** or **Suspend** do what they say. Risky ones ask for confirmation first.
- After an action, a success message appears, and the page shows the updated record.
- **Delete** asks for confirmation, then returns to the list with "Moved to trash".

### 25.9 Edit page

#### What appears
- The same breadcrumbs, header and tabs as the view page, with **Edit** highlighted.
- The form fields, grouped into cards.
- A **save bar**:
  - a sticky panel on the side on desktop, and a bar fixed to the bottom on phones;
  - it holds **Save** and **Discard** buttons.

#### While editing
- As soon as a field changes, the save bar lists the change in plain words. For example:
  - "Email changes to jane@new.com"
  - "Role changes to Editor"
- **Save** is disabled until something has changed.
- **Discard** puts every field back to how it was when last saved.

#### Leaving with unsaved changes
- Clicking a link or tab, or pressing Back, asks "You have unsaved changes. Leave anyway?". Choosing to stay keeps the user on the page.
- Closing or reloading the browser tab shows the browser's own "Leave site?" warning.
- No warning appears once the changes are saved or discarded.

#### Saving
- Clicking **Save** shows a spinner on the button and prevents double-clicking.
- **On success:**
  - a message such as "User saved" appears;
  - the save bar empties;
  - the page stays on Edit.
- **On error:**
  - each problem shows in red under its field (e.g. "Email is already taken");
  - the cursor jumps to the first field with an error;
  - a short message says the save didn't go through.

#### Separate sections
- Things like "Change password" have their own card with their own Save button, independent of the main save bar.

#### New record (create) page
- Looks like the edit page, with empty fields.
- The tabs are shown but greyed out until the record is saved.
- After saving, the user lands on the new record.

### 25.10 Keyboard and screen readers (applies to everything)

- Every button, menu, picker and panel can be used with the keyboard alone.
- After closing a menu, picker, panel or dialog, the cursor goes back to whatever opened it.
- Screen readers announce:
  - the selected date;
  - the sort direction;
  - "3 selected";
  - which tab is current;
  - error messages.
- Every piece of text can be translated.

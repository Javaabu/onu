# Onu — Requirements

> **Onu** (އޮނު) means *bamboo* in Dhivehi.
> Onu is Javaabu's primary React UI component library going forward.

This document captures the requirements, constraints and full build list for Onu. It is the source of truth for scope; anything not listed here is out of scope until added.

---

## Table of contents

1. [Overview](#1-overview)
2. [Package & distribution](#2-package--distribution)
3. [Technology stack](#3-technology-stack)
4. [Browser support](#4-browser-support)
5. [Theming](#5-theming)
6. [Dark mode](#6-dark-mode)
7. [RTL support](#7-rtl-support)
8. [Dhivehi support](#8-dhivehi-support)
9. [Thaana (JTK) input](#9-thaana-jtk-input)
10. [Accessibility](#10-accessibility)
11. [Style overrides & customisation](#11-style-overrides--customisation)
12. [Framework integration](#12-framework-integration)
13. [Testing, CI & coverage](#13-testing-ci--coverage)
14. [Examples](#14-examples)
15. [Developer documentation](#15-developer-documentation)
16. [Repository structure](#16-repository-structure)
17. [Component definition of done](#17-component-definition-of-done)
18. [UI build list](#18-ui-build-list)
19. [Sample pages](#19-sample-pages)
20. [Open questions](#20-open-questions)

---

## 1. Overview

| | |
|---|---|
| **Name** | Onu |
| **Package** | `@javaabu/onu` |
| **Owner** | Javaabu Pvt. Ltd. |
| **Basis** | [shadcn/ui](https://ui.shadcn.com) patterns on top of [Radix UI](https://www.radix-ui.com) primitives, styled with [Tailwind CSS](https://tailwindcss.com) |
| **Licence** | MIT (to be confirmed) |

### Goals

- One shared, versioned component library for all Javaabu React projects (admin panels, public portals, citizen portals, kiosks, LMS).
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
  - `@javaabu/onu/styles.css` — theme tokens + base styles
  - `@javaabu/onu/tailwind.css` — Tailwind `@theme` / `@source` entry for consumers
- **R2.6** Heavy third-party dependencies (map SDKs, chart libs, editors, scanners) are **optional peer dependencies**, required only when the matching subpath is imported.
- **R2.7** Peer dependencies: `react` and `react-dom` `^18.3 || ^19`, `tailwindcss` `^4`.
- **R2.8** Ship TypeScript declarations; source written in TypeScript `strict` mode. No `any` in public APIs.
- **R2.9** Every client component file carries a `"use client"` directive so it works in React Server Component environments (Next.js App Router).
- **R2.10** Semantic versioning. Releases managed with [Changesets](https://github.com/changesets/changesets); `CHANGELOG.md` generated from them.
- **R2.11** Bundle-size budget tracked in CI (e.g. `size-limit`); a PR that grows a subpath beyond its budget fails.

## 3. Technology stack

Prefer the same libraries shadcn/ui uses so we stay close to upstream.

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Primitives | Radix UI |
| Styling | Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`, `clsx` |
| Icons | `lucide-react` (swappable, see R11.6) |
| Build | Vite library mode (or `tsup`) emitting ESM + `.d.ts` |
| Forms | `react-hook-form` integration (components also work uncontrolled / plain controlled) |
| Validation | Schema-agnostic; `zod` used in examples |
| Dates | `date-fns` + `react-day-picker`; `Intl` for Hijri (`islamic-umalqura`) |
| Tables / grids | TanStack Table (+ TanStack Virtual for large data) |
| Drag & drop | `@dnd-kit` |
| Command palette | `cmdk` |
| Toasts | `sonner` |
| Drawer / bottom sheet | `vaul` |
| Carousel | `embla-carousel-react` |
| OTP | `input-otp` |
| Charts | `recharts` (shadcn charts) |
| Rich text / blocks | Tiptap (ProseMirror) |
| Maps | Adapter-based; default MapLibre GL, Google Maps adapter |
| Phone | `libphonenumber-js` (default region `MV`) |
| Image crop | `react-easy-crop` |
| Signature | `signature_pad` |
| QR scanning | Native `BarcodeDetector` with `@zxing` fallback |
| Unit tests | Vitest + React Testing Library + `user-event` + jsdom |
| a11y tests | `vitest-axe` (axe-core) + Playwright `@axe-core/playwright` |
| E2E / visual | Playwright (component and examples app) |
| Docs | Markdown in `/docs`, rendered by Docusaurus (see §15) |

Final library choices for each heavy component may change during implementation, but any replacement must satisfy the same requirements (RTL, a11y, theming, dark mode).

## 4. Browser support

- **R4.1** Support every browser supported by the latest stable Tailwind CSS (v4.x at time of writing): **Chrome/Edge 111+, Safari 16.4+, Firefox 128+**, plus their mobile counterparts (iOS Safari 16.4+, Chrome Android).
- **R4.2** Features beyond that baseline (e.g. `BarcodeDetector`, Popover API, View Transitions) must be feature-detected with a working fallback.
- **R4.3** Playwright CI runs against Chromium, Firefox and WebKit.

## 5. Theming

- **R5.1** **One variable switches the whole brand colour**: setting `--onu-primary` (any CSS colour, e.g. `oklch(0.55 0.15 150)` or `#1f7a4d`) recolours the entire library.
- **R5.2** All derived shades (hover, active, subtle backgrounds, rings, foreground-on-primary) are computed from `--onu-primary` using CSS relative colour syntax / `color-mix()` in OKLCH, so no build step or JS is needed to re-theme.
- **R5.3** Foreground colour on primary is chosen automatically to meet WCAG AA contrast, overridable via `--onu-primary-foreground`.
- **R5.4** Additional granular tokens, following the shadcn token naming so shadcn docs/themes stay applicable:
  - Colour: `--onu-background`, `--onu-foreground`, `--onu-card`, `--onu-popover`, `--onu-secondary`, `--onu-muted`, `--onu-accent`, `--onu-destructive`, `--onu-success`, `--onu-warning`, `--onu-info`, `--onu-border`, `--onu-input`, `--onu-ring`, each with a `-foreground` pair where relevant.
  - Charts: `--onu-chart-1` … `--onu-chart-8`.
  - Sidebar: `--onu-sidebar`, `--onu-sidebar-foreground`, `--onu-sidebar-primary`, `--onu-sidebar-accent`, `--onu-sidebar-border`.
  - Shape: `--onu-radius` (all radii derive from it).
  - Typography: `--onu-font-sans`, `--onu-font-thaana`, `--onu-font-mono`.
  - Density: `--onu-spacing-scale` (compact / comfortable layouts, e.g. kiosk vs admin).
- **R5.5** Tokens are exposed to Tailwind via `@theme inline` so consumers write `bg-primary`, `text-muted-foreground`, `rounded-lg`, etc.
- **R5.6** Themes can be scoped: setting variables on any element re-themes that subtree only.
- **R5.7** Ship a few preset themes (e.g. *Onu green* default, neutral, blue) and a theme-builder page in the examples app that outputs the CSS to copy.

## 6. Dark mode

- **R6.1** Every component ships a dark variant. No component may hard-code light-only colours.
- **R6.2** Dark mode is activated by a `.dark` class or `[data-theme="dark"]` on an ancestor (Tailwind `@custom-variant dark`), so it works with any toggling strategy.
- **R6.3** Provide `<ThemeProvider>` + `useTheme()` supporting `light`, `dark` and `system`, persisted to `localStorage`, with a no-flash inline script helper for SSR apps.
- **R6.4** Derived primary shades are re-computed for dark mode so the single `--onu-primary` still meets contrast on dark backgrounds.
- **R6.5** Tests and visual snapshots run in both modes.

## 7. RTL support

- **R7.1** Every component works correctly in `dir="rtl"` out of the box, with no extra props.
- **R7.2** Use logical properties/utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `rounded-s-*`, `border-e`, …). Physical `left/right` utilities are banned by a lint rule except where explicitly justified.
- **R7.3** `<DirectionProvider dir="rtl">` (wrapping Radix's `DirectionProvider`) propagates direction to all primitives; components also respect the nearest `dir` attribute.
- **R7.4** Directional icons (chevrons, arrows, back/next, breadcrumb separators) mirror in RTL; non-directional icons (play, checkmarks, logos) do not.
- **R7.5** Keyboard navigation follows visual order in RTL (e.g. `ArrowLeft` moves "forward" in tabs, sliders, carousels, calendars, menus).
- **R7.6** Sliders, progress bars, carousels, steppers, timelines, pagination and charts render mirrored in RTL where semantically appropriate.
- **R7.7** Mixed-direction content is handled: inputs for Latin-only data (email, URL, phone, numbers, codes, OTP) are forced `dir="ltr"` even inside an RTL page; free text uses `dir="auto"` unless set.
- **R7.8** Every component is tested in both LTR and RTL.

## 8. Dhivehi support

- **R8.1** Dhivehi (`dv`) and English (`en`) are built-in locales. All built-in strings (e.g. "Close", "Next", "No results", "Required", pagination labels, date picker labels, aria-labels) come from a locale dictionary — no hard-coded English.
- **R8.2** `<OnuProvider locale="dv">` sets locale, direction (auto RTL for `dv`) and fonts in one place. Consumers can override or add locales and individual strings.
- **R8.3** Thaana font stack configured via `--onu-font-thaana`. Ship an openly-licensed default (e.g. Noto Sans Thaana) and document how to plug in other Thaana fonts (Faruma, MV Waheed, etc.) subject to licensing.
- **R8.4** Typography tuned for Thaana: adjusted line-height and letter-spacing, no faux italics, correct baseline alignment of Thaana next to Latin text and icons.
- **R8.5** Dates in Dhivehi: Dhivehi month and weekday names, Dhivehi relative-time strings ("2 ދުވަސް ކުރިން"), and optional Hijri display (see Hijri date component).
- **R8.6** Numbers use Western Arabic digits by default (as is standard in the Maldives), with formatting via `Intl` and the active locale.
- **R8.7** Week start is configurable (default Sunday for `dv`, configurable for `en`).
- **R8.8** Sorting / search in selects and tables handle Thaana text (use `Intl.Collator`).
- **R8.9** Pluralisation and interpolation in built-in strings are supported for both locales.

## 9. Thaana (JTK) input

Javaabu currently uses the JTK (JavaScript Thaana Keyboard) approach for typing Thaana on a Latin keyboard. Onu needs a React-native equivalent.

- **R9.1** Build a standalone, framework-agnostic Thaana keyboard engine (`@javaabu/onu/thaana`) with:
  - Phonetic keymap (default, JTK-compatible) and Typewriter keymap; custom keymaps pluggable.
  - Pure functions for Latin → Thaana conversion of a keystroke and of a whole string (useful for paste and tests).
- **R9.2** React bindings:
  - `useThaanaInput(ref, options)` hook that can be attached to any `<input>`, `<textarea>` or `contenteditable`.
  - `<ThaanaInput>` and `<ThaanaTextarea>` components.
- **R9.3** **Every component that accepts free text** exposes a `thaana` prop (`boolean | ThaanaOptions`), including: Text input, Textarea, Search box, Autocomplete, Searchable select / Multi-select search field, Tags input, Inline edit, Editable select, Combobox-style inputs, Command palette, Translations editor, Notes, Comment thread composer, WYSIWYG and Block editor. Inputs whose content must be Latin (email, password, URL, number, phone, OTP, slug, colour, formula) do **not** offer it.
- **R9.4** When `thaana` is on, the field sets `dir="rtl"`, `lang="dv"` and the Thaana font automatically.
- **R9.5** Optional per-field toggle (button and keyboard shortcut) to switch between Thaana and Latin while typing; the current mode is announced to screen readers.
- **R9.6** Must work with:
  - Caret position and selection replacement (typing over a selection, mid-string inserts).
  - Undo/redo (native undo stack preserved as far as browsers allow).
  - Controlled and uncontrolled inputs, and `react-hook-form`.
  - Modifier keys and shortcuts (Ctrl/Cmd combos pass through untouched).
  - **Mobile/Android** soft keyboards (implement via `beforeinput`/`input` events, not only `keydown`, since Android reports keyCode 229).
  - IME composition events (don't interfere with an OS-level Thaana keyboard; if the user already types Thaana natively, pass it through).
  - Paste: configurable — keep as-is (default) or transliterate Latin.
- **R9.7** 100% unit-test coverage of the keymaps and conversion functions.

## 10. Accessibility

- **R10.1** Conform to **WCAG 2.2 Level AA** for every component in every state, in both light and dark mode and in LTR and RTL.
- **R10.2** Follow the WAI-ARIA Authoring Practices pattern for each widget type (combobox, listbox, menu, dialog, tabs, tree, grid, slider, etc.).
- **R10.3** Full keyboard operability; visible focus indicator (`:focus-visible` ring using `--onu-ring`, ≥ 3:1 contrast, not obscured — WCAG 2.4.11).
- **R10.4** Focus management: dialogs/drawers trap and restore focus; route-level components provide a Skip link.
- **R10.5** Minimum target size 24×24 CSS px (WCAG 2.5.8); 44×44 for kiosk density.
- **R10.6** Colour is never the only means of conveying information (status badges, validation, charts use icon/text/pattern too).
- **R10.7** Form fields: programmatic labels, `aria-describedby` wiring for help text and errors, `aria-invalid`, `aria-required`, error summaries focusable after submit, live-region announcements for async validation and autosave.
- **R10.8** Respect `prefers-reduced-motion` and `prefers-contrast`.
- **R10.9** Charts and maps provide accessible alternatives (data table / text summary, keyboard-operable markers and controls).
- **R10.10** Media: captions/track support for the media player; alt text required (typed as required prop) for image components.
- **R10.11** Every component has automated axe tests (zero violations) and documented keyboard interactions; complex widgets also get manual screen-reader checks (NVDA + Firefox, VoiceOver + Safari) recorded in the PR.
- **R10.12** `lang` attributes set correctly on mixed Dhivehi/English content so screen readers switch voice.

## 11. Style overrides & customisation

- **R11.1** Every component accepts `className`, merged with defaults via `cn()` (`tailwind-merge`) so consumer classes win.
- **R11.2** Compound components expose a `classNames` prop keyed by slot (e.g. `classNames={{ trigger, content, item }}`) as well as being composable from their parts.
- **R11.3** Variants defined with `cva` and exported (e.g. `buttonVariants`) so consumers can reuse/extend them.
- **R11.4** `asChild` (Radix `Slot`) supported wherever rendering a different element makes sense (buttons, links, triggers).
- **R11.5** All native props and `ref` forwarded to the underlying DOM element; `data-slot`, `data-state`, `data-variant`, `data-size` attributes exposed for styling hooks.
- **R11.6** Icons are injectable: components accept icon props/slots, and a global icon map can be supplied via `OnuProvider`.
- **R11.7** No `!important`, no inline styles except where values are dynamic (positions, progress widths).
- **R11.8** Global defaults (size, variant, radius, density) configurable via `OnuProvider`.

## 12. Framework integration

- **R12.1** Framework-agnostic React: works in Vite SPA, Laravel + Inertia (React), and Next.js.
- **R12.2** Link-rendering components (Link button, Breadcrumbs, Side navigation, Pagination, Nav tabs, Conditional link, …) accept a pluggable link component via `OnuProvider` (`linkComponent={InertiaLink}`) or `asChild`.
- **R12.3** **Laravel validation compatibility**: Field errors and AJAX validation errors accept Laravel's `422` payload (`{ message, errors: { "field.0.name": [...] } }`) directly, including nested/array dot-notation keys, and map them to fields (also via `react-hook-form` `setError`).
- **R12.4** Pagination accepts Laravel paginator / API resource `meta` + `links` shapes out of the box.
- **R12.5** API select / Autocomplete / Dependent select accept a fetcher function, with a default fetcher for Laravel JSON resources; no hard dependency on any HTTP client.
- **R12.6** CSRF and auth are the consumer's concern; components never perform network requests without a consumer-supplied URL/fetcher.
- **R12.7** eFaas sign-in button follows eFaas branding guidelines (asset/colours supplied by eFaas, not invented).

## 13. Testing, CI & coverage

- **R13.1** Every component has tests covering: rendering, variants, controlled/uncontrolled behaviour, keyboard interaction, RTL, dark mode class application, `className`/`classNames` overrides, and axe accessibility.
- **R13.2** Coverage thresholds enforced in CI (initial target: **90% lines/statements/functions, 85% branches**; 100% for the Thaana engine). CI fails below threshold.
- **R13.3** Playwright tests run against the examples app (Chromium, Firefox, WebKit) for interaction-heavy components and sample pages, including visual regression snapshots in light/dark × LTR/RTL.
- **R13.4** GitHub Actions workflows:
  - `ci.yml` (PRs + `main`): install → lint (ESLint, incl. logical-property rule) → format check (Prettier) → typecheck → unit tests with coverage → build package → build examples → build docs → size check.
  - `e2e.yml`: Playwright across browsers.
  - `release.yml`: Changesets version PR + publish to npm with provenance.
- **R13.5** Coverage uploaded to Codecov (or Coveralls).
- **R13.6** `README.md` displays badges for: CI test status, coverage, npm version, licence.

  ```md
  [![Tests](https://github.com/Javaabu/onu/actions/workflows/ci.yml/badge.svg)](https://github.com/Javaabu/onu/actions/workflows/ci.yml)
  [![codecov](https://codecov.io/gh/Javaabu/onu/branch/main/graph/badge.svg)](https://codecov.io/gh/Javaabu/onu)
  [![npm](https://img.shields.io/npm/v/@javaabu/onu)](https://www.npmjs.com/package/@javaabu/onu)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
  ```

## 14. Examples

- **R14.1** An `examples/` directory containing a runnable Vite + React + TypeScript app consuming the package via the workspace (`pnpm` workspaces).
- **R14.2** **Component showcase**: one page per component demonstrating every variant, size and state (default, hover, focus, disabled, loading, error, empty), with copyable code.
- **R14.3** Global toolbar on every page to toggle: light/dark, LTR/RTL, `en`/`dv` locale, primary colour (colour picker driving `--onu-primary`), density.
- **R14.4** **Sample pages** (see §19) built only from Onu components and realistic mock data (Dhivehi + English), demonstrating real-world composition.
- **R14.5** Deployed as a static site (e.g. GitHub Pages) on every push to `main`, linked from the README and docs.
- **R14.6** Examples app is used as the Playwright test target.

## 15. Developer documentation

Docs live in `/docs` and follow the exact format used in [`@javaabu/js-utilities`](https://github.com/Javaabu/js-utilities/tree/main/docs) (Docusaurus-rendered markdown, served on Javaabu's docs site).

- **R15.1** `docs/metadata.json`:
  ```json
  {
      "name": "Onu",
      "description": "React UI component library for Javaabu projects",
      "version": "1"
  }
  ```
- **R15.2** Top-level pages, each with front matter (`title`, `sidebar_position`):

  | File | `sidebar_position` |
  |---|---|
  | `intro.md` | 1.0 |
  | `requirements.md` | 1.1 |
  | `installation-and-setup.md` | 1.2 |
  | `questions-and-security.md` | 1.4 |
  | `changelog.md` (links to `CHANGELOG.md` on GitHub) | 1.5 |
  | `about-us.md` | 1.6 |
  | `contributing-to-docs.md` | 99 |

- **R15.3** Guide pages (in a `docs/guides/` category): theming, dark mode, RTL, Dhivehi & locales, Thaana input, accessibility, style overrides, forms & Laravel validation, Inertia/Next.js integration.
- **R15.4** One folder per build-list group, each with a `_category_.json` (`position`, `label`, `collapsible`, `collapsed`, `link.type: "generated-index"`, `link.slug: "/onu/_categories/<group>"`, `link.description`), e.g. `docs/form-scaffolding/`, `docs/text-inputs/`, `docs/date-and-time/`, … matching §18.
- **R15.5** One markdown file per component with front matter, containing: short description, import snippet, basic usage, props table, variants, slots/`classNames`, RTL & Thaana notes, accessibility notes (keyboard interactions table), and examples. Use Docusaurus admonitions (`:::info`, `:::warning`) where helpful.
- **R15.6** Docs are updated in the same PR as the component change; CI checks every exported component has a docs page.

## 16. Repository structure

Proposed (pnpm workspace):

```
onu/
├── .changeset/
├── .github/workflows/        # ci.yml, e2e.yml, release.yml
├── docs/                     # Docusaurus-format markdown (see §15)
├── examples/                 # Vite showcase + sample pages app
├── packages/
│   └── onu/                  # @javaabu/onu
│       ├── src/
│       │   ├── components/   # one folder per component (component, test, index)
│       │   ├── thaana/       # keyboard engine + hooks
│       │   ├── charts/ maps/ editor/ calendar/ media/
│       │   ├── hooks/ lib/ locales/ providers/
│       │   └── styles/       # tokens.css, base.css, tailwind.css
│       └── package.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md
├── README.md
└── REQUIREMENTS.md
```

## 17. Component definition of done

A build-list item is ticked only when all of the following are true:

- [ ] Implemented in TypeScript with exported prop types and `ref` forwarding
- [ ] Works in light and dark mode
- [ ] Works in LTR and RTL, and with `locale="dv"`
- [ ] `thaana` prop supported (if it accepts free text)
- [ ] Themed only through tokens (re-colours with `--onu-primary`)
- [ ] `className` / `classNames` / `asChild` overrides as applicable
- [ ] Meets WCAG 2.2 AA; axe tests pass; keyboard interactions documented
- [ ] Unit tests meeting coverage thresholds
- [ ] Showcase page in `examples/`
- [ ] Docs page in `docs/`
- [ ] Changeset added

---

## 18. UI build list

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
- [ ] Multi-language submit
- [ ] Auth forms (sign in, register, reset password)
- [ ] Field definition editor

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
- [ ] Formula input
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
- [ ] Model selector
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
- [ ] Payment method selector
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
- [ ] Menu bar
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
- [ ] `cn()` and shared utilities
- [ ] Visually hidden / live region utilities

---

## 19. Sample pages

All sample pages live in `examples/` and must render correctly in light/dark, LTR/RTL and `en`/`dv`.

### Auth
- [ ] Sign in (email and eFaas)
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

## 20. Open questions

To be resolved before (or while) building the affected components:

1. **Licence** — MIT like other Javaabu packages, or private/internal?
2. **Map provider** — MapLibre (free, self-hostable tiles) as default, or Google Maps as primary? Which tile provider for the Maldives?
3. **Thaana fonts** — which commercially licensed fonts (if any) may be bundled vs only referenced?
4. **Default primary colour** — exact Javaabu/Onu brand colour value.
5. **Docs hosting** — confirm the Docusaurus docs site that consumes `/docs` (same as js-utilities) and its slug (`/onu`).
6. **Component semantics to confirm**:
   - *Formula input* — spreadsheet-style expression editor? Which functions/variables?
   - *Field definition editor* / *Custom attribute fields* — schema shape (align with an existing Javaabu Laravel package?).
   - *Multi-language submit* — "Save" + "Save & translate to …" per configured locale?
   - *Model selector* vs *API select* — difference in behaviour.
   - *Reporting-period picker* — fiscal periods (monthly/quarterly/yearly) with custom fiscal year start?
   - *Map navigation* / *Map replay* — data shape for tracks (GeoJSON LineString with timestamps?).
   - *Payment method selector* — which gateways (BML, MIB, MFaisaa, card) and branding assets?
7. **React Native / Flutter parity** — should token names align with the Flutter design system for cross-platform consistency?

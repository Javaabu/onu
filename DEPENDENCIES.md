# Dependencies

Every runtime and peer dependency of `@javaabu/onu`, why it was chosen, and its licence (REQUIREMENTS §4, R4.1). Heavy or licensed libraries are **optional peers**: install them only when you import the matching entry point.

Selection order: shadcn/ui component → reputable library (shadcn ecosystem first) → React Aria for missing accessible patterns → build in-house.

## Core (`@javaabu/onu`)

| Package                                            | Purpose                                                                   | Licence    | Notes                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `radix-ui`                                         | Accessible primitives behind the shadcn components                        | MIT        | shadcn default base                                                                             |
| `@base-ui/react`                                   | Combobox primitive (shadcn's combobox)                                    | MIT        | From the Radix / MUI team                                                                       |
| `class-variance-authority`                         | Variants (`buttonVariants`, …)                                            | Apache-2.0 | Stable and feature-complete; last release 2024 (exception to the 12-month rule, used by shadcn) |
| `clsx`, `tailwind-merge`                           | `cn()` class merging so consumer classes win                              | MIT        |                                                                                                 |
| `tw-animate-css`                                   | Enter/exit animations                                                     | MIT        | shadcn default                                                                                  |
| `lucide-react`                                     | Default icon set                                                          | ISC        | R6.2                                                                                            |
| `cmdk`                                             | Command menu, searchable selects                                          | MIT        | shadcn `command`                                                                                |
| `sonner`                                           | Toasts                                                                    | MIT        | shadcn `sonner`                                                                                 |
| `vaul`                                             | Drawer / bottom sheet                                                     | MIT        | shadcn `drawer`. **Watch-list**: reduced maintenance (R4.3); kept behind Onu's API              |
| `input-otp`                                        | OTP input                                                                 | MIT        | shadcn `input-otp`                                                                              |
| `react-day-picker`, `date-fns`                     | Calendar and date maths                                                   | MIT        | shadcn `calendar`; Dhivehi locale maintained in Onu                                             |
| `@internationalized/date`                          | Hijri (Umm al-Qura) calendar maths, date/time fields                      | Apache-2.0 | Adobe                                                                                           |
| `react-aria-components`                            | Tree, colour picker, date/time segment fields                             | Apache-2.0 | Adobe; fills Radix gaps (§4 step 3)                                                             |
| `embla-carousel-react`                             | Carousel                                                                  | MIT        | shadcn `carousel`                                                                               |
| `react-resizable-panels`                           | Resizable layouts                                                         | MIT        | shadcn `resizable`                                                                              |
| `react-hook-form`                                  | Form state                                                                | MIT        |                                                                                                 |
| `@tanstack/react-table`, `@tanstack/react-virtual` | Tables, data grid, virtualised lists                                      | MIT        |                                                                                                 |
| `@tanstack/react-query`                            | API select caching and de-duplication                                     | MIT        | R16.5                                                                                           |
| `@dnd-kit/react`, `@dnd-kit/helpers`               | Drag and drop (kanban, sortable lists, row reordering) with touch sensors | MIT        | The maintained successor of `@dnd-kit/core`                                                     |
| `react-dropzone`                                   | File drop zones                                                           | MIT        |                                                                                                 |
| `react-phone-number-input`                         | Phone input (libphonenumber)                                              | MIT        | Default region MV                                                                               |
| `@sindresorhus/slugify`                            | Slug generator                                                            | MIT        |                                                                                                 |

## Optional peers (entry points)

| Entry                             | Packages                                                                                                                                                                                                            | Licence                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `@javaabu/onu/charts`             | `recharts`                                                                                                                                                                                                          | MIT                                                             |
| `@javaabu/onu/maps`               | `@vis.gl/react-google-maps`, `terra-draw`, `terra-draw-google-maps-adapter`, `@googlemaps/markerclusterer`, `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/aggregation-layers`, `@deck.gl/google-maps`, `@turf/turf` | MIT / Apache-2.0                                                |
| `@javaabu/onu/editor`             | `@tiptap/core`, `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/static-renderer`, `@tiptap/suggestion` (slash menu), `@tiptap/extension-*` (MIT packages only), `lowlight`, `shiki`                  | MIT                                                             |
| `@javaabu/onu/calendar`           | `@fullcalendar/core`, `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/list`, `@fullcalendar/interaction` (standard plugins only, v6)                                       | MIT                                                             |
| `@javaabu/onu/media`              | `react-easy-crop`, `signature_pad`, `barcode-detector`, `yet-another-react-lightbox`, `media-chrome`                                                                                                                | MIT                                                             |
| `@javaabu/onu/icons/iconify`      | `@iconify/react` + any `@iconify-json/*` collections                                                                                                                                                                | MIT (icon sets vary, mostly MIT/Apache/OFL)                     |
| `@javaabu/onu/icons/fontawesome`  | `@fortawesome/fontawesome-svg-core`, `@fortawesome/react-fontawesome`, plus your Free or **Pro** icon packages                                                                                                      | MIT (code); icons per FontAwesome licence. Pro is never bundled |
| `@javaabu/onu/fonts.css`          | `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`, `@fontsource-variable/noto-sans-thaana` (fallback)                                                                                             | OFL-1.1                                                         |
| `@javaabu/onu/fonts-optional.css` | `@fontsource-variable/geist`, `@fontsource-variable/source-serif-4`                                                                                                                                                 | OFL-1.1                                                         |

MV Waheed (the default Thaana font) is not bundled until redistribution rights are confirmed (R7.3).

## Tooling (dev only)

Vite, Vitest, Testing Library, jsdom, axe-core, Playwright, TypeScript, ESLint, Prettier, Changesets, size-limit, and the `shadcn` package (for `scripts/sync-shadcn.mjs`).

`@types/google.maps` (MIT, DefinitelyTyped) is a dev dependency: it types the Google Maps adapter inside `@javaabu/onu/maps`. Consumers get it through `@vis.gl/react-google-maps`, which depends on it.

## Governance

- Renovate keeps dependencies current (`renovate.json`).
- CI fails on disallowed licences (`scripts/check-licenses.mjs`) and high-severity advisories (`pnpm audit`).
- Review this list quarterly against REQUIREMENTS §4.

# Dependencies

Every runtime and peer dependency of `@javaabu/onu`, why it was chosen, and its licence (REQUIREMENTS §4, R4.1). Heavy or licensed libraries are **optional peers**: install them only when you import the matching entry point.

Selection order: shadcn/ui component → reputable library (shadcn ecosystem first) → React Aria for missing accessible patterns → build in-house.

## Core (`@javaabu/onu`)

| Package                                            | Purpose                                                                    | Licence    | Notes                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `radix-ui`                                         | Accessible primitives behind the shadcn components                         | MIT        | shadcn default base                                                                              |
| `class-variance-authority`                         | Variants (`buttonVariants`, …)                                             | Apache-2.0 | Stable and feature-complete; last release 2024 (exception to the 12-month rule, used by shadcn)  |
| `clsx`, `tailwind-merge`                           | `cn()` class merging so consumer classes win                               | MIT        |                                                                                                  |
| `tw-animate-css`                                   | Enter/exit animations                                                      | MIT        | shadcn default                                                                                   |
| `lucide-react`                                     | Default icon set                                                           | ISC        | R6.2                                                                                             |
| `cmdk`                                             | Command menu, searchable selects                                           | MIT        | shadcn `command`                                                                                 |
| `sonner`                                           | Toasts                                                                     | MIT        | shadcn `sonner`                                                                                  |
| `vaul`                                             | Drawer / bottom sheet                                                      | MIT        | shadcn `drawer`. **Watch-list**: reduced maintenance (R4.3); kept behind Onu's API               |
| `input-otp`                                        | OTP input                                                                  | MIT        | shadcn `input-otp`                                                                               |
| `react-day-picker`, `date-fns`                     | Calendar and date maths                                                    | MIT        | shadcn `calendar`; Dhivehi locale maintained in Onu                                              |
| `@internationalized/date`                          | Hijri (Umm al-Qura) calendar maths, date/time segment fields               | Apache-2.0 | Adobe                                                                                            |
| `react-aria-components`                            | Tree, colour picker                                                        | Apache-2.0 | Adobe; fills Radix gaps (§4 step 3)                                                              |
| `embla-carousel-react`                             | Carousel                                                                   | MIT        | shadcn `carousel`                                                                                |
| `@tanstack/react-table`, `@tanstack/react-virtual` | Tables, data grid, virtualised lists                                       | MIT        |                                                                                                  |
| `@dnd-kit/react`, `@dnd-kit/helpers`               | Drag and drop (kanban, sortable lists, row reordering) with touch sensors  | MIT        | The maintained successor of `@dnd-kit/core`                                                      |
| `@dnd-kit/dom`                                     | dnd-kit's `Accessibility` plugin, configured with translated announcements | MIT        | Already installed by `@dnd-kit/react`; imported directly so drag announcements follow the locale |
| `react-phone-number-input`                         | Phone input (libphonenumber)                                               | MIT        | Default region MV                                                                                |
| `@sindresorhus/slugify`                            | Slug generator                                                             | MIT        |                                                                                                  |
| `uqr`                                              | QR code encoding for `QrCode` (media entry); Onu renders the SVG           | MIT        | unjs; zero-dep, typed. Picked over `qrcode` (Node deps), `qrcode-generator` (stale)              |

## Peers (core)

`react-hook-form` (form state, MIT) and `@tanstack/react-query` (API select caching and de-duplication, R16.5, MIT) are required peers, alongside `react` and `react-dom`. Onu reads their React context, so the app and Onu must resolve the same copy. They stay required because the core entry imports them statically.

## Optional peers (entry points)

The packages each entry needs are listed once, under [Peer dependencies per entry](docs/installation-and-setup.md#peer-dependencies-per-entry). This table keeps their licences and the choices behind them.

| Entry                             | Licence                                                         | Notes                                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@javaabu/onu/charts`             | MIT                                                             |                                                                                                                                                             |
| `@javaabu/onu/maps`               | MIT / Apache-2.0                                                |                                                                                                                                                             |
| `@javaabu/onu/editor`             | MIT                                                             | MIT-licensed Tiptap packages only                                                                                                                           |
| `@javaabu/onu/calendar`           | MIT                                                             | FullCalendar v6, standard plugins only                                                                                                                      |
| `@javaabu/onu/media`              | MIT                                                             |                                                                                                                                                             |
| `@javaabu/onu/export`             | MIT                                                             | `write-excel-file`, chosen over the npm `xlsx` (SheetJS) package, whose npm release is outdated; supports right-to-left sheets and keeps Thaana text intact |
| `@javaabu/onu/icons/iconify`      | MIT (icon sets vary, mostly MIT/Apache/OFL)                     |                                                                                                                                                             |
| `@javaabu/onu/icons/fontawesome`  | MIT (code); icons per FontAwesome licence. Pro is never bundled |                                                                                                                                                             |
| `@javaabu/onu/fonts.css`          | OFL-1.1                                                         |                                                                                                                                                             |
| `@javaabu/onu/fonts-optional.css` | OFL-1.1                                                         |                                                                                                                                                             |

Faruma and MV Faseyha, the Thaana fonts, are bundled as subset `woff2` files in `src/styles/fonts/` (R7.3). They are free to use and redistribute.

## Tooling (dev only)

Vite, Vitest, Testing Library, jsdom, axe-core, Playwright, TypeScript, ESLint, Prettier, Changesets, size-limit, and the `shadcn` package (for `scripts/sync-shadcn.mjs`).

`@types/google.maps` (MIT, DefinitelyTyped) is a dev dependency: it types the Google Maps adapter inside `@javaabu/onu/maps`. Consumers get it through `@vis.gl/react-google-maps`, which depends on it.

## Governance

- Renovate keeps dependencies current (`renovate.json`).
- CI fails on disallowed licences (`scripts/check-licenses.mjs`) and high-severity advisories (`pnpm audit`).
- Review this list quarterly against REQUIREMENTS §4.

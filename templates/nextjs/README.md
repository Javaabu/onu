# Onu + Next.js starter

A minimal [Next.js](https://nextjs.org) (App Router) app using [`@javaabu/onu`](../../packages/onu) with Tailwind CSS v4:

- `app/layout.tsx` (Server Component) reads the `locale` cookie and renders `<html lang dir>` on the server, so Dhivehi pages are right-to-left in the first HTML.
- `components/providers.tsx` (`"use client"`) holds `ThemeProvider`, `OnuProvider` with Next's `Link` as `linkComponent`, and `TooltipProvider`.
- `components/theme-script.tsx` applies the stored light/dark theme before the first paint.
- `app/page.tsx` (Server Component) renders Onu's `PageTitle`, `Callout`, `Card`, `StatusBadge` and `LinkButton` directly. Onu's components are client components, so a Server Component can render them as long as every prop is serialisable.
- `components/locale-switcher.tsx` and `components/contact-form.tsx` are client components because they pass functions (`onChange`, `onSubmit`). The form calls a Server Action (`app/actions.ts`) that returns Laravel-shaped `{ message, errors }`; throwing it makes Onu's `Form` show each error under its field.

## Use it on its own

Once `@javaabu/onu` is published to npm, copy the folder (for example with [degit](https://github.com/Rich-Harris/degit)) and point `@javaabu/onu` at the published package instead of `workspace:*`:

```bash
npx degit Javaabu/onu/templates/nextjs my-app
cd my-app
npm pkg set dependencies.@javaabu/onu="latest"
npm install
npm run dev
```

## Scripts

| Script              | What                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`       | Development server                                                                       |
| `npm run build`     | Production build                                                                         |
| `npm run start`     | Serve the production build                                                               |
| `npm run typecheck` | Generate Next's route types and run `tsc`                                                |
| `npm run test:ssr`  | Start the production build and check the server-rendered HTML of `/` (run `build` first) |

`test:ssr` (`scripts/ssr-check.mjs`) is the server-rendering test CI runs: it fetches `/` in English and with the `locale=dv` cookie, and fails unless the HTML already contains Onu's markup (`data-slot` attributes, the title, `dir="rtl"` for Dhivehi) before any JavaScript runs.

## In this repository

The template is a pnpm workspace package that uses the workspace copy of the library (`workspace:*`). Build the library first, since the template imports its `dist`:

```bash
pnpm install
pnpm build                                   # the library
pnpm --filter onu-template-nextjs build
pnpm --filter onu-template-nextjs test:ssr
pnpm --filter onu-template-nextjs dev
```

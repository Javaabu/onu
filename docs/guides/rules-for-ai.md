# Rules for AI assistants

Short rules for AI coding assistants (and people) writing UI with Onu. They sit at the top of [`llms.txt`](./ai-assistants.md), and the Onu MCP server and Claude Code plugin hand them to the assistant before it writes code.

# Before writing code

- Look up a component's page before using it: `node_modules/@javaabu/onu/docs/<group>/<name>.md`, `onu_get_doc` in the MCP server, or the site's `llms.txt`. Each page has a **Props** table and an **Accessibility** section. Use only the props listed there.
- Prefer an Onu component over writing your own or using a shadcn/ui primitive directly. `llms.txt` lists every component with one line on what it is for. Only reach for `@javaabu/onu/primitives` (the shadcn/ui parts Onu is built on) to compose something Onu doesn't have.
- Don't add other UI kits (MUI, Chakra, Ant Design, Headless UI, a separate shadcn/ui copy) next to Onu.

# Setup

- One CSS entry: `@import "tailwindcss"; @import "@javaabu/onu/tailwind.css";` and, for the font pack, `@import "@javaabu/onu/fonts.css";`, which needs `npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono @fontsource-variable/noto-sans-thaana` first.
- Wrap the app once in `<ThemeProvider><OnuProvider>…</OnuProvider></ThemeProvider>`. `OnuProvider` sets `lang`, `dir` and density on `<html>`, so portals follow.
- Dhivehi: `locale={dv}` with `import { dv } from "@javaabu/onu/locales/dv"`, or `locale="dv"` to load it on demand. English needs no `locale`.
- Inertia or Next.js: pass the router's `Link` as `linkComponent` on `OnuProvider`; Onu's links and `href` props then use it.

# Imports

- Components, hooks and helpers come from `@javaabu/onu`. Heavy features have their own entry: `@javaabu/onu/charts`, `/maps`, `/editor`, `/calendar`, `/media`, `/query-builder`, `/export`, `/thaana`, `/icons/iconify`, `/icons/fontawesome`. The docs page's first code block shows the import.
- Never import from `@javaabu/onu/dist/...` or `@javaabu/onu/src/...`.

# Forms (Laravel)

- Put every control inside `FormField` with the field's `name` (bracket notation is fine, `items[0][name]`). `FormField` wires the label, help, errors and ARIA. Don't hand-write `<label>`, error text or `aria-describedby`.
- Use `Form` with an `onSubmit` that returns the request promise (axios, fetch or Inertia). It shows Laravel 422 errors under the fields, focuses the first one and shows the error summary. With Inertia, pass `errors={form.errors}` and `processing={form.processing}`.
- Submit with `SubmitButton` (spinner, no double submit), not a plain `Button type="submit"`.
- Pick the specific input: `EmailInput`, `PasswordInput`, `PhoneInput`, `NumberInput`, `DatePicker`, `ApiSelect` (Laravel paginated API), `FileInput` (`url` for instant uploads), and so on, rather than `TextInput type="…"`.
- Edit pages get `SaveBar`; index pages get `ListingPage` (or `DataTable` with `useListingState`).

# Dhivehi, Thaana and RTL

- Free-text fields that may hold Dhivehi take `thaana` (`<TextInput thaana />`, `<Textarea thaana />`; add `thaanaToggle` for the Thaana/Latin button). Never add `thaana` to email, password, URL, number, phone, OTP or code inputs; they stay LTR by design.
- Use logical Tailwind utilities only: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s-*`/`rounded-e-*`. Never `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left` or `text-right`. Flip transforms with `rtl:`.
- Sides are `side="start" | "end"`, not left/right.
- Format dates, numbers and money with `useFormatDate`, `useFormatNumber` and `useFormatCurrency` (MVR), not `toLocaleString` or hand-built strings. Numbers use Western digits in Dhivehi too.
- Built-in strings come from the locale. For your own strings use `useTranslation()` or your app's i18n, and override Onu's strings with `OnuProvider messages`.

# Styling and theming

- Brand colour: set `--onu-primary` (one variable re-themes everything). Use the theme tokens (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border`, `bg-card`, …), never fixed colours like `bg-blue-600` or hex values, so dark mode and themes keep working.
- Restyle with `className` (merged with tailwind-merge, yours wins) and `classNames={{ part: "…" }}` for parts. Reuse exported variants such as `buttonVariants`. Use `asChild` to render your own element. No `!important`, no inline styles for static values.
- Density (`compact` to `touch`) and dark mode come from the providers; don't hard-code heights or `dark:` colours on Onu components.

# Icons

- Use `<Icon name="search" />` and `startIcon="add"` / `endIcon="…"` props with semantic names, not imports from `lucide-react`. Give icons that carry meaning a `label`; icon-only buttons need an accessible name (`aria-label` or the component's `label` prop).
- Directional icons mirror in RTL on their own; don't flip them yourself.

# Accessibility (WCAG 2.2 AA)

- Onu components already handle roles, focus and keyboard. Don't remove focus rings, add `tabIndex` to non-interactive elements, or replace buttons with clickable `div`s.
- Announce async results with `toast()`, `announce()` or `LiveRegion`; hide text visually with `VisuallyHidden`, not `display: none`.
- Confirm destructive actions with `confirm()` / `useConfirm()` or the item's `confirm` option, not `window.confirm`.

# Bundle size

- Import only what you use; every entry is tree-shaken. Keep charts, maps, the editor, the calendar and media in their own entries (and lazy routes when they are big).

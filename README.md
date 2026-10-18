<p align="center"><img src=".github/assets/onu-logo.svg" width="96" height="96" alt="Onu logo: two bamboo stalks with leaves"></p>

# Onu

[![Tests](https://github.com/Javaabu/onu/actions/workflows/ci.yml/badge.svg)](https://github.com/Javaabu/onu/actions/workflows/ci.yml)
[![E2E](https://github.com/Javaabu/onu/actions/workflows/e2e.yml/badge.svg)](https://github.com/Javaabu/onu/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/Javaabu/onu/branch/main/graph/badge.svg)](https://codecov.io/gh/Javaabu/onu)
[![npm](https://img.shields.io/npm/v/@javaabu/onu)](https://www.npmjs.com/package/@javaabu/onu)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

> **Onu** (އޮނު) means _bamboo_ in Dhivehi.

Javaabu's React UI component library, built on [shadcn/ui](https://ui.shadcn.com) and Tailwind CSS v4.

- **RTL and Dhivehi first**: every component works in `dir="rtl"`, with Dhivehi strings, dates and fonts built in.
- **Thaana keyboard input** on every free-text field, phonetic (JTK-compatible) or typewriter layout.
- **One variable re-themes everything**: `--onu-primary`. Granular tokens for everything else.
- **Dark mode**, **density modes** (compact → touch) and **responsive, touch-friendly** components.
- **Accessible**: WCAG 2.2 AA, tested with axe.
- **Lucide icons** by default, with **FontAwesome Pro** and Iconify adapters.

See [`REQUIREMENTS.md`](REQUIREMENTS.md) for the full specification and [`docs/`](docs) for the developer documentation.

## Install

```bash
npm install @javaabu/onu
```

```css
/* app.css */
@import "tailwindcss";
@import "@javaabu/onu/tailwind.css";
@import "@javaabu/onu/fonts.css"; /* optional font pack */
```

```tsx
import { Button, OnuProvider, ThemeProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"

export function App() {
  return (
    <ThemeProvider>
      <OnuProvider locale={dv}>
        <Button>ސޭވްކުރޭ</Button>
      </OnuProvider>
    </ThemeProvider>
  )
}
```

Re-theme with one variable:

```css
:root {
  --onu-primary: oklch(0.55 0.15 240);
}
```

## AI assistants

The package ships its docs for AI coding assistants: `node_modules/@javaabu/onu/llms.txt` (the rules for writing Onu code and an index of every component) and a Markdown page per component in `node_modules/@javaabu/onu/docs/`. There is also an MCP server, [`@javaabu/onu-mcp`](packages/onu-mcp), and a Claude Code plugin (`/plugin marketplace add Javaabu/onu`). See [AI assistants](docs/guides/ai-assistants.md).

## Repository

| Path               | What                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `packages/onu`     | The `@javaabu/onu` package                                             |
| `packages/onu-mcp` | `@javaabu/onu-mcp`: MCP server with Onu's docs for AI assistants       |
| `plugins/onu`      | Claude Code plugin (skill + MCP server)                                |
| `web`              | Docs site: every component and the sample pages (`pnpm dev`)           |
| `templates`        | Starter apps: Laravel + Inertia + React, and Next.js (App Router)      |
| `docs`             | Developer documentation (Docusaurus format)                            |
| `figma`            | Figma token sync and Code Connect mappings                             |
| `tokens.json`      | Design tokens (DTCG), the source for CSS variables and Figma Variables |

```bash
pnpm install
pnpm dev            # web app
pnpm test           # unit tests
pnpm test:coverage  # with coverage thresholds
pnpm lint && pnpm typecheck
pnpm build          # build the package
```

## Starter templates

Ready-to-copy apps wired up with Onu (provider, Tailwind, fonts, an English / Dhivehi switch):

- [`templates/laravel-inertia-react`](templates/laravel-inertia-react): Laravel + Inertia + React + TypeScript with an admin shell (`AppLayout`, `AppSidebar`) and a form that shows Laravel validation errors, plus feature tests.
- [`templates/nextjs`](templates/nextjs): Next.js App Router with Server Components rendering Onu, client components where needed, and a server-rendering check.

CI builds both against the workspace copy of the library ([`templates.yml`](.github/workflows/templates.yml)). Each template's README shows how to use it on its own with the npm package.

```bash
pnpm build && pnpm build:templates
pnpm --filter onu-template-nextjs test:ssr
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licence

MIT. See [`LICENSE.md`](LICENSE.md).

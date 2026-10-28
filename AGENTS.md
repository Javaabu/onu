# Onu: notes for AI coding agents

Onu (`@javaabu/onu`) is Javaabu's React UI library: shadcn/ui (Radix base) and Tailwind CSS v4, RTL and Dhivehi first, WCAG 2.2 AA. This file is for agents working **on this repository**. Agents writing apps **with** Onu should read [`docs/guides/rules-for-ai.md`](docs/guides/rules-for-ai.md) (also at the top of the generated `llms.txt`).

[`CONTRIBUTING.md`](CONTRIBUTING.md) is the source of truth for conventions; [`REQUIREMENTS.md`](REQUIREMENTS.md) is the spec. Read both before larger changes.

## Layout

| Path                        | What                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `packages/onu`              | The library. `src/components/<group>/<name>.tsx` + `.test.tsx`; heavy entries in `src/{charts,maps,editor,calendar,media}` |
| `packages/onu/src/ui`       | shadcn/ui primitives, now Onu-owned code: edit in place, mark upstream changes with `// onu:`                              |
| `packages/onu-mcp`          | MCP server that serves the docs to AI assistants                                                                           |
| `web`                       | Docs and demo site: `src/showcase/<group>/<name>.demo.tsx`, `src/pages/<group>/<name>.page.tsx`                            |
| `docs`                      | Markdown docs, one page per component (`docs/<group>/<name>.md`)                                                           |
| `scripts/llms.mjs`          | Builds `llms.txt`, `llms-full.txt` and `docs/*.md` for AI assistants from `docs/`                                          |
| `templates`, `e2e`, `figma` | App templates, Playwright tests, Figma plugin                                                                              |

## Commands

```bash
pnpm install
pnpm dev                                   # web app on :5173
pnpm --filter @javaabu/onu exec vitest run src/components/inputs   # focused unit tests
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test                                  # library unit tests
pnpm --filter @javaabu/onu-mcp test        # MCP server tests
pnpm build && pnpm --filter @javaabu/onu size   # build + bundle budgets
pnpm build:web                             # docs site
node scripts/check-docs.mjs                # every component has a docs page with Props + Accessibility
pnpm e2e:chromium                          # Playwright (a11y with axe, visual)
```

## Rules

- A component is done only with: light/dark, LTR/RTL, `dv` strings, `thaana` on free-text fields, tokens-only colours, `className`/`classNames`/`asChild`, axe-clean, unit tests, a demo, a docs page and a changeset (`.changeset/*.md`).
- Logical Tailwind utilities only (`ms-`, `pe-`, `start-`, `text-start`); ESLint rejects `left`/`right` ones. Theme tokens only, never raw colours.
- Icons through `<Icon name="…">` with semantic names; never render Lucide components or import `src/icons/lucide-map` in a component.
- No hard-coded English: strings live in `src/locales/{en,dv}/<namespace>.ts`, and a module registers the English namespaces it uses with `registerEnglish(...)`.
- Every package export has a `size-limit` budget; raise it only on purpose and say why.
- Docs pages need a `## Props` table and a `## Accessibility` section (or a front-matter opt-out with a reason). Adding or renaming a docs page changes `llms.txt`; nothing to regenerate by hand.
- Don't reformat files you aren't changing. Generated files (`tokens.css`, `packages/*/docs`, `llms*.txt`) come from their scripts.

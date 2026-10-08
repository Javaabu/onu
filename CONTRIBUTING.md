# Contributing

Thanks for helping build Onu. The full specification is in [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Setup

```bash
corepack enable
pnpm install
pnpm dev   # examples app at http://localhost:5173
```

## Definition of done

A component is done only when it meets REQUIREMENTS §21: light/dark, LTR/RTL, `dv` locale, `thaana` prop for free text, tokens-only colours, responsive and touch-friendly, `className`/`classNames`/`asChild` overrides, WCAG 2.2 AA with axe tests, unit tests, a showcase demo in `examples/src/showcase`, a docs page in `docs/`, and a changeset.

## Where things go

| What                             | Where                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui primitives (generated) | `packages/onu/src/ui`, via `node packages/onu/scripts/sync-shadcn.mjs`. Keep Onu patches marked with `onu:` comments. |
| Onu components                   | `packages/onu/src/components/<group>/<name>.tsx` + `<name>.test.tsx`, exported from the group's `index.ts`            |
| Heavy components                 | `packages/onu/src/{charts,maps,editor,calendar,media}` (separate entry points)                                        |
| Built-in strings                 | `packages/onu/src/locales/{en,dv}/<namespace>.ts`; never hard-code English                                            |
| Design tokens                    | `tokens.json`, then `pnpm --filter @javaabu/onu tokens`                                                               |
| Showcase demos                   | `examples/src/showcase/<group>/<name>.demo.tsx` (auto-discovered)                                                     |
| Sample pages                     | `examples/src/pages/<group>/<name>.page.tsx` (auto-discovered)                                                        |
| Docs                             | `docs/<group>/<name>.md`                                                                                              |

## Rules of thumb

- Use logical Tailwind utilities (`ms-`, `pe-`, `start-`, `text-start`, …). ESLint rejects physical `left`/`right` ones.
- Use theme tokens (`bg-primary`, `text-muted-foreground`), never raw colours.
- Use `<Icon name="…">` (from `src/icons/icon`) with semantic names, so `OnuProvider icons` overrides apply. Never render a Lucide component directly. When a component always shows the same glyph (a spinner, a close button, a chevron), also pass that Lucide icon as `fallback`, e.g. `<Icon name="loading" fallback={Loader2Icon} />`: overrides still win, and the component keeps its glyph outside `OnuProvider`.
- Never import `src/icons/lucide-map` in a component. `OnuProvider` supplies the default set, so a single component does not ship ~250 icons. ESLint and `src/icons/icon-imports.test.ts` enforce this, and `pnpm --filter @javaabu/onu size` checks the bundle budgets.
- Prefer shadcn/ui or an approved library (REQUIREMENTS §4) before building from scratch. Record new dependencies in `DEPENDENCIES.md`.
- Add a changeset: `pnpm changeset`.

## Checks

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:coverage && pnpm build
```

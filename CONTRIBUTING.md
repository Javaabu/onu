# Contributing

Thanks for helping build Onu. The full specification is in [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Setup

```bash
corepack enable
pnpm install
pnpm dev   # web app at http://localhost:5173
```

Maps in the web app use Google Maps when `VITE_GOOGLE_MAPS_API_KEY` (and optionally `VITE_GOOGLE_MAPS_MAP_ID`) is set, and the keyless placeholder otherwise. Until a Map ID is set (locally or as the `GOOGLE_MAPS_MAP_ID` secret of the demo build), the examples use Google's `DEMO_MAP_ID`, so advanced markers work. The map demos open on Javaabu's office in Malé (`JAVAABU_OFFICE` in `web/src/showcase/maps/_data.ts`). To try the real Google adapter without a key (development mode, watermarked), set `VITE_GOOGLE_MAPS_FORCE=1 VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID`. See [MapProvider](docs/maps/map-provider.md#verified-against-google-maps-js-api).

## Definition of done

A component is done only when it meets REQUIREMENTS §21: light/dark, LTR/RTL, `dv` locale, `thaana` prop for free text, tokens-only colours, responsive and touch-friendly, `className`/`classNames`/`asChild` overrides, WCAG 2.2 AA with axe tests, unit tests, a showcase demo in `web/src/showcase`, a docs page in `docs/`, and a changeset.

## Where things go

| What                 | Where                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui primitives | `packages/onu/src/ui`: Onu-owned code, started from shadcn/ui (see [shadcn/ui primitives](#shadcnui-primitives)).                           |
| Onu components       | `packages/onu/src/components/<group>/<name>.tsx` + `<name>.test.tsx`, exported from the group's `index.ts`                                  |
| Heavy components     | `packages/onu/src/{charts,maps,editor,calendar,media}` (separate entry points)                                                              |
| Built-in strings     | `packages/onu/src/locales/{en,dv}/<namespace>.ts`; never hard-code English                                                                  |
| Design tokens        | `tokens.json`, then `pnpm --filter @javaabu/onu tokens`                                                                                     |
| Showcase demos       | `web/src/showcase/<group>/<name>.demo.tsx` (auto-discovered)                                                                                |
| Sample pages         | `web/src/pages/<group>/<name>.page.tsx` (auto-discovered; shown as blocks, with preview and code, on `#/pages/<group>`)                     |
| Docs                 | `docs/<group>/<name>.md`                                                                                                                    |
| Docs for AI          | Built from `docs/` by `scripts/llms.mjs` (site root and npm package); MCP server in `packages/onu-mcp`, Claude Code plugin in `plugins/onu` |

## Rules of thumb

- Use logical Tailwind utilities (`ms-`, `pe-`, `start-`, `text-start`, …). ESLint rejects physical `left`/`right` ones.
- Use theme tokens (`bg-primary`, `text-muted-foreground`), never raw colours.
- Use `<Icon name="…">` (from `src/icons/icon`) with semantic names, so `OnuProvider icons` overrides apply. Never render a Lucide component directly. When a component always shows the same glyph (a spinner, a close button, a chevron), also pass that Lucide icon as `fallback`, e.g. `<Icon name="loading" fallback={Loader2Icon} />`: overrides still win, and the component keeps its glyph outside `OnuProvider`.
- Never import `src/icons/lucide-map` in a component. `OnuProvider` loads the default set on demand, so neither a single component nor the provider ships ~250 icons. ESLint and `src/icons/icon-imports.test.ts` enforce this, and `pnpm --filter @javaabu/onu size` checks the bundle budgets.
- Built-in strings: a module that uses `t("form.…")` registers the English namespaces it uses at the top level, e.g. `registerEnglish({ form: en_form })` with `import { form as en_form } from "../../locales/en/form"`. Never import the whole locale (`src/locales`, `locales/en/messages`) in a component, so a bundle carries only the English text of the components it uses. `src/i18n/english-registry.test.ts` checks this.
- Every `package.json` export has a `size-limit` budget (`pnpm --filter @javaabu/onu size`, run in CI). When a change grows an entry on purpose, raise its budget in the same PR and say why; keep budgets a little above the measured size.
- Prefer shadcn/ui or an approved library (REQUIREMENTS §4) before building from scratch. Record new dependencies in `DEPENDENCIES.md`.
- Add a changeset: `pnpm changeset`.

## shadcn/ui primitives

The files in `packages/onu/src/ui` started as shadcn/ui's components (Radix base, nova style), but Onu owns them now. They carry Onu's RTL and Dhivehi support, translated labels, touch targets and the ProtonAnt look, and they are not re-synced with upstream as a matter of routine.

- **Edit them like any other Onu code.** Mark changes to upstream code with a short `// onu:` comment saying why, so the file still shows where it differs from shadcn.
- **Fixes come through dependencies, not syncs.** Behaviour and accessibility (keyboard, focus, ARIA, positioning) live in `radix-ui`, `cmdk`, `vaul` and the other packages these files import. Keep those up to date like any dependency.
- **Check upstream now and then, by hand.** On a shadcn/ui release that matters, or a Tailwind major version, skim the shadcn/ui changelog. Port any real fix (a missing ARIA attribute, a markup bug) as a normal change. Don't re-sync whole files: that drops Onu's changes and the diff mixes them with upstream's.
- **Use the sync script only to add a new primitive:** `node packages/onu/scripts/sync-shadcn.mjs <component>` vendors just that component (it clones shadcn/ui, or uses a local checkout with `--src`). Always name the component: run without one, it overwrites every file in `src/ui`. Then adapt it like the others (logical classes, `<Icon>`, translated strings, `onu:` comments) and add tests.

## Checks

E2E (Playwright: accessibility in five browsers, and Chromium screenshots) is slow, so CI runs it only when the last commit pushed to `main` starts with `e2e` (for example `e2e: new date picker`), or when you run the **E2E** workflow by hand from the Actions tab. Run it locally with `pnpm e2e:chromium`.

The Chromium job compares a desktop screenshot of every component demo, in light LTR and dark RTL, with baselines stored as the `visual-baselines` Actions artifact (not in git). After an intended visual change, or when you add a component, run **E2E** by hand with **Update the visual baselines** ticked. Look at the screenshots in that run's `visual-baselines` artifact before relying on them. Baselines are kept for 90 days (about 90 MB). If none are stored (the first run, or 90 days after the last update), the run takes new ones instead of comparing.

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test:coverage && pnpm build
```

## Building on a small server

Measured on 1 vCPU with no swap:

| Command          | Peak memory | Time |
| ---------------- | ----------- | ---- |
| `pnpm build`     | ~450 MB     | ~15s |
| `pnpm build:web` | ~800 MB     | ~12s |

The package build fits a 1 GB server. Its type declarations are emitted one entry point at a time without type checking (`pnpm typecheck` does that).

The web app needs most of 1 GB on its own, so on a 1 GB server add swap first, or serve the prebuilt `demo-dist` branch:

```bash
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

Running `node scripts/build.mjs` in `web/` instead of `pnpm build:web` saves the ~75 MB that pnpm itself holds during the build.

## Releasing

Every change that affects a published package adds a changeset (`pnpm changeset`). Work happens on `dev`; pushes there run no workflows, so merge to `main` in batches.

To release:

1. On `dev`, run `pnpm changeset version`. It bumps every package with pending changesets, writes their `CHANGELOG.md` and deletes the changesets. All packages share one version, so check that `packages/onu` and `packages/onu-mcp` match.
2. Commit (`Release v0.1.0`) and merge `dev` into `main`. Wait for CI to pass on `main`.
3. Tag that commit on `main` and push the tag: `git tag v0.1.0 && git push origin v0.1.0`.

The **Release** workflow runs only for `v*` tags. It checks that the tagged commit is on `main` and that every package's version matches the tag, then builds and publishes to npm (versions already on npm are skipped). Tags with a pre-release suffix (`v1.0.0-beta.1`) publish under the `next` dist-tag.

Publishing needs an `NPM_TOKEN` repository secret: an npm granular access token with read and write access to the `@javaabu` scope and "bypass 2FA" allowed, from an account that can publish to `@javaabu`. Write tokens expire after about 90 days. Provenance is signed only once the repository is public. After the first release, you can switch to npm trusted publishing (each package's settings on npmjs.com, pointing at `release.yml`) and remove the token.

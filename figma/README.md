# Figma kit

The Onu Figma library mirrors the React components one-to-one (REQUIREMENTS §3, R3.11–R3.17). It lives in the Onu
Figma file, [Claudius](https://www.figma.com/design/hilfEQCV33vZNet92CWRJp/Claudius).

| Piece        | How                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kit          | The **Onu kit** plugin (`figma/plugin`) generates variables, text styles, icons, component sets and sample frames in the file from `tokens.json` and updates them in place when re-run. Figma's REST API cannot create components, so this is a plugin. |
| Tokens       | `tokens.json` (repo root) is the source of truth. The plugin creates the variables on any paid plan; `node figma/sync-variables.mjs` pushes the same variables over the REST API (Enterprise only). `figma/tokens-studio.json` is for Tokens Studio.    |
| Components   | Component properties use the same names and values as the React props and `cva` variants (`variant`, `size`, `checked`, …), plus `state` (hover, focus, error, disabled) and `dir` (ltr, rtl) where layout differs.                                     |
| Code Connect | `figma/code-connect/*.figma.tsx` link Figma components to the React components so Dev Mode shows Onu code. The plugin prints the node URLs; `apply-node-ids.mjs` writes them to `figma/components.json`.                                                |
| Sample pages | The plugin builds an admin dashboard (light and dark) and an application form (LTR and RTL) from kit instances only.                                                                                                                                    |
| Versioning   | Each npm release notes the matching kit version in `CHANGELOG.md`. Token or component changes land in both in the same release.                                                                                                                         |

## Generate the kit (designers)

You need the Figma **desktop app** (development plugins do not run in the browser) and edit access to Claudius.

1. Get this repository (or just the `figma/plugin` folder: `manifest.json`, `code.js` and `ui.html`). The built
   `code.js` is committed, so there is nothing to build.
2. Open Claudius in the Figma desktop app.
3. Menu → **Plugins → Development → Import plugin from manifest…** and pick `figma/plugin/manifest.json`.
4. Run it: **Plugins → Development → Onu kit**.
5. Leave the brand colour as it is (it comes from `tokens.json`) unless you are trying a different brand, keep
   "Build sample frames" ticked, and press **Generate / update kit**. A full run takes a minute or two.
6. When it finishes, the plugin shows a JSON block. Press **Copy JSON** and save it (e.g. as `onu-kit.json`) for the
   Code Connect steps below.

Re-run the plugin whenever `tokens.json` or the kit changes (pull the latest `figma/plugin` first). It finds
variables, styles, pages, component sets, variants and sample frames by name and rebuilds them in place, so node
ids, instances and library links stay intact; nothing is duplicated. Edits made by hand inside kit components are
overwritten on the next run; build your own components from instances instead.

### What it generates

- **Variables** (Plugin API, works on every paid plan):
  - `Onu / Color` (modes Light, Dark): `brand/primary`, the derived steps `brand/primary-1` … `brand/primary-8`,
    `brand/primary-foreground`, `-hover`, `-active` (computed as in `theme.css`; Figma variables cannot mix colours,
    so change the brand in `tokens.json` or the plugin's brand field and re-run), and every semantic colour as
    `semantic/<name>` (`semantic/background`, `semantic/border`, `semantic/preset-blue`, …).
  - `Onu / Density` (Default, Compact, Comfortable, Touch): `spacing/unit` and the steps the kit uses
    (`spacing/1` … `spacing/16`, `spacing/3_75` for Tailwind's 3.75). Paddings, gaps and control heights are bound to
    these, so switching a frame's Density mode resizes the components inside it.
  - `Onu / Shape`: `radius/base`, `radius/sm` … `radius/4xl`, `size/label-width`, `size/touch-target`.
  - Each variable's Web code syntax is the CSS variable (`var(--border)`, `calc(var(--spacing) * 2)`), so Dev Mode
    shows the right token.
- **Text styles**: `UI/<size>/<weight>` (Inter), `Thaana/<size>/<weight>` (MV Waheed, else Faruma, else Noto Sans
  Thaana; line height 1.75) and `Mono/<size>` (JetBrains Mono), on Onu's scale: 14px/22px body (`UI/sm`), 12, 16, 18,
  20, 24, 30 and 38px. Fonts that are missing in Figma fall back without failing; the plugin lists the fallbacks.
  Install MV Waheed or Faruma locally before running if you have them.
- **Pages**: Cover, Foundations (colours, type, spacing and radius, the Lucide icons used by the kit), Inputs,
  Display, Navigation, Overlays, Data and Samples.
- **Component sets** (auto layout, bound to the variables):

  | Page       | Components                                                                                                             |
  | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
  | Inputs     | Button, IconButton, TextInput (with FormField label, help, error), Textarea, Select (trigger), Checkbox, Radio, Switch |
  | Display    | Badge, Tag, StatusBadge, Alert (Callout), Card, Avatar (UserAvatar)                                                    |
  | Navigation | Tabs (+ Tabs / Tab), Breadcrumbs, Pagination, AppSidebar (+ AppSidebar / Item), AppHeader                              |
  | Overlays   | Tooltip (Tip), Dialog (Modal), Toast                                                                                   |
  | Data       | StatTile, DataTable (+ Table / Row)                                                                                    |

  Each set's description shows the React usage. Variant properties carry the React names and values (Button:
  `variant` default, outline, dashed, secondary, ghost, destructive, link, success, warning; `size` default, xs, sm,
  lg; Tag: `variant`, `color`, `size`; StatusBadge: `status`; …). Text, boolean and instance-swap properties follow
  the props too (`children`, `loading`, `startIcon` + `startIcon glyph`, `label`, `help`, `error`, `required`, …).
  `state` and `dir` are Figma-only. RTL variants hold Dhivehi sample copy in Thaana and are edited directly: a Figma
  text property has one value for every variant, so only LTR variants expose text properties.

## Publish the library

1. In Claudius, open the **Assets** panel → **Libraries** (book icon) → **Publish…**. Publish the variables, text
   styles and components (the helper sets such as `Tabs / Tab` can stay published; they are needed by the others).
2. In product files, enable the Onu library from **Assets → Libraries**, and accept updates after each re-run.

## Link the components to code (Code Connect)

Publishing Code Connect needs a Figma **Organization or Enterprise** plan and a personal access token with the
Code Connect write scope.

1. Save the JSON the plugin printed (step 6 above), then merge its node URLs into `figma/components.json`:

   ```sh
   node figma/apply-node-ids.mjs onu-kit.json
   # or straight from the clipboard on macOS: pbpaste | node figma/apply-node-ids.mjs -
   ```

   It fills `figmaUrl` for the components the kit covers and reports keys it does not know. A plain map of
   `{ "components.json key": "12:34" }` works too (add `--file-key <key>` for another file).

2. Generate the Code Connect files and refine the generated property mappings where needed:

   ```sh
   node figma/generate-code-connect.mjs
   ```

3. Publish them:

   ```sh
   npx figma connect publish --token "$FIGMA_TOKEN"
   ```

Dev Mode then shows the Onu import and usage for each linked component.

## Developing the plugin

```sh
pnpm figma:plugin        # build figma/plugin/code.js (commit it with the source)
pnpm figma:test          # unit tests: the generator against a mocked figma API, idempotency, bundle freshness
pnpm --filter onu-figma typecheck
pnpm --filter onu-figma icons   # regenerate src/icons.generated.ts from lucide-react
```

`figma/plugin/src` is TypeScript against `@figma/plugin-typings`, bundled with rolldown. `tokens.json` and the
`@javaabu/onu` version are embedded at build time, so rebuild after changing either. The colour maths and variable
specs live in `figma/shared/tokens.mjs`, shared with `sync-variables.mjs`. To add a component, add a `KitComponent`
to one of `src/kit/*.ts` (variants named as in the React source) and give it the `components.json` key it maps to.

# Figma kit

The Onu Figma library mirrors the React components one-to-one (REQUIREMENTS §3, R3.11–R3.17).

| Piece        | How                                                                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens       | `tokens.json` (repo root) is the source of truth. `node figma/sync-variables.mjs` pushes it to Figma Variables (Light/Dark colour modes, density modes, one `brand/primary` variable). Without Variables REST API access, import `figma/tokens-studio.json` with the Tokens Studio plugin.   |
| Components   | Every build-list component has a Figma component whose properties use the same names and values as the React props and `cva` variants (`variant`, `size`, `state`, `density`). LTR and RTL variants where layout differs. Text styles for Inter, MV Waheed and JetBrains Mono. Lucide icons. |
| Code Connect | `figma/code-connect/*.figma.tsx` link Figma components to the React components so Dev Mode shows Onu code. Fill in each component's Figma node URL in `figma/components.json`, then run `npx figma connect publish`.                                                                         |
| Sample pages | The sample pages in `examples/src/pages` exist as Figma frames built only from kit components.                                                                                                                                                                                               |
| Versioning   | Each npm release notes the matching kit version in `CHANGELOG.md`. Token or component changes land in both in the same release.                                                                                                                                                              |

## Status

The token sync and the Code Connect setup live in this folder. The Figma file itself has to be created in Javaabu's Figma workspace (see REQUIREMENTS §24, open question 5); once it exists, set `FIGMA_FILE_KEY` and the component node URLs.

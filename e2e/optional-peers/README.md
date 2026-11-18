# Optional peers fixture

A Next.js app that uses `@javaabu/onu`, `@javaabu/onu/charts` (Recharts only) and
`@javaabu/onu/export` with **none** of the optional peers that Onu loads on demand
(deck.gl, `@vis.gl/react-google-maps`, `write-excel-file`, …) installed.

It is not part of the pnpm workspace on purpose: inside the workspace every peer
resolves from the monorepo, which hides a missing one. `scripts/check-optional-peers.mjs`
packs the library, installs this app from the tarball in a temporary folder and builds
it with webpack and with Turbopack.

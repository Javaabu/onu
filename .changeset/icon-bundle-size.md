---
"@javaabu/onu": minor
---

Smaller single-component bundles: `<Icon>` no longer imports the full Lucide map (~250 icons). `OnuProvider` supplies the default set through the icon context, and components with fixed glyphs (Button's loading spinner, Spinner, the shadcn primitives' close buttons, chevrons and checks) pass their Lucide icon as the new `fallback` prop, so they keep working outside `OnuProvider` and `OnuProvider icons` overrides still win. Importing only `Button` drops from 20.7 kB to 11.9 kB (brotli), `FormField` + `TextInput` from 37.2 kB to 28.2 kB. The `Icon` exported from the package root still resolves every name anywhere. Outside `OnuProvider`, names chosen at runtime inside components (e.g. `<Button startIcon="add">`) now show the generic icon. Wrap your app in `OnuProvider`, as the installation guide says.

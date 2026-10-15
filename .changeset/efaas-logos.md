---
"@javaabu/onu": minor
---

eFaas logos: new `EfaasLogo` with all 22 official logos from eFaas's brand kit (`variant={1…22}`, plus `EFAAS_LOGO_VARIANTS` describing each), and `EfaasButton` takes `logoVariant` to switch between them. By default the button now shows the official icon made for its colour (15 on blue, 14 on black, 9 on white). Icon marks sit before the label; logos with a wordmark replace the visible label, which stays the accessible name. The icon marks are bundled; the wordmark logos load on first use (~40 kB compressed).

---
"@javaabu/onu": minor
---

Brand assets for Maldivian payments and sign-in (R16.7, R16.8). New `BmlTransferLogo` and `BmlConnectLogo`: BML's official logos (the BML mark, and the BML Connect logo with the Visa, Mastercard and American Express marks) as accessible inline SVG components with per-instance gradient ids; the BML Connect wordmark falls back to a bold system sans-serif when Gilroy is not loaded and always runs left to right. `PaymentMethodSelector` now shows these logos for BML Transfer and BML Connect on a white tile (light and dark mode) instead of placeholder icons; project-defined methods keep the neutral placeholder. New `EfaasButton`: "Sign in with eFaas" / "Register with eFaas" (English and Dhivehi) in the eFaas colours (blue `#164998`, black `#333333`, white), Poppins Medium / Mv Waheed when loaded, rounded or square corners, icon-only and loading states, as a plain link (`href`) or a button; pass the eFaas icon from eFaas's brand kit as `logo`.

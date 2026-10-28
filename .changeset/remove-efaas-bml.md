---
"@javaabu/onu": minor
---

`EfaasButton`, `EfaasLogo`, `PaymentMethodSelector`, `BmlTransferLogo` and `BmlConnectLogo` are removed, with their types, `EFAAS_LOGO_VARIANTS` and the `auth.efaas*`, `choice.paymentMethod` and `choice.bml*` strings. Provider branding follows each provider's own guidelines and assets, so it belongs in the app.

`SignInForm`'s `efaas` slot is renamed `sso` (data slot `auth-sso`): `<SignInForm sso={<LinkButton href="/login/efaas" variant="outline" className="w-full">Sign in with eFaas</LinkButton>} />`. For a payment choice, use a card radio group:

```tsx
<RadioGroup
  variant="card"
  options={[
    { value: "bml-transfer", label: "Bank transfer", description: "…", media: <img src={bmlLogo} alt="" /> },
    { value: "bml-connect", label: "Card", description: "…", media: <Icon name="credit-card" /> },
  ]}
/>
```

---
title: Payment method selector
sidebar_position: 15
---

Choose how to pay: **BML Transfer** (bank transfer to a Bank of Maldives account, usually followed by a slip upload) and/or **BML Connect** (BML's online card gateway), as a radio group of large cards (R16.8). It is **selection only**: redirects, callbacks and slip uploads belong to your app.

```tsx
import { PaymentMethodSelector } from '@javaabu/onu';

<PaymentMethodSelector value={method} onValueChange={setMethod} />

<PaymentMethodSelector
  methods={[
    { id: 'bml-connect', label: { en: 'Pay by card', dv: 'ކާޑުން ފައިސާ ދައްކާ' }, logo: <img src={bmlConnectLogo} alt="" /> },
    'bml-transfer',
  ]}
  defaultValue="bml-connect"
/>
```

:::warning

Onu does not ship BML logos. Each card shows a neutral placeholder until you pass the logo supplied by BML (under BML's branding guidelines) through `logo`.

:::

## Props

All [Radio group](./radio-group) props except `options`/`variant`, plus:

| Prop                     | Type                                                         | Default | Description                    |
| ------------------------ | ------------------------------------------------------------ | ------- | ------------------------------ |
| `methods`                | `("bml-transfer" \| "bml-connect" \| PaymentMethodConfig)[]` | both    | Which gateways, in this order  |
| `value` / `defaultValue` | `PaymentMethodId`                                            |         |                                |
| `onValueChange`          | `(id) => void`                                               |         |                                |
| `size`                   | `"default" \| "lg"`                                          | `"lg"`  | Large touch targets by default |

```ts
interface PaymentMethodConfig {
  id: "bml-transfer" | "bml-connect"
  label?: string | { en?: string; dv?: string } // per locale
  description?: string | { en?: string; dv?: string }
  logo?: ReactNode
  aside?: ReactNode // e.g. a fee
  disabled?: boolean
}
```

Default labels and descriptions come from the `choice` locale namespace in English and Dhivehi.

## Accessibility

A `radiogroup` named "Payment method" (or your FormField label). Arrow keys move between cards (RTL aware); Space selects. Cards are at least 80px tall on touch screens.
